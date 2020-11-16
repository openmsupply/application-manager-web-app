import React from 'react'
import { ErrorBoundary, pluginProvider } from './'
import { ApplicationViewProps, PluginComponents } from './types'

const ApplicationViewWrapper: React.FC<ApplicationViewProps> = (props) => {
  const {
    templateElement: { elementTypePluginCode: pluginCode },
    isVisible,
  } = props

  if (!pluginCode || !isVisible) return null

  const { ApplicationView }: PluginComponents = pluginProvider.getPluginElement(pluginCode)

  // console.log('pluginCode', pluginCode)

  return (
    <ErrorBoundary pluginCode={pluginCode}>
      <React.Suspense fallback="Loading Plugin">{<ApplicationView {...props} />}</React.Suspense>
    </ErrorBoundary>
  )
}

export default ApplicationViewWrapper
