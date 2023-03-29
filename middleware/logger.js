const { format } = require('date-fns')
const { v4: uuid } = require('uuid')
const fs = require('fs')
const fsPromises = require('fs').promises
const path = require('path')



// This function takes a message and stores it in file 'logFileName'
const logEvents = async (message, logFileName) => {
    // here we use date-fns module to say how our date time would look
    const dateTime = format(new Date(), 'yyyyMMdd\tHH:mm:ss')
  
    // here we define what we want to store and the structure
    // here \t means tab (space between) so we can easily import them in excel
    // here \n means new line for every log item
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`

    try {
        // we check if logs directory exist and if it doesnt we create one 
         if (!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
            await fsPromises.mkdir(path.join(__dirname, '..', 'logs'))
        }
        // we then append the log item in the logFile
        await fsPromises.appendFile(path.join(__dirname, '..', 'logs', logFileName), logItem)
    } catch (err) {
        console.log(err)
    }
}

// heres our middleware  the 'logger' function 
const logger = (req, res, next) => {
    // we called the logEvents and passed a formated message and the fileName 

    logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, 'reqLog.log')
    console.log(`${req.method} ${req.path}`)

    next()
}

module.exports = { logEvents, logger }