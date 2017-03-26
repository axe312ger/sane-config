const { resolve } = require('path')
const { readdirSync } = require('fs')
const { argv } = require('yargs')
const findRoot = require('find-root')
const Debug = require('debug')
const { validate } = require('jsonschema')

const debug = Debug('sane-config')
const root = findRoot(process.cwd())
const packageJSON = require(resolve(root, 'package.json'))
const DEFAULT_DIR = resolve(root, 'config')
const levelHierarchy = ['default', process.env.NODE_ENV, 'local']
const configFileRegex = new RegExp(`^(?:([^.]+)|(.+)\\.(${levelHierarchy.join('|')}))\\.js(?:on)?$`)
const schemaFileRegex = new RegExp(`^(.+)\\.schema\\.json$`)

debug(`Determined file hierachy: ${levelHierarchy.join(' -> ')}.`)

const packageDirectory = (
  packageJSON &&
  packageJSON.config &&
  packageJSON.config['sane-config'] &&
  packageJSON.config['sane-config'].directory
) ? resolve(root, packageJSON.config['sane-config'].directory) : null
const customDirectory = argv.configDirectory || packageDirectory
const configDirectory = customDirectory || DEFAULT_DIR

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
      section: result[1] || result[2],
      level: result[3] || 'default'
    }
  })
  .filter((module) => module.level !== 'schema')
  // Sort by priority
  .sort((a, b) => {
    const nameCompare = a.section.localeCompare(b.section)

    if (nameCompare !== 0) {
      return nameCompare
    }

    const aPosition = levelHierarchy.indexOf(a.level)
    const bPosition = levelHierarchy.indexOf(b.level)

    return aPosition - bPosition
  })

// Read config files and merge them
const config = configFiles.reduce((config, file) => {
  const { section, path, name } = file
  const fileConfig = require(path)

  debug(`Loading ${name}...`)

  // Validation
  if (schemas.has(section)) {
    const validation = validate(fileConfig, schemas.get(section))
    if (validation.errors.length) {
      const message = `Found ${validation.errors.length} validation errors in ${name}`
      debug(`${message}:`)
      validation.errors.map((error) => debug(error.message))
      const error = new Error(message)
      error.errors = validation.errors
      throw error
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
