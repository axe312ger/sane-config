import test from 'ava'

delete process.env.npm_package_config_sane_config_directory

test('test config discovery called without npm env config', (t) => {
  try {
    const config = require('../../src')

    t.is(Object.keys(config.test).length, 4)
  } catch (err) {
    console.error(err)
    t.fail()
  }
})
