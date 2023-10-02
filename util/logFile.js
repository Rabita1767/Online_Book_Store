const path = require("path");
const fs = require("fs");
const logFilePath = './server/log.txt';
class logFile {
    createLogFile(route, message) {
        const time = new Date().toISOString();
        const logMessage = `${time} - Route: ${route} - ${message}\n`;
        fs.appendFile(logFilePath, logMessage, (err) => {
            if (err) {
                console.error('Error writing the file:', err);
            }
        });
    }

}
module.exports = new logFile();