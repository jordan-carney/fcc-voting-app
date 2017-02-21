const router = require('koa-router')()
const models = require('../models')
const Poll = models.Poll

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

module.exports = router