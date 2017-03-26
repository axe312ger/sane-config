import test from 'ava'

process.env.NODE_ENV = 'production'

test('test cascadation with production environment', (t) => {
  try {
    const config = require('../../src')

    t.is(config.test.shouldStayDefault, 'default', 'should still be default')
    t.is(config.test.shouldBeProduction, 'production', 'should have become production')
    t.is(config.test.shouldBeLocal, 'local', 'should stay local')
    t.is(config.test.requiredProperty, 'local', 'overwritten by local since required')
    t.is(Object.keys(config.test).length, 4)

    t.false(config.simple.simple)
    t.true(config.simple.production)
    t.is(Object.keys(config.simple).length, 2)
  } catch (err) {
    console.error(err)
    t.fail()
  }
})
