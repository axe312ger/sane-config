const { resolve, dirname } = require('path')
const { readdirSync } = require('fs')
const findRoot = require('find-root')
const Debug = require('Debug')
const { validate } = require('jsonschema')

const debug = Debug('config')
const processDir = dirname(process.mainModule.filename)
const root = findRoot(processDir)
const packageJSON = require(resolve(root, 'package.json'))
const DEFAULT_DIR = resolve(root, 'config')
const configMode = [
  'default',
  process.env.NODE_ENV,
  'local'
]
const configFileRegex = new RegExp(`^(.+)\\.(${configMode.join('|')})\\.js(?:on)?$`)
const schemaFileRegex = new RegExp(`^(.+)\\.schema\\.json$`)

const configDirectory = packageJSON.hasOwnProperty('configDirectory')
  ? resolve(processDir, packageJSON['configDirectory'])
  : DEFAULT_DIR

debug(`Reading configuration from ${configDirectory}`)

// Look for matching config files and sort them by name and priority
const files = readdirSync(configDirectory)

// Gather schema files
const schemas = files
  .filter((name) => name.match(schemaFileRegex))
  .map((name) => {
    const result = schemaFileRegex.exec(name)
    return {
      path: resolve(configDirectory, name),
      name,
      section: result[1]
    }
  })
  .reduce((map, schema) => {
    const { section, path } = schema
    const configSchema = require(path)
    map.set(section, configSchema)
    return map
  }, new Map())

const configFiles = files
  .filter((name) => name.match(configFileRegex))
  .map((name) => {
    const result = configFileRegex.exec(name)
    return {
      path: resolve(configDirectory, name),
      name,
      section: result[1],
      level: result[2]
    }
  })
  // Sort by priority
  .sort((a, b) => {
    const nameCompare = a.section.localeCompare(b.section)

    if (nameCompare !== 0) {
      return nameCompare
    }

    const aPosition = configMode.indexOf(a.level)
    const bPosition = configMode.indexOf(b.level)

    return aPosition - bPosition
  })

// Read config files and merge them
const config = configFiles.reduce((config, file) => {
  const { section, path, name } = file
  const fileConfig = require(path)

  if (schemas.has(section)) {
    const validation = validate(fileConfig, schemas.get(section))
    if (validation.errors.length) {
      debug(`Found ${validation.errors.length} validation errors in ${name}:`)
      validation.errors.map((error) => debug(error.message))
      process.exit(1)
    }
  }

  return {
    ...config,
    [section]: {
      ...config[section] || {},
      ...fileConfig || {}
    }
  }
}, {})

module.exports = config
