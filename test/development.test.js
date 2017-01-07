import test from 'ava'

import config from '../src/index.js'

test('test cascadation with development environment', (t) => {
  t.is(config.test.shouldStayDefault, 'default')
  t.is(config.test.shouldBeProduction, 'default')
  t.is(config.test.shouldBeLocal, 'local')
})
