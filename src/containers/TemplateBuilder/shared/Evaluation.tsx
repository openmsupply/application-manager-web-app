import { EvaluatorNode } from '@openmsupply/expression-evaluator/lib/types'
import { truncate } from 'lodash'
import React, { useState } from 'react'
import ReactJson from 'react-json-view'
import { Accordion, Icon, Label } from 'semantic-ui-react'
import config from '../../../config'
import { useUserState } from '../../../contexts/UserState'
import { FullStructure } from '../../../utils/types'
import { renderEvaluation } from '../evaluatorGui/renderEvaluation'
import semanticComponentLibrary from '../evaluatorGui/semanticComponentLibrary'
import { getTypedEvaluation, getTypedEvaluationAsString } from '../evaluatorGui/typeHelpers'
import CheckboxIO from './CheckboxIO'
import JsonIO from './JsonIO'
import TextIO from './TextIO'

type EvaluationProps = {
  evaluation: EvaluatorNode
  currentElementCode: string
  setEvaluation: (evaluation: EvaluatorNode) => void
  fullStructure?: FullStructure
  label: string
  updateKey?: (key: string) => void
  deleteKey?: () => void
}

const Evaluation: React.FC<EvaluationProps> = ({
  evaluation,
  setEvaluation,
  label,
  currentElementCode,
  fullStructure,
  updateKey,
  deleteKey,
}) => {
  const {
    userState: { currentUser },
  } = useUserState()
  const [isActive, setIsActive] = useState(false)
  const [asGui, setAsGui] = useState(true)
  const objects = {
    responses: {
      ...fullStructure?.responsesByCode,
      thisResponse: fullStructure?.responsesByCode?.[currentElementCode]?.text,
    },
    currentUser,
    applicationData: fullStructure?.info,
  }

  const evaluationParameters = {
    objects,
    APIfetch: fetch,
    graphQLConnection: {
      fetch: fetch.bind(window),
      endpoint: config.serverGraphQL,
    },
  }

  const typedEvaluation = getTypedEvaluation(evaluation)

  return (
    <Accordion className="evaluation-container">
      <Accordion.Title className="evaluation-container-title" active={isActive}>
        {!updateKey && <Label>{label}</Label>}
        {deleteKey && <Icon className="clickable" name="window close" onClick={deleteKey} />}

        {updateKey && <TextIO title="Parameter Name" text={label} setText={updateKey} />}

        <TextIO title="Type" text={typedEvaluation.type} />
        {typedEvaluation.type === 'operator' && (
          <TextIO title="operator" text={typedEvaluation.asOperator.operator} />
        )}
        <TextIO title="Type" text={typedEvaluation.type} />

        {typedEvaluation.type !== 'operator' && (
          <TextIO
            title="Type"
            text={truncate(getTypedEvaluationAsString(typedEvaluation), { length: 80 })}
          />
        )}
        <Icon
          size="large"
          name={isActive ? 'angle up' : 'angle down'}
          onClick={() => setIsActive(!isActive)}
        />
      </Accordion.Title>
      {isActive && (
        <Accordion.Content className="evaluation-container-content" active={isActive}>
          <>
            <div className="flex-column-start-center">
              <CheckboxIO title="Show As GUI" value={asGui} setValue={setAsGui} />
              {!asGui && (
                <div className="long">
                  <JsonIO
                    isPropUpdated={true}
                    object={asObject(evaluation)}
                    label="Plugin Parameters"
                    setObject={(value) => setEvaluation(value)}
                  />
                </div>
              )}
              {asGui &&
                renderEvaluation(
                  evaluation,
                  (evaluation) => setEvaluation(evaluation),
                  semanticComponentLibrary,
                  evaluationParameters
                )}
            </div>
            {fullStructure && (
              <div className="object-properties-container">
                <Label>Object Properties</Label>
                <ReactJson src={objects} collapsed={2} />
              </div>
            )}
          </>
        </Accordion.Content>
      )}
    </Accordion>
  )
}

export const asObject = (value: EvaluatorNode) =>
  typeof value === 'object' && value !== null
    ? value
    : { value: value || (value === false ? false : null) }

export default Evaluation
