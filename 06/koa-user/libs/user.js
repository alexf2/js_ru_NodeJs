const mongoose = require('./db-context')

// uniqueValidator validation is not atomic! unsafe!
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: "Не указан E-Mail",
    validate: [
      {
        validator(value) {
          return /^[-.\w]+@([\w-]+\.)+[\w-]{2,12}$/.test(value);
        },
        msg: 'Некорректный email'
      }
    ],
    unique: "Такой E-Mail уже существует"
  },

  displayName: {
    type: String,
    required: "Пустое имя пользователя",
    unique: "Такое имя уже существует"
  }
}, 

{
  timestamps: true,
  /* @see mongoose
  toPOCO: {
    transform(doc, ret) {
      // remove the __v of every document before returning the result
      delete ret.__v;
      return ret;
    }
  }*/
})

userSchema.statics.publicFields = ['email', 'displayName']

module.exports = mongoose.model('User', userSchema)
