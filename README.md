# sane-config

> Simple opinionated cascading configuration management. Heavily influenced by [konphyg](https://github.com/pgte/konphyg) but more features, easier usage and less code.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://axe312.mit-license.org)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)
[![Build Status](https://img.shields.io/circleci/project/axe312ger/sane-config.svg?maxAge=2592000)](https://circleci.com/gh/axe312ger/sane-config)
[![CodeCov Badge](https://img.shields.io/codecov/c/github/axe312ger/sane-config.svg?maxAge=2592000)](https://codecov.io/gh/axe312ger/sane-config)
[![semantic-release](https://img.shields.io/badge/%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

## Features

* Simple usage: Just require `sane-config` in your code and the assigned variable will contain your config. DONE!
* Supports `json` and `js` files.
* Set up within 5 minutes without headache.
* Works for node and browser.
* Automatically selects matching configuration based on the `NODE_ENV`.
* Cascading configuration. Define a default, overwrite some values on production. No problem!
* Validation of configuration files made easy via [json-schema](http://json-schema.org/)
* Developers can overwrite any configuration in case they have special settings on their machine.
* Uses [debug](https://www.npmjs.com/package/debug) to display the chosen configuration files.
* All of this with just about 100 lines of code and a few small dependencies. Let's keep stuff simple!

## Install

```js
yarn add sane-config || npm install --save sane-config
```

## Preparations

Two simple steps to reach the goal:

### First – Create a config directory

Store your configuration files in a directory called `config` in your project root.

**(Optional) Tell sane-config to use another directory:**

If you prefer some other location, you have two options:

* Set the `config['sane-config'].directory` parameter in your `package.json` [config object](https://docs.npmjs.com/files/package.json#config) to whatever you like.
* Add the `--configurationDirectory` argument to your process call

Hint: The path may be relative or absolute.

### Second – Name your config files

You have to split your configuration files into sections, which will be merged to a single config object. This gives you basic organization and separation.

To achieve this, they must follow this naming structure:

`[Section].[Level].js(on)`

1. `[Section]` - Might be anything you want. All files with the same section will be merge into one config object property. Use it for separation like `database`, `paths`, `tokens`, ...
2. `[Level]` - Indicates the cascading priority for the files of one section. `sane-config` will load and
merge the configurations in the following order:
  * default
  * `process.env.NODE_ENV`
  * local
  * schema
3. `js` or `json` file extension

Your config directory later may look like this:
```sh
db.default.js
db.local.js # local overwrite for developer environment
db.production.json # should be only present on server
db.schema.json # optional file for config validation
```

## Usage (Node)

Let's assume we have the following configuration files in our configuration directory:

### `database.json`
```json
{
  "user": "frank",
  "port": 5432
}
```

### `database.production.json`
```json
{
  "user": "peter"
}
```

You can access your configuration like this:
```js
import config from 'sane-config'

console.log(config.database.user)
// --> frank
```

Thats how the whole configuration would look like for **development**:
```js
import config from 'sane-config'

console.log(JSON.stringify(config, null, 2))
// {
//   "database": {
//     "user": "frank",
//     "port": 5432
//   }
// }
```

And here for **production**:
```js
import config from 'sane-config'

console.log(JSON.stringify(config, null, 2))
// {
//   "database": {
//     "user": "peter", <-- user got overwritten
//     "port": 5432
//   }
// }
```

### Usage within Webpack apps (Browser)

Just add your processed config as global via the [DefinePlugin](https://webpack.js.org/plugins/define-plugin/). This ensures it only runs once and does not fail
since sane-config uses the [file system](https://nodejs.org/api/fs.html) to read your configs which only works in node environments.

```js
import config from 'sane-config'

...
new Webpack.DefinePlugin({
  APP_CONFIG: JSON.stringify(config)
})
...
```

Make sure that you don't forget the `JSON.stringify()`

## Validation
sane-config also provides a way to validate your configuration. In later states of your project, this can help a lot to ensure configuration of new or long-time inactive team members are up to date.

Just add a json file with [JSON Schema](http://json-schema.org/) information next to your configuration files. It must follow this naming structure:

`[Section].schema.json`

The generator at http://jsonschema.net/ might help you to create your first schema definition.

## Development

This project follows the [standard](https://github.com/feross/standard) coding and the [conventional changelog](https://github.com/conventional-changelog/conventional-changelog-angular/blob/master/convention.md) commit message style. Also it is configured to never decrease the code coverage of its tests.

Also make sure you check out all available npm scripts via `npm run`.

## Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/axe312ger/sane-config/issues/new).
But before doing anything, please read the [CONTRIBUTING.md](./CONTRIBUTING.md) guidelines.
