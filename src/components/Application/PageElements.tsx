import React from 'react'
import { ElementStateNEW, ResponsesByCode } from '../../utils/types'
import ApplicationViewWrapper from '../../formElementPlugins/ApplicationViewWrapperNEW'
import SummaryViewWrapper from '../../formElementPlugins/SummaryViewWrapper'
import { Form } from 'semantic-ui-react'

interface PageElementProps {
  elements: ElementStateNEW[]
  responsesByCode: ResponsesByCode
  isStrictPage?: boolean
  isEditable?: boolean
  isReview?: boolean
}

const PageElements: React.FC<PageElementProps> = ({
  elements,
  responsesByCode,
  isStrictPage,
  isEditable,
  isReview,
}) => {
  // Applicant Editable application
  return (
    <Form>
      {elements.map((element) => {
        const {
          code,
          pluginCode,
          parameters,
          isVisible,
          isRequired,
          isEditable,
          validationExpression,
          validationMessage,
        } = element
        const response = responsesByCode?.[code]
        const isValid = response?.isValid

        // Regular application view
        if (isEditable && !isReview)
          return (
            <ApplicationViewWrapper
              key={`question_${code}`}
              code={code}
              initialValue={response}
              pluginCode={pluginCode}
              parameters={parameters}
              isVisible={isVisible}
              isEditable={isEditable}
              isRequired={isRequired}
              isValid={isValid || true}
              isStrictPage={isStrictPage}
              validationExpression={validationExpression}
              validationMessage={validationMessage}
              allResponses={responsesByCode}
              currentResponse={response}
            />
          )
        // Summary Page -- TO-DO
        if (!isEditable && !isReview) return <p>Summary View</p>
        // Review Page -- TO-DO
        if (isReview) return <p>Review Elements</p>
      })}
    </Form>
  )
}

export default PageElements
