const fs = require('fs')
const path = require('path')
const PROJECT_ROOT = path.resolve(__dirname, '../')

const pluginsFolder = path.join(PROJECT_ROOT, 'src', 'formElementPlugins')
const pluginConfigFilename = 'pluginConfig.json'
const pluginManifestFileName = 'pluginManifest.json'

const createPluginManifest = () => {
  // External plugin in development is considered 'core'
  const corePlugins = fs
    .readdirSync(pluginsFolder, { encoding: 'utf-8', withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)

  const result = {}

  corePlugins.forEach((pluginFolder) => {
    const fullPluginFolderPath = path.join(pluginsFolder, pluginFolder)
    const jsonConfigRaw = fs.readFileSync(
      path.join(fullPluginFolderPath, pluginConfigFilename),
      'utf-8'
    )
    const config = JSON.parse(jsonConfigRaw)

    result[config.code] = { ...config, isCore: true, folderName: pluginFolder }
  })

  fs.writeFileSync(
    path.join(pluginsFolder, pluginManifestFileName),
    JSON.stringify(result, null, ' ')
  )
}

module.exports = { createPluginManifest }
