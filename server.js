'use-strict'

if ( process.env.NODE_ENV !== 'production' ) require('dotenv').config()
const mongoose = require('mongoose')
const app = require('koa')()
const bodyParser = require('koa-bodyparser')
const session = require('koa-session')
const serve = require('koa-static')
const Pug = require('koa-pug')
const pug = new Pug({
  viewPath: './views',
  debug: false,
  pretty: false,
  compileDebug: false,
  locals: '',
  app: app,
})

// MONGOOSE SETUP and CONNECT
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId
const User = mongoose.model('User', new Schema ({
  id: ObjectId,
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String
}))
mongoose.Promise = global.Promise
mongoose.connect(process.env.MONGO_URL, {})

// MIDDLEWARE
app.use(serve('./public'))
app.use(bodyParser())
app.keys = ['Shh, its a secret!']
app.use(session(app))

// ROUTES
app.use(function *(next) {
  if (this.request.path === '/' && this.request.method === 'GET') {
    this.render('home', { user: this.session.user })
  } else {
    yield next
  }
})

app.use(function *(next) {
  if (this.request.path === '/login' && this.request.method === 'GET') {
    this.render('login')
  } else {
    yield next
  }

  if (this.request.path === '/login' && this.request.method === 'POST') {
    try {
      let user = yield User.findOne({ email: this.request.body.email })
      if (!user) {
        this.render('login', { error: 'Incorrect email / password.' })
      } else {
        if (this.request.body.password === user.password) {
          this.session.user = user
          this.redirect('/')
        } else {
          this.render('login', { error: 'Incorrect email / password.' })
        }
      }
    } catch(err) {
      console.log(err)
    }
  }
})

app.use(function *(next) {
  if (this.request.path === '/logout' && this.request.method === 'GET') {
    this.session = null
    this.redirect('/')
  }
  yield next
})

app.use(function *(next) {
  if (this.request.path === '/register' && this.request.method === 'GET') {
    this.render('register')
  } else {
    yield next
  }
})

app.use(function *(next) {
  if (this.request.path === '/register' && this.request.method === 'POST') {

    const user = new User({
      firstName: this.request.body.firstName,
      lastName: this.request.body.lastName,
      email: this.request.body.email,
      password: this.request.body.password,
    })

    try {
      yield user.save()
      this.redirect('/')
    } catch(err) {
      let error = 'ERROR! Please try again.'

      if(err.code === 11000) {
        error = 'That email is already taken, please try again.'
      }

      this.render('register', { error: error })
    }
  }
})

const server = app.listen(5000, () => {
  console.log('Koa is listening, shhh... 5000')
})
