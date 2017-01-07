import test from 'ava'

const config = require('../../src')

test('test cascadation with development environment', (t) => {
  t.is(config.test.shouldStayDefault, 'default')
  t.is(config.test.shouldBeProduction, 'default')
  t.is(config.test.shouldBeLocal, 'local')
})
