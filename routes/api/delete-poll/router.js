const router = require('koa-router')()
const models = require('../../models')
const Poll = models.Poll

router.post('/delete-poll', function *(next) {
  try {
    yield Poll.findByIdAndRemove(this.request.body.pollID).remove()
    this.redirect('/')
  } catch (err) {
    console.log(err)
  }

  yield next
})

module.exports = router