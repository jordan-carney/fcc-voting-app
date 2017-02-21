const router = require('koa-router')()
const models = require('../models')
const Poll = models.Poll


router.get('/create-poll', function *(next) {
  if (this.session.user) {
    this.render('poll/create-poll', { 
      user: this.session.user, 
      csrfToken: this.csrf 
    })
  }

  yield next
})

// TODO: Move to API
router.post('/create-poll', function *(next) {
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

module.exports = router