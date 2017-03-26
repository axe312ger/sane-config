import test from 'ava'

test('test cascadation with development environment', (t) => {
  try {
    const config = require('../../src')

    t.is(config.test.shouldStayDefault, 'default', 'should stay default')
    t.is(config.test.shouldBeProduction, 'default', 'should still be default')
    t.is(config.test.shouldBeLocal, 'local', 'should be local')
    t.is(config.test.requiredProperty, 'local', 'overwritten by local since required')
    t.is(Object.keys(config.test).length, 4)

    t.true(config.simple.simple)
    t.is(Object.keys(config.simple).length, 1)
  } catch (err) {
    console.error(err)
    t.fail()
  }
})
