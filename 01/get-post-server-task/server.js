/**
 ЗАДАЧА
 Написать HTTP-сервер для загрузки и получения файлов
 - Все файлы находятся в директории files
 - Структура файлов НЕ вложенная.

 - Виды запросов к серверу
   GET /file.ext
   - выдаёт файл file.ext из директории files,

   POST /file.ext
   - пишет всё тело запроса в файл files/file.ext и выдаёт ОК
   - если файл уже есть, то выдаёт ошибку 409
   - при превышении файлом размера 1MB выдаёт ошибку 413

 Вместо file может быть любое имя файла.
 Так как поддиректорий нет, то при наличии / или .. в пути сервер должен выдавать ошибку 400.

- Сервер должен корректно обрабатывать ошибки "файл не найден" и другие (ошибка чтения файла)
- index.html или curl для тестирования

 */

// Пример простого сервера в качестве основы

'use strict';

const http = require('http')
const url = require('url')
const fs = require('fs')
const path = require('path')
const mime = require('mime')
const sendFile = require('./sendFile')
const storeFile = require('./storeFile')
const config = require('config')


module.exports = http.createServer(function(req, res) {
  const u = url.parse(req.url, true)
  const pathname = decodeURI(u.pathname).replace(/^\s+|\s+$/, '')    
  
  //possible multiline malicious code
  if (pathname.indexOf('\0') > -1) {
    res.statusCode = 400
    res.end("Possibly malicious request")
    return
  }

  const filePath = path.normalize(path.join(config.get('filesDir'), pathname))

  switch(req.method) {
    case 'GET':
      if (pathname == '/') {
        sendFile(config.get('serverUiPage'), res, console) //on root send UI html
      }      
      else {        
        //stepping out of allowed folder
        if (filePath.indexOf(__dirname) != 0) {
          res.statusCode = 404
          res.end("Not found")
          return
        }

        console.log('Starting download...')          
        sendFile(filePath, res, console, u.query.attachment === 'on')                        
      }
      break

    case 'POST':      
      if (!filePath || !filePath.length) {
        res.statusCode = 404
        res.end("File name was not specified")
        return
      }
      //stepping out of allowed folder
      if (filePath.indexOf(__dirname) != 0) {
        res.statusCode = 404
        res.end("Not found")
        return
      }      

      console.log('Saving file...')          
      storeFile(req, res, filePath, console)
      break

    default:
      res.statusCode = 501
      res.end(`Verb [${req.method}] is not implemented`)
  }

})
