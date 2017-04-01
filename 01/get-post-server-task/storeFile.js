const fs = require('fs')
const path = require('path')
const config = require('config')
const breakResponse = require('./helpers').breakResponse

const limitBytes = config.get('uploadLimitBytes')

//http://qnimate.com/stream-file-uploads-to-storage-server-in-node-js/

module.exports = (request, response, pathName, console = null) => {
    //response.end(`accepted: ${path.basename(pathName)}`)    
    const baseName = path.basename(pathName)

    const lenHeader = request.headers['content-length']
    if (lenHeader && !isNaN(lenHeader)) {
        if (parseInt(lenHeader) > limitBytes) {
            console && console.log('Length exceeded 1')
            breakResponse(response, 413, `File ${baseName} should not be longer, than ${limitBytes/1024}Kb`)
            return
        }
    }    

    const removeFile = _ => {
        fs.unlink(pathName, err => {})
    }
    const writeStm = new fs.createWriteStream(pathName, {flags: 'wx'}) //do not overwrite existing file
    let bytesSent = 0

    writeStm.on('error', (err) => {
        console && console.log(`Write error happened: ${err.message}`)
        if (err.code === 'EEXIST') 
            breakResponse(response, 409, `File ${baseName} already exists`)
        else if (err.code === "ENOENT")
            breakResponse(response, 404, `File ${baseName} not found`)
        else {            
            breakResponse(response, 500, `Write error happened: ${err.message}`)                    
            removeFile()
        }
    })
    .on('close', () => { //finish - надо close, а не finish, так как finish для файла - это очистка буфера
        console && console.log(`File uploaded: ${path.basename(pathName)}`)
        response.end(`File ${path.basename(pathName)} uploaded`) //reply to the client, that we successfully finished
    })

    request.on('data', chunk => { //checking whether file exceeds our size limit
        bytesSent += chunk.length
        if (bytesSent > limitBytes) {
            console && console.log('Length exceeded 2')

            response.statusCode = 413
            response.setHeader('Connection', 'close')
            response.end(`File ${baseName} should not be longer, than ${limitBytes/1024}Kb`)

            writeStm.destroy()
            removeFile()
        }
    })
    .on('close', () => { //client connection was broken
        console && console.log('Client disconncted')
        writeStm.destroy()
        removeFile()
    })
    .on('error', (err) => { //maybe not needed as NodeJs handles TCP errors inside and closes the stream
        console && console.log(`Network error happened: ${err.message}`)
        breakResponse(response, 500, `Network error happened: ${err.message}`)
        writeStm.destroy()
        removeFile()
    })
    .pipe(writeStm)
}
