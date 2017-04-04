if (process.env.TRACE) {
  require('./libs/trace');
}

const config = require('config')
const appBuilder = require('./web-app-builder')
const userService = require('./user-service')
const Koa = require('koa')

appBuilder.buildUp(new Koa(), config.get('waresFolder'), config.get('traceBuid'))
    .then( res => {
        console.log('Adding users service')
        res.use(userService).listen(config.get('port'))
        console.log(`Listening on: ${config.get('port')}`)
    })
    .catch( err => {
        console.log(err)
    })


