(.+)(?:\.(schema)\.json|\.json)
^(.+)(\.(schema|foo)\.js(?:on)?|\.js(?:on)?)$
(?:(.+)\.(schema)\.json|(.+)\.json)
const configFileRegex = new RegExp(`^(?:(.+)\\.(${configModes.join('|')})\\.js(?:on)?|\\.js(?:on)?)$`)
