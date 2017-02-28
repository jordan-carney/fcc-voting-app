const router = require('koa-router')()

// Global Routes
router.all('/', function* (next) {
  // Get IP address with Fix for Heroku
  const xip = this.headers["x-forwarded-for"]
  this.request.ipAddress = (xip) ? xip : this.request.ip

  yield next
})

// Register Routes
const registry = [
  './home/router',
  './login/router',
  './logout/router',
  './account/router',
  './register/router',
  './edit-poll/router',
  './create-poll/router',
  './single-poll/router',
  './user-poll-list/router',
  './api/delete-poll/router',
  './api/poll-results/router',
]

registry.forEach( function(route) {
  return router.use(require(route).routes())
})

module.exports = router