const { resolve } = require('path')
const { readdirSync } = require('fs')
const { argv } = require('yargs')
const findRoot = require('find-root')
const Debug = require('debug')
const { validate } = require('jsonschema')

const debug = Debug('sane-config')
const root = findRoot(process.cwd())
const DEFAULT_DIR = resolve(root, 'config')
const levelHierarchy = ['default', process.env.NODE_ENV, 'local']
const configFileRegex = new RegExp(`^(?:([^.]+)|(.+)\\.(${levelHierarchy.join('|')}))\\.js(?:on)?$`)
const schemaFileRegex = new RegExp(`^(.+)\\.schema\\.json$`)

debug(`Determined file hierachy: ${levelHierarchy.join(' -> ')}.`)

let packageDirectory

// Get configuration from npm config
if ('npm_package_config_sane_config_directory' in process.env) {
  packageDirectory = process.env.npm_package_config_sane_config_directory
} else {
  // Fallback to package.json analysis when script was not called via npm
  const packageJSON = require(resolve(root, 'package.json'))
  if (
    packageJSON &&
    packageJSON.config &&
    packageJSON.config['sane-config'] &&
    packageJSON.config['sane-config'].directory
  ) {
    packageDirectory = packageJSON.config['sane-config'].directory
  }
}

const configDirectory = argv.configDirectory || packageDirectory || DEFAULT_DIR

debug(`Reading configuration from ${configDirectory}`)

// Look for matching config files and sort them by name and priority
const files = readdirSync(configDirectory)

// Gather validation schema files
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

// Gather config files
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
  // Sort by priority for cascading merge
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

  // Merge the file content into the fitting section
  return {
    ...config,
    [section]: {
      ...config[section] || {},
      ...fileConfig || {}
    }
  }
}, {})

module.exports = config
