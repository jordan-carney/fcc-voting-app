'use-strict'

const app = require('koa')()

// app.use(function *() {
//   this.body = 'Hello World!'
// })

app.use(function *(next) {
  this.body = 'A'
  yield next;
  this.body = 'E'
});

app.use(function *(next) {
  this.body = 'B'
  yield next;
  this.body = 'D'
});

app.use(function *(next) {
  this.body = 'C'
});

const server = app.listen(5000, () => {
  console.log('Koa is listening, shhh... 5000')
})
