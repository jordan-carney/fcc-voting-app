const router = require('koa-router')()

// Register Routes
const registry = [
  './globals/router',
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