const router = require('koa-router')()
const models = require('../models')
const Poll = models.Poll
const User = models.User

router.get('/:user/:pollName', function *(next) {
  try {
    const isValidUser = yield User.findOne({ userName: this.params.user })
    const thePoll = yield Poll.findOne({ title: this.params.pollName, createdBy: new RegExp('^' + this.params.user + '$', 'i') })
    this.render('poll-list/single', { 
      csrfToken: this.csrf,
      poll: thePoll 
    })
  } catch (err) {
    console.log(err)
  }
  
  yield next
})

// TODO: Move to API
router.post('/:user/:pollName', function *(next) {
  try {
    const pollID = this.request.body.pollID
    const vote = this.request.body.vote
    yield Poll.update({_id: pollID, 'options.title': vote}, {$inc: {'options.$.votes': 1}})
    //Redirect to that poll's dedicated page
    this.redirect('/' + this.params.user + '/' + this.params.pollName)
  } catch(err) {
    console.log(err)
  }

  yield next
})

module.exports = router