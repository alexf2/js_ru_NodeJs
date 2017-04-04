const path = require('path')

module.exports = {
     secret: 'secretWord',
     port: 3000,
     connectionString: 'mongodb://localhost/test-user-db',
     waresFolder: path.join(process.cwd(), '/middlewares'),
     traceBuid: true
 }
