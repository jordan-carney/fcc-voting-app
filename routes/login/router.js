const router = require('koa-router')()
const bcrypt = require('bcrypt')
const models = require('../models')
const Poll = models.Poll
const User = models.User

router.get('/login', function *(next) {
  this.render('login', { 
    csrfToken: this.csrf 
  })

  yield next
})


router.post('/login', function *(next) {
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

module.exports = router