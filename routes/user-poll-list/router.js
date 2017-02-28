const router = require('koa-router')()
const models = require('../models')
const Poll = models.Poll

router.get('/:user', function *(next) {
  const ipAddress = this.request.ipAddress
  const polls = yield Poll.find({ createdBy: new RegExp('^' + this.params.user + '$', 'i') })
  if (polls.length) {
    polls.forEach( poll => {
      poll.hasVoted = poll.voters.some( ip => ipAddress === ip)
    })
    this.render('poll-list/user', {
      csrfToken: this.csrf,
      openPolls: polls
    })
  }

  yield next
})

router.post('/:user', function *(next) {
  const pollID = this.request.body.pollID
  const vote = this.request.body.vote
  const ipAddress = this.request.ipAddress

  try {
    const pollID = this.request.body.pollID
    const vote = this.request.body.vote
    yield Poll.update({_id: pollID, 'options.title': vote, 'voters': {$nin: [ipAddress]}}, {$inc: {'options.$.votes': 1}, $addToSet: {'voters': ipAddress}})
    //Redirect to that poll's dedicated page
    this.redirect('/' + this.params.user)
  } catch(err) {
    console.log(err)
  }

  yield next
})

module.exports = router