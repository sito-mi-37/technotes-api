require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const {logger, logEvents} = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')
const corsOptions = require('./config/corsOptions')
const mongoose = require('mongoose')
const connectDb = require('./config/dbConn')
const PORT = process.env.PORT || 3500


connectDb()

app.use(logger)

app.use(cors(corsOptions))

app.use(express.json())

// cookieParser is a third party middleware that helps us parse any cookie we receive
app.use(cookieParser())

app.use('/', express.static(path.join(__dirname, 'public')))

app.use('/', require('./routes/root'))
app.use('/users', require('./routes/userRoute'))
app.use('/auth', require('./routes/authRoute'))
app.use('/notes', require('./routes/noteRoute'))

app.all('*', (req, res) => {
    res.status(404)
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if (req.accepts('json')) {
        res.json({ message: '404 Not Found' })
    } else {
        res.type('txt').send('404 Not Found')
    }
})

// we placed this middleware at the bottom because we want to capture all error in the Api
app.use(errorHandler)

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB')
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})

mongoose.connection.on('error', err => {
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})