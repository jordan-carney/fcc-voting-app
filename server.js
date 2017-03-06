if (process.env.NODE_ENV !== 'production') require('dotenv').config()

const session = require('koa-session')
const bodyParser = require('koa-bodyparser')
const serve = require('koa-static')
const csrf = require('koa-csrf')
const Pug = require('koa-pug')
const app = require('koa')()

const pug = new Pug({
  viewPath: './views',
  debug: false,
  pretty: false,
  compileDebug: false,
  locals: '',
  app,
})


app.use(serve('./public'))
app.use(bodyParser())
app.keys = [process.env.SESSION_SECRET]
app.use(session(app))
csrf(app)
app.use(csrf.middleware)


const router = require('./routes')
app.use(router.routes())
app.use(router.allowedMethods())

const server = app.listen((process.env.PORT || 5000), () => {
  console.log('Koa is listening, shhh... 5000')
})
