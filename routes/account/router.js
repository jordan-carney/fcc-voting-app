const router = require('koa-router')()
const models = require('../../models')
const User = models.User

router.get('/account', function *(next) {
  if (this.session.user) {
    this.render('account', {
      csrfToken: this.csrf,
      user: this.session.user 
    })
  } else {
    this.redirect('/')
  }

  yield next
})


router.post('/account', function *(next) {
  try {
    yield User.findOneAndRemove({ userName: this.session.user.userName })
    this.session = null
    this.redirect('/')
  } catch (err) {
    console.log(err)
  }

  yield next
})

module.exports = router