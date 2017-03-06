const mongoose = require('mongoose')

const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const User = mongoose.model('User', new Schema({
  id: ObjectId,
  userName: String,
  email: { type: String, unique: true },
  password: { type: String, select: false },
}))

const Poll = mongoose.model('Poll', new Schema({
  id: ObjectId,
  title: String,
  options: [
    {
      title: String,
      votes: Number,
    },
  ],
  createdBy: String,
  createdDate: Date,
  voters: [String],
}))

mongoose.Promise = global.Promise
mongoose.connect(process.env.MONGO_URL, {})

module.exports = {
  User,
  Poll,
}
