const router = require('koa-router')()
const models = require('../../models')

const Poll = models.Poll

router.get('/vote/:user/:pollName', function* getSinglePoll(next) {
  const ipAddress = this.request.ipAddress

  try {
    const poll = yield Poll.findOne({ title: this.params.pollName, createdBy: new RegExp(`^${this.params.user}$`, 'i') })
    const hasVoted = poll.voters.some(ip => ipAddress === ip)

    this.render('poll-list/single', {
      csrfToken: this.csrf,
      hasVoted,
      poll,
      user: (this.session.user) ? this.session.user : '',
    })
  } catch (err) {
    console.log(err)
  }

  yield next
})

// TODO: Move to API
router.post('/vote/:user/:pollName', function* postSinglePoll(next) {
  const pollID = this.request.body.pollID
  const vote = this.request.body.vote
  const ipAddress = this.request.ipAddress

  try {
    yield Poll.update({ _id: pollID, 'options.title': vote, voters: { $nin: [ipAddress] } }, { $inc: { 'options.$.votes': 1 }, $addToSet: { voters: ipAddress } })

    this.redirect(`/vote/${this.params.user}/${this.params.pollName}`)
  } catch (err) {
    console.log(err)
  }

  yield next
})

module.exports = router
