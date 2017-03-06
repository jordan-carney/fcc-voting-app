const router = require('koa-router')()

router.use(require('./globals/router').routes())
router.use(require('./home/router').routes())
router.use(require('./login/router').routes())
router.use(require('./logout/router').routes())
router.use(require('./account/router').routes())
router.use(require('./register/router').routes())
router.use(require('./edit-poll/router').routes())
router.use(require('./create-poll/router').routes())
router.use(require('./single-poll/router').routes())
router.use(require('./user-poll-list/router').routes())
router.use(require('./api/delete-poll/router').routes())
router.use(require('./api/poll-results/router').routes())

module.exports = router
