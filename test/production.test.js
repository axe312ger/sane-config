import test from 'ava'

process.env.NODE_ENV = 'production'
const config = require('../src/index.js')

test('test cascadation with production environment', (t) => {
  t.is(config.test.shouldStayDefault, 'default')
  t.is(config.test.shouldBeProduction, 'production')
  t.is(config.test.shouldBeLocal, 'local')
})
