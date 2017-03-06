const router = require('koa-router')()
const models = require('../../models')

const Poll = models.Poll

router.get('/vote/:user', function* getUserPollList(next) {
  const ipAddress = this.request.ipAddress
  const polls = yield Poll.find({ createdBy: new RegExp(`^${this.params.user}$`, 'i') })
  if (polls.length) {
    polls.forEach((poll) => {
      poll.hasVoted = poll.voters.some(ip => ipAddress === ip)
    })
    this.render('poll-list/user', {
      csrfToken: this.csrf,
      openPolls: polls,
      user: (this.session.user) ? this.session.user : '',
    })
  }

  yield next
})

router.post('/vote/:user', function* postUserPollList(next) {
  const pollID = this.request.body.pollID
  const vote = this.request.body.vote
  const ipAddress = this.request.ipAddress

  try {
    yield Poll.update({ _id: pollID, 'options.title': vote, voters: { $nin: [ipAddress] } }, { $inc: { 'options.$.votes': 1 }, $addToSet: { voters: ipAddress } })
    // Redirect to that poll's dedicated page
    this.redirect(`/vote/${this.params.user}`)
  } catch (err) {
    console.log(err)
  }

  yield next
})

module.exports = router
