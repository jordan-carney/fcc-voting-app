const router = require('koa-router')()
const models = require('../models')
const Poll = models.Poll

router.get('/', function *(next) {
  if (!this.session.user) {

    // IP fix for Heroku 
    let ipAddress = this.request.ip
    const xip = this.headers["x-forwarded-for"];
    if (xip){
      ipAddress = xip
    }

    const openPolls = yield Poll.findOne()
    const hasVoted = openPolls.voters.some( ip => ipAddress === ip)
    this.render('home', { 
      openPolls: openPolls,
      hasVoted: hasVoted,
      csrfToken: this.csrf
    })

  } else {
    const userPolls = yield Poll.find({ createdBy: this.session.user.userName })
    this.render('home/dashboard', {
      csrfToken: this.csrf,
      user: this.session.user, 
      userPolls: userPolls
    })
  }

  yield next
})


router.post('/', function *(next) {
  const pollID = this.request.body.pollID
  const vote = this.request.body.vote

  let ipAddress = this.request.ip
  const xip = this.headers["x-forwarded-for"];
    if (xip){
      ipAddress = xip
    }

  yield Poll.update({_id: pollID, 'options.title': vote, 'voters': {$nin: [ipAddress]}}, {$inc: {'options.$.votes': 1}, $addToSet: {'voters': ipAddress}})
  //Redirect to that poll's dedicated page
  const openPolls = yield Poll.findOne()
  const hasVoted = openPolls.voters.some( ip => this.request.ip === ip)
  this.render('home', {
    openPolls: openPolls,
    hasVoted: hasVoted,
    csrfToken: this.csrf
  })

  yield next
})

module.exports = router