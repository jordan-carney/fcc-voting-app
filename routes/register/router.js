const router = require('koa-router')()
const bcrypt = require('bcrypt')
const models = require('../models')
const User = models.User

router.get('/register', function *(next) {
  this.render('register', { 
    csrfToken: this.csrf 
  })

  yield next
}) 


router.post('/register', function *(next) {
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

module.exports = router