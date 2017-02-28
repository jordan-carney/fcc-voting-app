const router = require('koa-router')()
const models = require('../../../models')
const Poll = models.Poll

router.get('/api/poll-results/:pollId', function *(next) {
  if (this.params.pollId.match(/^[0-9a-fA-F]{24}$/)) { // Need to ensure Mongoose ID format to prevent casting errors on bad queries
    try{
      const pollId = this.params.pollId
      const pollData = yield Poll.findOne({_id: pollId}, '-_id -options._id').lean() // Interesting way to exclude fields
      delete pollData.voters
      this.body = pollData
    } catch (err) {
      console.log(err)
    }
  } else {
    this.response.status = 404
  }

  yield next
})

module.exports = router