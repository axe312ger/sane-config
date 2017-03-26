import test from 'ava'

process.argv.push('--configDirectory')
process.argv.push('./test/validation/fixtures')

test.cb('test cascadation with development environment', (t) => {
  try {
    require('../../src')
    t.fail('the require should throw an error since the config is invalid')
  } catch (e) {
    t.is(e.message, 'Found 1 validation errors in invalid.default.js')
    t.is(e.errors[0].message, 'requires property "someOtherProperty"')
    t.pass()
  }
  t.end()
})
