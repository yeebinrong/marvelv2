// load libraries
const express = require('express')
const handlebars = require('express-handlebars')

// create an instance of express
const app = express()

// configure handlebars
app.engine('hbs',
    handlebars({
        defaultLayout: 'template.hbs'
    })
)
app.set('view engine', 'hbs')

// declare port
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000

const router = require('./app')()

// load resources
app.use(express.static(`${__dirname}/static`))

// ### GET route ####
app.use('/marvel', router)

// ## REDIRECT ##
app.use((req, resp) => {
    resp.redirect('/marvel/')
})

app.listen(PORT, () => {
    console.info(`Application listening PORT ${PORT} at ${new Date()}.`)
})