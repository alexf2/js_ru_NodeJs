const config = require('config')
const mongoose = require('mongoose')
mongoose.Promise = require('bluebird')

// вместо MongoError будет выдавать ValidationError (проще ловить и выводить)
mongoose.plugin(require('mongoose-beautiful-unique-validation'))
// mongoose.set('debug', true)

mongoose.plugin(schema => {
  if (!schema.options.toObject) {
    schema.options.toObject = {}
  }

  if (schema.options.toObject.transform == undefined) {
    schema.options.toObject.transform = (doc, ret) => {
      delete ret.__v
      return ret
    }
  }  
})

console.log( 'Using Conn: ' + config.get('connectionString') )

mongoose.connect(config.get('connectionString'), {
    server: {
        socketOptions: {
            keepAlive: 1
        },
        poolSize: 7
    }
})

module.exports = mongoose