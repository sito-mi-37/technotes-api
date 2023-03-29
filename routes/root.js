const express = require('express')
const router = express.Router()
const path = require('path')


// the regEx in the endpoint below means check for only / or /index, like you guessed, we made the .html optional 
router.get('^/$|/index(.html)?', (req, res) => {
    // we send the file afterward using path.join(__dirname, '..' means leave the route directory,
    //  'views' means locate the views folder, 'index.html' this is the file we are sending in response)
    res.sendFile(path.join(__dirname, '..', 'views', 'index.html'))
})

module.exports = router