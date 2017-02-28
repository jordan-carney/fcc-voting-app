const router = require('koa-router')()
const models = require('../../models')
const Poll = models.Poll
const User = models.User

router.get('/vote/:user/:pollName', function *(next) {
  const ipAddress = this.request.ipAddress

  try {
    const isValidUser = yield User.findOne({ userName: this.params.user })
    const thePoll = yield Poll.findOne({ title: this.params.pollName, createdBy: new RegExp('^' + this.params.user + '$', 'i') })
    const hasVoted = thePoll.voters.some( ip => ipAddress === ip)

    this.render('poll-list/single', { 
      csrfToken: this.csrf,
      hasVoted: hasVoted,
      poll: thePoll,
      user: (this.session.user) ? this.session.user : ''
    })
  } catch (err) {
    console.log(err)
  }
  
  yield next
})

// TODO: Move to API
router.post('/vote/:user/:pollName', function *(next) {
  const pollID = this.request.body.pollID
  const vote = this.request.body.vote
  const ipAddress = this.request.ipAddress

  try {
    const pollID = this.request.body.pollID
    const vote = this.request.body.vote
    yield Poll.update({_id: pollID, 'options.title': vote, 'voters': {$nin: [ipAddress]}}, {$inc: {'options.$.votes': 1}, $addToSet: {'voters': ipAddress}})
    
    this.redirect('/vote/' + this.params.user + '/' + this.params.pollName)
  } catch(err) {
    console.log(err)
  }

  yield next
})

module.exports = router