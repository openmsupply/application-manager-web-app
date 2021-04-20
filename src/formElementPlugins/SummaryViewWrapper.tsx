import React, { useEffect, useState } from 'react'
import { ErrorBoundary, pluginProvider } from '.'
import { Form } from 'semantic-ui-react'
import { SummaryViewWrapperProps, PluginComponents } from './types'
import { ElementPluginParameters } from '../utils/types'
import { extractDynamicExpressions, evaluateDynamicParameters } from './ApplicationViewWrapper'
import { useUserState } from '../contexts/UserState'
import Markdown from '../utils/helpers/semanticReactMarkdown'
import globalConfig from '../config.json'

const graphQLEndpoint = globalConfig.serverGraphQL

const SummaryViewWrapper: React.FC<SummaryViewWrapperProps> = ({
  element,
  response,
  allResponses,
  applicationData,
  displayTitle = true,
}) => {
  const { parameters, pluginCode, isRequired, isVisible } = element
  const {
    userState: { currentUser },
  } = useUserState()
  const [evaluatedParameters, setEvaluatedParameters] = useState({})
  const [parametersLoaded, setParametersLoaded] = useState(false)

  const { SummaryView, config }: PluginComponents = pluginProvider.getPluginElement(pluginCode)

  const dynamicParameters = config?.dynamicParameters
  const dynamicExpressions =
    dynamicParameters && extractDynamicExpressions(dynamicParameters, parameters)

  useEffect(() => {
    // Runs once on component mount
    evaluateDynamicParameters(dynamicExpressions as ElementPluginParameters, {
      objects: { responses: allResponses, currentUser, applicationData },
      APIfetch: fetch,
      graphQLConnection: { fetch: fetch.bind(window), endpoint: graphQLEndpoint },
    }).then((result: ElementPluginParameters) => {
      setEvaluatedParameters(result)
      setParametersLoaded(true)
    })
  }, [])
  if (!pluginCode || !isVisible) return null

  const DefaultSummaryView: React.FC = () => {
    const combinedParams = { ...parameters, ...evaluatedParameters }
    return (
      <Form.Field required={isRequired}>
        {parametersLoaded && displayTitle && (
          <>
            <label style={{ color: 'black' }}>
              <Markdown text={combinedParams.label} semanticComponent="noParagraph" />
            </label>
            <Markdown text={combinedParams.description} />
          </>
        )}
        <Markdown text={(response ? response?.text : '') as string} />
      </Form.Field>
    )
  }

  const PluginComponent = (
    <SummaryView
      parameters={{ ...parameters, ...evaluatedParameters }}
      response={response}
      Markdown={Markdown}
      DefaultSummaryView={DefaultSummaryView}
    />
  )

  return (
    <ErrorBoundary pluginCode={pluginCode}>
      <React.Suspense fallback="Loading Plugin">
        {parametersLoaded && <Form.Field required={isRequired}>{PluginComponent}</Form.Field>}
      </React.Suspense>
    </ErrorBoundary>
  )
}

export default SummaryViewWrapper
