'use-strict'

if ( process.env.NODE_ENV !== 'production' ) require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const session = require('koa-session')
const bodyParser = require('koa-bodyparser')
const router = require('koa-router')()
const serve = require('koa-static')
const csrf = require('koa-csrf')
const Pug = require('koa-pug')
const app = require('koa')()

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
  userName: String,
  email: { type: String, unique: true },
  password: { type: String, select: false }
}))
const Poll = mongoose.model('Poll', new Schema ({
  id: ObjectId,
  title: String,
  options: [
    {
      title: String,
      votes: Number
    }
  ],
  createdBy: String,
  createdDate: Date
  //pollExpires: Date
}))
mongoose.Promise = global.Promise
mongoose.connect(process.env.MONGO_URL, {})

// MIDDLEWARE
app.use(serve('./public'))
app.use(bodyParser())
app.keys = [process.env.SESSION_SECRET]
app.use(session(app))
csrf(app)
app.use(csrf.middleware)
app.use(router.routes())
app.use(router.allowedMethods())

// ROUTES
app.use(function *(next) {
  if (this.request.path === '/' && this.request.method === 'GET') {
    if (!this.session.user) {
      const openPolls = yield Poll.findOne()
      this.render('home', { 
        openPolls: openPolls,
        csrfToken: this.csrf 
      })
    } else {
      const userPolls = yield Poll.find({ createdBy: this.session.user.userName })
      this.render('home/dashboard', {
        csrfToken: this.csrf,
        user: this.session.user, 
        userPolls: userPolls
      })
    }
  }

  if (this.request.path === '/' && this.request.method === 'POST') {
    const pollID = this.request.body.pollID
    const vote = this.request.body.vote
    yield Poll.update({_id: pollID, 'options.title': vote}, {$inc: {'options.$.votes': 1}})
    //Redirect to that poll's dedicated page
    const openPolls = yield Poll.findOne()
    this.render('home', {
      openPolls: openPolls,
      csrfToken: this.csrf
    })
  }
  
  yield next
})

app.use(function *(next) {
  if (this.request.path === '/create-poll' && this.request.method === 'GET' && this.session.user) {
    this.render('poll/create-poll', { 
      user: this.session.user, 
      csrfToken: this.csrf 
    })
  }

  if (this.request.path === '/create-poll' && this.request.method === 'POST' && this.session.user) {

    const options = this.request.body.option.map( function(option) {
      return {
        title: option,
        votes: 0
      }
    })

    const poll = new Poll ({
      title: this.request.body.title,
      options: options,
      createdBy: this.session.user.userName,
      createdDate: new Date()
    })

    try {
      yield poll.save()
      this.redirect('/')
    } catch(err) {
      let error = 'ERROR! Please try again.'

      this.render('poll/create-poll', {
        user: this.session.user,
        error: error,
        csrfToken: this.csrf
      })
    }
  }
  
  yield next
})

router.post('/edit-poll', function *(next) {
  try {
    const poll = yield Poll.findById(this.request.body.pollID)
    this.render('poll/edit-poll', {
      user: this.session.user,
      poll: poll,
      csrfToken: this.csrf
    })
  } catch (err) {
    console.error(err)
  }

  yield next
})

router.post('/update-poll', function *(next) {
  try {
    const formData = {
      title: this.request.body.title,
      options: this.request.body.options.map( option => ({ title: option, votes: 0 }))
    }
    yield Poll.findByIdAndUpdate(this.request.body.pollID, formData)
    this.redirect('/')
  } catch (err) {
    console.error(err)
  }
  
  yield next
})

app.use(function *(next) {
  if (this.request.path === '/login' && this.request.method === 'GET') {
    this.render('login', { csrfToken: this.csrf })
  }

  if (this.request.path === '/login' && this.request.method === 'POST') {
    try {
      let user = yield User.findOne({ email: this.request.body.email }, '+password').lean()
      if (!user) {
        this.render('login', {
          error: 'Incorrect email / password.',
          csrfToken: this.csrf
        })
      } else {
        if (bcrypt.compareSync(this.request.body.password, user.password)) {
          /* TEACHABLE MOMENT!
          Mongoose does not return a regular js object! Objective: Do not send password property to front end.

          1) Set password field in the Model to select: false. Default query will never return this property, unless specifically
             called (ex: '+password') as an argument after the query.
          2) Convert the returned MongooseDocument to a raw object with .toObject() OR chain .lean() on to the query.
             ----
             this.session.user = user.toObject();
             ----
          */
          this.session.user = user
          delete this.session.user.password
          this.redirect('/')
        } else {
          this.render('login', {
            error: 'Incorrect email / password.',
            csrfToken: this.csrf
          })
        }
      }
    } catch(err) {
      console.log(err)
    }
  }

  yield next
})

app.use(function *(next) {
  if (this.request.path === '/account' && this.request.method === 'GET' && this.session.user) {
    this.render('account', { user: this.session.user })
  }

  yield next
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
    this.render('register', { csrfToken: this.csrf })
  }
  
  yield next
})

app.use(function *(next) {
  if (this.request.path === '/register' && this.request.method === 'POST') {

    const hash = yield bcrypt.hash(this.request.body.password, 10)
    const user = new User({
      userName: this.request.body.username,
      email: this.request.body.email,
      password: hash,
    })

    try {
      yield user.save()
      this.session.user = user
      delete this.session.user.password
      this.redirect('/')
    } catch(err) {
      let error = 'ERROR! Please try again.'

      if (err.code === 11000) {
        error = 'That email is already taken, please try again.'
      }

      this.render('register', {
        error: error,
        csrfToken: this.csrf
      })
    }
  }
  
  yield next
})

router.post('/delete-poll', function *(next) {
  try {
    yield Poll.findByIdAndRemove(this.request.body.pollID).remove()
    this.redirect('/')
  } catch (err) {
    console.log(err)
  }

  yield next
})

router.get('/:user', function *(next) {
  const polls = yield Poll.find({ createdBy: new RegExp('^' + this.params.user + '$', 'i') })
  if (polls.length) {
    this.render('poll-list/user', {
      csrfToken: this.csrf,
      polls: polls
    })
  }

  yield next
})

router.get('/:user/:pollName', function *(next) {
  try {
    const isValidUser = yield User.findOne({ userName: this.params.user })
    const thePoll = yield Poll.findOne({ title: this.params.pollName, createdBy: new RegExp('^' + this.params.user + '$', 'i') })
    this.render('poll-list/single', { 
      csrfToken: this.csrf,
      poll: thePoll 
    })
  } catch (err) {
    console.log(err)
  }
  
  yield next
})

router.post('/:user/:pollName', function *(next) {
  try {
    const pollID = this.request.body.pollID
    const vote = this.request.body.vote
    yield Poll.update({_id: pollID, 'options.title': vote}, {$inc: {'options.$.votes': 1}})
    //Redirect to that poll's dedicated page
    this.redirect('/' + this.params.user + '/' + this.params.pollName)
  } catch(err) {
    console.log(err)
  }

  yield next
})

// TODO
// router.post('/:user/:pollName', function *(next) {})

const server = app.listen((process.env.PORT || 5000), () => {
  console.log('Koa is listening, shhh... 5000')
})
