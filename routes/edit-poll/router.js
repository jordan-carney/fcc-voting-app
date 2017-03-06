const router = require('koa-router')()
const models = require('../../models')

const Poll = models.Poll


router.get('/edit-poll/:pollId', function* getEditPoll(next) {
  try {
    const poll = yield Poll.findById(this.params.pollId)

    this.render('poll/edit-poll', {
      user: this.session.user,
      poll,
      csrfToken: this.csrf,
    })
  } catch (err) {
    console.error(err)
  }

  yield next
})


// TODO : move this to private middleware behind data check in /edit-poll route
router.post('/update-poll', function* postUpdatePoll(next) {
  try {
    const formData = {
      title: this.request.body.title,
      options: this.request.body.options.map(option => ({ title: option, votes: 0 })),
      voters: [],
    }
    yield Poll.findByIdAndUpdate(this.request.body.pollID, formData)
    this.redirect('/')
  } catch (err) {
    console.error(err)
  }

  yield next
})

module.exports = router
