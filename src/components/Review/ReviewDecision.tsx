import React from 'react'
import { Checkbox, Form } from 'semantic-ui-react'
import { Decision } from '../../utils/generated/graphql'
import { DecisionOption } from '../../utils/types'

type ReviewDecisionProps = {
  decisionOptions: DecisionOption[]
  setDecision: (decision: Decision) => void
  isDecisionError: boolean
}

const ReviewDecision: React.FC<ReviewDecisionProps> = ({
  decisionOptions,
  setDecision,
  isDecisionError,
}) => {
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
}

export default ReviewDecision
