import React from 'react'
import { PluginManifest, PluginComponents, Plugins } from './types'
import coreManifest from './pluginManifest.json'

type ComponentKeys = 'ApplicationView' | 'TemplateView' | 'SummaryView'

const PLUGIN_COMPONENTS: ComponentKeys[] = ['ApplicationView', 'TemplateView', 'SummaryView']
const PLUGIN_ERRORS = {
  PLUGIN_NOT_IN_MANIFEST: 'Plugin is not present in plugin manifest',
  PLUGINS_NOT_LOADED: 'Plugins are not loaded, check connection with server',
}

let pluginProviderInstance: pluginProvider | null = null

class pluginProvider {
  // Have to add ! since constructor may not declare = {}, due to if statement with return
  plugins!: Plugins
  pluginManifest!: PluginManifest
  remotePlugins!: PluginManifest

  constructor() {
    if (pluginProviderInstance) return pluginProviderInstance
    pluginProviderInstance = this

    this.plugins = {}
    // Needs to be called when app loads (REST call to back end)
    // TODO
    this.pluginManifest = coreManifest as PluginManifest
  }

  getPluginElement(code: string) {
    if (Object.values(this.pluginManifest).length == 0)
      return returnWithError(new Error(PLUGIN_ERRORS.PLUGINS_NOT_LOADED))

    // Bundled plugins
    const { [code]: pluginConfig } = this.pluginManifest
    if (!pluginConfig) return this.getRemoteElementPlugin(code)

    if (this.plugins[code]) return this.plugins[code]

    this.plugins[code] = getLocalElementPlugin(pluginConfig.folderName)

    return this.plugins[code]
  }

  getRemoteElementPlugin(code: string) {
    return getRemotePlugin()
  }
}

const getRemotePlugin = (pluginUrl?: string, scope?: string) =>
  new Promise((resolve, reject) => {
    // const element = document.createElement("script");
    // element.src = pluginUrl;
    // element.type = "text/javascript";
    // element.async = true;
    // element.onload = async() => {
    //   // Initializes the share scope. This fills it with known provided modules from this build and all remotes
    //   await __webpack_init_sharing__("default");
    //   const container = window[scope]; // or get the container somewhere else
    //   // Initialize the container, it may provide shared modules
    //   await container.init(__webpack_share_scopes__.default);
    //   const factory = await window[scope].get('./plugin');
    //   const Module = factory();
    //   resolve(Module);
    // };
    // element.onerror = () => {
    //   console.log('error')
    //   reject();
    // };
    // document.head.appendChild(element);
  })

function getLocalElementPlugin(folderName: string) {
  const result: PluginComponents = {} as PluginComponents
  result.config = require(`./${folderName}/pluginConfig.json`)
  // TO-DO: optimize so it only imports the component type (Application, Template, Summary) that is required
  PLUGIN_COMPONENTS.forEach((componentName) => {
    result[componentName] = React.lazy(
      // the exlude comment is to tell webpack not to include node_modules in possible
      // lazy imports, so when we are developing a new remote plugin, it will have node_modules
      // folder, during development it will be lazy loaded with this command
      () => import(/* webpackExclude: /node_modules/ */ `./${folderName}/src/${componentName}`)
    )
  })

  return result
}

// Since the interface for getPluginElement should always return { pluginComponents }
// this helper will return a reject with an error
function returnWithError(error: Error) {
  const result: PluginComponents = {} as PluginComponents
  PLUGIN_COMPONENTS.forEach(
    (componentName) =>
      (result[componentName] = React.lazy(async () => {
        throw error
      }))
  )

  return result
}

export default new pluginProvider()
export { PLUGIN_ERRORS }
