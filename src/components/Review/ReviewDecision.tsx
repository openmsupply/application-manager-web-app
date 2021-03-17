import React from 'react'
import { Checkbox, Form, Message } from 'semantic-ui-react'
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
  if (isEditable)
    return (
      <Form>
        {decisionOptions
          .filter((option) => option.isVisible)
          .map((option) => (
            <Form.Field error={isDecisionError} key={option.code}>
              <Checkbox
                radio
                label={option.title}
                name={option.title}
                value={option.code}
                checked={option.value}
                onChange={() => setDecision(option.code)}
              />
            </Form.Field>
          ))}
      </Form>
    )
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
