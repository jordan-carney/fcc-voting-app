const router = require('koa-router')()
const models = require('../../models')

const Poll = models.Poll


router.get('/create-poll', function* getCreatePoll(next) {
  if (this.session.user) {
    this.render('poll/create-poll', {
      user: this.session.user,
      csrfToken: this.csrf,
    })
  }

  yield next
})

// TODO: Move to API
router.post('/create-poll', function* postCreatePoll(next) {
  const options = this.request.body.option.map(option => ({
    title: option,
    votes: 0,
  }))

  const poll = new Poll({
    title: this.request.body.title,
    options,
    createdBy: this.session.user.userName,
    createdDate: new Date(),
  })

  try {
    yield poll.save()
    this.redirect('/')
  } catch (err) {
    const error = 'ERROR! Please try again.'

    this.render('poll/create-poll', {
      user: this.session.user,
      error,
      csrfToken: this.csrf,
    })
  }

  yield next
})

module.exports = router
