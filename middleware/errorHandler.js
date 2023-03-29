const { logEvents } = require('./logger')

// our error handler has access to the error object
const errorHandler = (err, req, res, next) => {
    // saves error log to the error log file
    logEvents(`${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'errLog.log')
    console.log(err.stack)

    const status = res.statusCode ? res.statusCode : 500 // server error 

    res.status(status)

    res.json({ message: err.message }) 
}

module.exports = errorHandler 