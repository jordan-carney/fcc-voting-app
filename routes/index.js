const routes = require('koa-router')()
const bcrypt = require('bcrypt')

///////////
// TODO: Modularize Queries/DB
const mongoose = require('mongoose')
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
  createdDate: Date,
  voters: [ String ]
}))
mongoose.Promise = global.Promise
mongoose.connect(process.env.MONGO_URL, {})
///////////

routes.get('/', function *(next) {
  if (!this.session.user) { 
    let ipAddress = this.request.ip
    const xip = this.headers["x-forwarded-for"];
    if (xip){
      ipAddress = xip
    }

    const openPolls = yield Poll.findOne()
    const hasVoted = openPolls.voters.some( ip => ipAddress === ip)
    this.render('home', { 
      openPolls: openPolls,
      hasVoted: hasVoted,
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

  yield next
})


routes.post('/', function *(next) {
  const pollID = this.request.body.pollID
  const vote = this.request.body.vote

  let ipAddress = this.request.ip
  const xip = this.headers["x-forwarded-for"];
    if (xip){
      ipAddress = xip
    }

  yield Poll.update({_id: pollID, 'options.title': vote, 'voters': {$nin: [ipAddress]}}, {$inc: {'options.$.votes': 1}, $addToSet: {'voters': ipAddress}})
  //Redirect to that poll's dedicated page
  const openPolls = yield Poll.findOne()
  const hasVoted = openPolls.voters.some( ip => this.request.ip === ip)
  this.render('home', {
    openPolls: openPolls,
    hasVoted: hasVoted,
    csrfToken: this.csrf
  })

  yield next
})


routes.get('/create-poll', function *(next) {
  if (this.session.user) {
    this.render('poll/create-poll', { 
      user: this.session.user, 
      csrfToken: this.csrf 
    })
  }

  yield next
})


routes.post('/create-poll', function *(next) {
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

  yield next  
})


routes.post('/edit-poll', function *(next) {
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

// TODO : move this to private middleware behind data check in /edit-poll route
routes.post('/update-poll', function *(next) {
  try {
    const formData = {
      title: this.request.body.title,
      options: this.request.body.options.map( option => ({ title: option, votes: 0 })),
      voters: []
    }
    yield Poll.findByIdAndUpdate(this.request.body.pollID, formData)
    this.redirect('/')
  } catch (err) {
    console.error(err)
  }
  
  yield next
})


routes.get('/login', function *(next) {
  this.render('login', { 
    csrfToken: this.csrf 
  })

  yield next
})


routes.post('/login', function *(next) {
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

  yield next
})


routes.get('/account', function *(next) {
  if (this.session.user) {
    this.render('account', {
      csrfToken: this.csrf,
      user: this.session.user 
    })
  } else {
    this.redirect('/')
  }

  yield next
})


routes.post('/account', function *(next) {
  try {
    yield User.findOneAndRemove({ userName: this.session.user.userName })
    this.session = null
    this.redirect('/')
  } catch (err) {
    console.log(err)
  }

  yield next
})


routes.get('/logout', function *(next) {
  this.session = null
  this.redirect('/')

  yield next
})


routes.get('/register', function *(next) {
  this.render('register', { 
    csrfToken: this.csrf 
  })

  yield next
}) 


routes.post('/register', function *(next) {
  const hash = yield bcrypt.hash(this.request.body.password, 10)
  const user = new User({
    userName: this.request.body.username,
    email: this.request.body.email,
    password: hash,
  })

  try {
    yield user.save()
    this.session.user = user.toObject();
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
  
  yield next
})


routes.post('/delete-poll', function *(next) {
  try {
    yield Poll.findByIdAndRemove(this.request.body.pollID).remove()
    this.redirect('/')
  } catch (err) {
    console.log(err)
  }

  yield next
})


routes.get('/:user', function *(next) {
  const polls = yield Poll.find({ createdBy: new RegExp('^' + this.params.user + '$', 'i') })
  if (polls.length) {
    this.render('poll-list/user', {
      csrfToken: this.csrf,
      polls: polls
    })
  }

  yield next
})


routes.get('/:user/:pollName', function *(next) {
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


routes.post('/:user/:pollName', function *(next) {
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

// API ENDPOINTS


routes.get('/api/poll-results/:pollId', function *(next) {
  if (this.params.pollId.match(/^[0-9a-fA-F]{24}$/)) { // Need to ensure Mongoose ID format to prevent casting errors on bad queries
    try{
      const pollId = this.params.pollId
      const pollData = yield Poll.findOne({_id: pollId}, '-_id -options._id').lean() // Interseting way to exclude fields
      delete pollData.voters
      this.body = pollData
    } catch (err) {
      console.log(err)
    }
  } else {
    this.response.status = 404
  }

  yield next
})


// TODO
// routes.post('/:user/:pollName', function *(next) {})

module.exports = routes