# sane-config

> Simple opinionated cascading configuration management.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://axe312.mit-license.org)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)
[![semantic-release](https://img.shields.io/badge/%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

## Install

```js
yarn add sane-config || npm install --save sane-config
```

## Preparations

Store your configuration files in a directory called `config` in your project root.
If you prefer some other location, just set the `configDirectory` property in your
`package.json` to whatever you like. Can be relative or absolute.

Your configuration files must follow this naming structure:

`[section].[level].[ext]`

* **section:** might be anything you want. This will reflect the name for this
part of your configuration. Use it for basic separation.
* **level:** indicates the level or priority of the file. The module will load and
merge the configurations in the following order:
  * default
  * `process.env.NODE_ENV`
  * local
* **ext:** may be `js` or `json`

Like this, you can add `paths.default.js` to your repository while the production environment easily uses the `paths.production.js` and others can overwrite configs at any time with a `paths.local.js`

## Usage

```js
import config from 'sane-config'

// Will log the value of 'anyProperty' from section.default.js
console.log(config.section.anyProperty)
```

### with webpack

Just add it as global via DefinePlugin. This ensures it only runs once and stores
the final config in your app.

```js
new Webpack.DefinePlugin({
  APP_CONFIG: JSON.stringify(config)
})
```

Makre sure that you don't forget the `JSON.stringify()`

## Validation
sane-config also provides a way to validate your configuration. In later states of your project, this can help a lot to ensure configuration of new or long-time inactive team members are up to date.

Just add a json file with [JSON Schema](http://json-schema.org/) information next to your configuration files. It must follow this naming structure:

`[section].schema.json`

The generator at http://jsonschema.net/ might help you to create your first schema definition.

## Development

This project follows the [standard](https://github.com/feross/standard) coding and the [conventional changelog](https://github.com/conventional-changelog/conventional-changelog-angular/blob/master/convention.md) commit message style. Also it is configured to never decrease the code coverage of its tests.

Also make sure you check out all available npm scripts via `npm run`.

## Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/axe312ger/sane-config/issues/new).
But before doing anything, please read the [CONTRIBUTING.md](./CONTRIBUTING.md) guidelines.
