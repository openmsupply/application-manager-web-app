import React, { useEffect, useState } from 'react'
import { ErrorBoundary, pluginProvider } from '.'
import { Form } from 'semantic-ui-react'
import { SummaryViewWrapperProps, PluginComponents } from './types'
import evaluateExpression from '@openmsupply/expression-evaluator'
import { EvaluatorNode } from '../utils/types'
import { buildParameters } from './ApplicationViewWrapper'
import { useUserState } from '../contexts/UserState'
import Markdown from '../utils/helpers/semanticReactMarkdown'
import globalConfig from '../config.json'

const graphQLEndpoint = globalConfig.serverGraphQL

const SummaryViewWrapper: React.FC<SummaryViewWrapperProps> = ({
  element,
  response,
  allResponses,
  applicationData = {},
  displayTitle = true,
}) => {
  const { parameters, pluginCode, isRequired, isVisible } = element
  const {
    userState: { currentUser },
  } = useUserState()
  const [evaluatedParameters, setEvaluatedParameters] = useState({})

  const { SummaryView, config }: PluginComponents = pluginProvider.getPluginElement(pluginCode)

  const parameterLoadingValues = config?.parameterLoadingValues
  const [simpleParameters, parameterExpressions] = buildParameters(
    parameters,
    parameterLoadingValues
  )

  useEffect(() => {
    // Runs once on component mount
    Object.entries(parameterExpressions).forEach(([field, expression]) => {
      evaluateExpression(expression as EvaluatorNode, {
        objects: { responses: allResponses, currentUser, applicationData },
        APIfetch: fetch,
        graphQLConnection: { fetch: fetch.bind(window), endpoint: graphQLEndpoint },
      }).then((result: any) =>
        setEvaluatedParameters((prevState) => ({ ...prevState, [field]: result }))
      )
    })
  }, [])

  if (!pluginCode || !isVisible) return null

  const DefaultSummaryView: React.FC = () => {
    const combinedParams = { ...simpleParameters, ...evaluatedParameters }
    return (
      <Form.Field className="element-summary-view" required={isRequired}>
        {displayTitle && (
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
      parameters={{ ...simpleParameters, ...evaluatedParameters }}
      response={response}
      Markdown={Markdown}
      DefaultSummaryView={DefaultSummaryView}
    />
  )

  return (
    <ErrorBoundary pluginCode={pluginCode}>
      <React.Suspense fallback="Loading Plugin">
        <Form.Field required={isRequired}>{PluginComponent}</Form.Field>
      </React.Suspense>
    </ErrorBoundary>
  )
}

export default SummaryViewWrapper
