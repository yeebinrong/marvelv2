// load libraries
const express = require('express')
const handlebars = require('express-handlebars')
const fetch = require('node-fetch')
const withQuery = require('with-query').default
const md5 = require('md5')

// create an instance of express
const app = express()

// configure handlebars
app.engine('hbs',
    handlebars({
        defaultLayout: 'template.hbs'
    })
)
app.set('view engine', 'hbs')

// declare variables
const ENDPOINT = 'https://gateway.marvel.com/v1/public/characters'
const API_KEY = process.env.MARVEL_API
const PAPI_KEY = process.env.MARVEL_PAPI

const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000

const LIMIT = 12

// declare cache
const cache = []

// load resources
app.use(express.static(`${__dirname}/static`))

// ### GET route ####
app.get('/detail/:name/:id/comics', async (req, resp) => {
    const name = req.params.name
    const id = req.params.id
    const offset = parseInt(req.query.offset) || 0
    const type = 'comics'
    const ts = new Date().getTime()
    const hash = md5(ts + PAPI_KEY + API_KEY)
    const params = {    
        ts,
        apikey : API_KEY,
        hash,
        offset,
        limit: LIMIT
    }
    const ep = `${ENDPOINT}/${id}/${type}`
    const results = await getMarvelAPI(params, ep, id)

    resp.status(200)
    resp.type('text/html')
    resp.render('detailed',
        {
            title : '| Comics |',
            results,
            id,
            name,
            type,
            offset,
            limit: LIMIT,
            prevOffset: Math.max(offset - LIMIT),
            nextOffset: offset + LIMIT
        }
    )
})

app.get('/detail/:name/:id/series', async (req, resp) => {
    const name = req.params.name
    const id = req.params.id
    const offset = parseInt(req.query.offset) || 0
    const type = 'series'
    const ts = new Date().getTime()
    const hash = md5(ts + PAPI_KEY + API_KEY)
    const params = {    
        ts,
        apikey : API_KEY,
        hash,
        offset,
        limit: LIMIT
    }
    const ep = `${ENDPOINT}/${id}/${type}`
    const results = await getMarvelAPI(params, ep, id)

    resp.status(200)
    resp.type('text/html')
    resp.render('detailed',
        {
            title : '| Series |',
            results,
            id,
            name,
            type,
            offset,
            limit: LIMIT,
            prevOffset: Math.max(offset - LIMIT),
            nextOffset: offset + LIMIT
        }
    )
})

app.get('/detail/:name/:id/stories', async (req, resp) => {
    const name = req.params.name
    const id = req.params.id
    const offset = parseInt(req.query.offset) || 0
    const type = 'stories'
    const ts = new Date().getTime()
    const hash = md5(ts + PAPI_KEY + API_KEY)
    const params = {    
        ts,
        apikey : API_KEY,
        hash,
        offset,
        limit: LIMIT
    }
    const ep = `${ENDPOINT}/${id}/${type}`
    const results = await getMarvelAPI(params, ep, id)

    resp.status(200)
    resp.type('text/html')
    resp.render('detailed',
        {
            title : '| Stories |',
            results,
            id,
            name,
            type,
            offset,
            limit: LIMIT,
            prevOffset: Math.max(offset - LIMIT),
            nextOffset: offset + LIMIT
        }
    )
})

app.get('/detail/:name/:id/events', async (req, resp) => {
    const name = req.params.name
    const id = req.params.id
    const offset = parseInt(req.query.offset) || 0
    const type = 'events'
    const ts = new Date().getTime()
    const hash = md5(ts + PAPI_KEY + API_KEY)
    const params = {    
        ts,
        apikey : API_KEY,
        hash,
        offset,
        limit: LIMIT
    }
    const ep = `${ENDPOINT}/${id}/${type}`
    const results = await getMarvelAPI(params, ep, id)

    resp.status(200)
    resp.type('text/html')
    resp.render('detailed',
        {
            title : '| Events |',
            results,
            id,
            name,
            type,
            offset,
            limit: LIMIT,
            prevOffset: Math.max(offset - LIMIT),
            nextOffset: offset + LIMIT
        }
    )
})

app.get('/search', async (req, resp) => {
    const q = req.query.q
    const offset = parseInt(req.query.offset) || 0
    const ts = new Date().getTime()
    const hash = md5(ts + PAPI_KEY + API_KEY)

    const params = {    
        ts,
        apikey : API_KEY,
        hash,
        nameStartsWith : q,
        offset,
        limit: LIMIT
    }
    const results = await getMarvelAPI(params, ENDPOINT, q)

    resp.status(200)
    resp.type('text/html')
    resp.render('search',
        {
            title: '| Results |',
            q,
            results,
            prevOffset: Math.max(offset - LIMIT),
            nextOffset: offset + LIMIT
        }
    )
})

app.get('/', (req, resp) => {
    resp.status(200)
    resp.type('text/html')
    resp.render('index',
        {
            title: '| MARVEL |'
        }
    )
})

// ## REDIRECT ##
// app.use((req, resp) => {
//     resp.redirect('/')
// })



// ### FUNCTIONS ###
function mkMarvelURL(ep, params) {
    const f = (q) => {
        let result

        const ts = new Date().getTime()
        const hash = md5(ts + PAPI_KEY + API_KEY)
        const URL = withQuery(ep, params)
        console.info(URL)
        return URL
    }

    return f
}

function getMarvelAPI(params, ep, q) {
    let result

    const getURL = mkMarvelURL(ep, params)
    
    if (cache[q]) {
        console.info('cache retrieved')
        return cache[q]
    }
    else {
        results = 
        fetch(getURL(q))
            .then ((data) => {
                const dataArray = data.json()
                return dataArray
            })
            .then ((dataArray) => {
                if (dataArray['data'])
                {
                    const results = dataArray['data']['results']
                    cache[params] = results
                    return results
                }
                else {
                    console.info("returned")
                    cache[q] = []
                    return
                }
            })
            .catch ((e) => {
                console.error("Error fetching URL: ", e)
            })        
    }
    
    return results
}

app.listen(PORT, () => {
    console.info(`Application listening PORT ${PORT} at ${new Date()}.`)
})