import React from 'react'
import { Checkbox, Container, Form, Message } from 'semantic-ui-react'
import { Decision } from '../../utils/generated/graphql'
import { DecisionOption } from '../../utils/types'
import strings from '../../utils/constants'

type ReviewDecisionProps = {
  decisionOptions: DecisionOption[]
  setDecision: (decision: Decision) => void
  isDecisionError: boolean
  isEditable: boolean
}

const ReviewDecision: React.FC<ReviewDecisionProps> = ({
  decisionOptions,
  setDecision,
  isDecisionError,
  isEditable,
}) => {
  if (isEditable) {
    const onChangeDecision = (_: any, { value: code }: any) => setDecision(code)
    const visibleOptions = decisionOptions.filter((option) => option.isVisible)
    return (
      <Container>
        {visibleOptions.length > 0 && (
          <p>
            <strong>{strings.LABEL_REVIEW_SUBMIT_AS}:</strong>
          </p>
        )}
        {visibleOptions.map((option) => (
          <Form.Field
            className="reviewer-decision-checkbox"
            error={isDecisionError}
            key={option.code}
          >
            <Checkbox
              radio
              label={option.title}
              name={option.title}
              value={option.code}
              checked={option.value}
              onChange={onChangeDecision}
            />
          </Form.Field>
        ))}
      </Container>
    )
  }
  // If review has been submitted/locked:
  const visibleOption = decisionOptions.find((option) => option.isVisible)
  if (!visibleOption) return null
  return (
    <Message
      compact
      attached="top"
      icon="calendar check outline"
      header={strings.TITLE_REVIEW_DECISION}
      content={visibleOption.title}
    />
  )
}

export default ReviewDecision
