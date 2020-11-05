// load libraries
const express = require('express')
const md5 = require('md5')
const withQuery = require('with-query').default
const fetch = require('node-fetch')

// declare variables
const ENDPOINT = 'https://gateway.marvel.com/v1/public/characters'
const API_KEY = process.env.MARVEL_API
const PAPI_KEY = process.env.MARVEL_PAPI
const ts = new Date().getTime()
const hash = md5(ts + PAPI_KEY + API_KEY)
const LIMIT = 12
let params = {
    apikey : API_KEY,
    limit: LIMIT,    
    ts,
    hash
}
const typeArray = ['comics', 'series', 'stories', 'events']
const root = '/marvel'

// declare cache
const cache = []

module.exports = function () {
    const router = express.Router()

    // RESULTS PAGE
    router.get('/detail/:name/:id/:type/q', async (req, resp, next) => {
        // set params
        const name = req.params.name
        const id = req.params.id
        const offset = parseInt(req.query.offset) || 0
        const type = req.params.type

        // check if :type is a valid input
        const checker = typeArray.find(a =>
            a.includes(type))
        
        if (checker) {
            params.offset = offset
            if (params.nameStartsWith)
                delete params.nameStartsWith
            const ep = `${ENDPOINT}/${id}/${type}`
            const getURL = mkMarvelURL(ep)
            const URL = getURL(params)

            const results = await getMarvelAPI(URL, id)
            
            resp.status(200)
            resp.type('text/html')
            resp.render('detailed',
                {
                    title : '| Comics |',
                    results,
                    id,
                    name,
                    type,
                    typeArray,
                    offset,
                    limit: LIMIT,
                    prevOffset: Math.max(offset - LIMIT),
                    nextOffset: offset + LIMIT,
                    root
                }
            )
        }
        else {
            next()
        }
    })

    // SEARCH PAGE
    router.get('/search', async (req, resp) => {
        const q = req.query.q
        const offset = parseInt(req.query.offset) || 0

        params.offset = offset
        params.nameStartsWith = q

        const getURL = mkMarvelURL(ENDPOINT)
        const URL = getURL(params)
        const results = await getMarvelAPI(URL, q)

        resp.status(200)
        resp.type('text/html')
        resp.render('search',
            {
                title: '| Results |',
                q,
                results,
                prevOffset: Math.max(offset - LIMIT),
                nextOffset: offset + LIMIT,
                root
            }
        )
    })

    // HOME PAGE
    router.get('/', (req, resp) => {
        resp.status(200)
        resp.type('text/html')
        resp.render('index',
            {
                title: '| MARVEL |',
                root
            }
        )
    })

    // ## REDIRECT ##
    router.use((req, resp) => {
        resp.redirect('/main/')
    })

    // ### FUNCTIONS ###
    function mkMarvelURL(ep) {
        const f = (params) => {
            let result
            const URL = withQuery(ep, params)
            return URL
        }
        return f
    }

    function getMarvelAPI(URL, q) {
        let result 
 
        if (cache[URL]) {
            console.info('cache retrieved')
            return cache[URL]
        }
        else {
            console.info(URL)
            results = 
            fetch(URL)
                .then ((data) => {
                    const dataArray = data.json()
                    return dataArray
                })
                .then ((dataArray) => {
                    if (dataArray['data'])
                    {
                        const results = dataArray['data']['results']
                        cache[URL] = results
                        return results
                    }
                    else {
                        console.info("returned")
                        cache[URL] = []
                        return
                    }
                })
                .catch ((e) => {
                    console.error("Error fetching URL: ", e)
                })        
        }
        return results
    }
    
    return(router)
}