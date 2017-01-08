'use-strict'

const app = require('koa')()
const serve = require('koa-static')
const Pug = require('koa-pug')
const pug = new Pug({
  viewPath: './views',
  debug: false,
  pretty: false,
  compileDebug: false,
  locals: '',
  app: app,
})

app.use(serve('./public'))

app.use(function *(next) {
  if (this.request.path !== '/' && this.request.method === 'GET') return yield next
  //this.body = 'Hello World!'
  this.render('home')
})

const server = app.listen(5000, () => {
  console.log('Koa is listening, shhh... 5000')
})
