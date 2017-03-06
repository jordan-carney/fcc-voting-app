const router = require('koa-router')()

router.get('/logout', function* getLogout(next) {
  this.session = null
  this.redirect('/')

  yield next
})

module.exports = router
