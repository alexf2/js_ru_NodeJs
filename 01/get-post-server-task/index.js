const server = require('./server')
const config = require('config')

const port = config.get('port')
const host = config.get('host')

server.on('clientError', (err, socket) => {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n')
})
.listen(port, host, _ => console && console.log(`Listening at: http://${host}:${port}/`))
