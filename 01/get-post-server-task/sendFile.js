'use strict';

const config = require('config')
const fs = require('fs')
const path = require('path')
const mime = require('mime')
const breakResponse = require('./helpers').breakResponse

module.exports = (pathName, response, console = null, isAttchment = false) => {
  const baseName = path.basename(pathName)
  const mimeType = mime.lookup(pathName)  
  const charset = mime.charsets.lookup(mimeType)
  response.setHeader('Content-Type', `${mimeType}` + (charset ? `;charset=${charset}`:'') )
  if (isAttchment)
    response.setHeader('Content-Disposition', `attachment; filename=${baseName}`)

  const readStm = new fs.createReadStream(pathName)

  const sendBuffer = () => {
    const buff = readStm.read() //reads 64Kb block
    const resultFlag = buff && !response.write(buff) //tries to send out

    if (!buff)
      console && console.log('Zero read')
    else if (resultFlag)
      console && console.log('Buffer is full')

    if (resultFlag) { //if the response buffer is full
      readStm.removeListener('readable', sendBuffer) //stop read

      response.once('drain', () => { //wait for output draining
        console && console.log('Buffer has been drained')
        readStm.on('readable', sendBuffer) //start reading again
        sendBuffer() //push next data
      })
    }
  }

  //client connection was broken, so we need to free resources
  response.on('close', () => {
    console && console.log('Client disconncted')
    readStm.destroy()
  })   
  
  readStm.on('error', (err) => {
    console && console.log(`Error happened: ${err.message}`)
    if (err.code === "ENOENT")
      breakResponse(response, 404, `File ${baseName} not found`)
    else
      breakResponse(response, 500, `Error happened: ${err.message}`)
  })  
  //normal finish
  .on('end', () => {
    console && console.log(`File ${baseName} finished`)
    response.end()
  })
  .on('readable', sendBuffer) //starting read  
}

