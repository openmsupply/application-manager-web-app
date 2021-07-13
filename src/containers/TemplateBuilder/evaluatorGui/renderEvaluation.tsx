import evaluateExpression from '@openmsupply/expression-evaluator'
import { IParameters, ValueNode } from '@openmsupply/expression-evaluator/lib/types'
import React, { useState } from 'react'
import { Header, Icon, Modal, Portal, Segment } from 'semantic-ui-react'
import { Loading } from '../../../components'
import { guis } from './guiDefinitions'
import Markdown from '../../../utils/helpers/semanticReactMarkdown'
import {
  convertTypedEvaluationToBaseType,
  getTypedEvaluation,
  getTypedEvaluationAsString,
} from './typeHelpers'
import { EvaluationType, ParseAndRenderEvaluationType, RenderEvaluationElementType } from './types'

export const renderEvaluation: ParseAndRenderEvaluationType = (
  evaluation,
  setEvaluation,
  ComponentLibrary,
  evaluatorParamers
) => {
  const _setEvaluation = (typedEvaluation: EvaluationType) =>
    setEvaluation(convertTypedEvaluationToBaseType(typedEvaluation))

  return renderEvaluationElement(evaluation, _setEvaluation, ComponentLibrary, evaluatorParamers)
}

const Evaluate: React.FC<{ typedEvaluation: EvaluationType; evaluatorParamers?: IParameters }> = ({
  typedEvaluation,
  evaluatorParamers,
}) => {
  const [evaluationResult, setEvaluationResult] = useState<ValueNode | undefined | null>(null)

  const evaluateNode = async () => {
    try {
      const result = await evaluateExpression(
        convertTypedEvaluationToBaseType(typedEvaluation),
        evaluatorParamers
      )
      setEvaluationResult(result)
    } catch (e) {
      setEvaluationResult('Problem Executing Evaluation')
    }
  }

  return (
    <>
      <Icon className="clickable" name="lightning" onClick={() => evaluateNode()} />
      <Modal
        className="config-modal"
        open={evaluationResult !== null}
        onClose={() => setEvaluationResult(null)}
      >
        <div className="config-modal-container ">
          <Header>Evaluation Result</Header>
          {evaluationResult === undefined && <Loading />}
          {evaluationResult !== undefined && (
            <pre>{JSON.stringify(evaluationResult, null, ' ')}</pre>
          )}
          {typeof evaluationResult === 'string' && (
            <>
              <Header as="h4">Markdown</Header>
              <Markdown text={evaluationResult} />
            </>
          )}
        </div>
      </Modal>
    </>
  )
}

export const renderEvaluationElement: RenderEvaluationElementType = (
  evaluation,
  setEvaluation,
  ComponentLibrary,
  evaluatorParamers
) => {
  const typedEvaluation = getTypedEvaluation(evaluation)
  const gui = guis.find(({ match }) => match(typedEvaluation))
  const selections = guis.map(({ selector }) => selector)
  const onSelect = (selected: string) => {
    const selectedGui = guis.find(({ selector }) => selector === selected)
    if (selectedGui) setEvaluation(selectedGui.default)
  }
  try {
    if (gui) {
      return (
        <ComponentLibrary.FlexRow>
          <ComponentLibrary.Step />
          <ComponentLibrary.OperatorContainer>
            <ComponentLibrary.FlexRow>
              <ComponentLibrary.Selector
                selections={selections}
                selected={gui.selector}
                setSelected={onSelect}
                title="operator"
              />
              <Evaluate typedEvaluation={typedEvaluation} evaluatorParamers={evaluatorParamers} />
            </ComponentLibrary.FlexRow>
            {gui.render(typedEvaluation, setEvaluation, ComponentLibrary, evaluatorParamers)}
          </ComponentLibrary.OperatorContainer>
        </ComponentLibrary.FlexRow>
      )
    }
  } catch (e) {
    return <ComponentLibrary.Error error={'problem rendering element'} info={e.toString()} />
  }
  return (
    <ComponentLibrary.Error
      error={'operator not found'}
      info={getTypedEvaluationAsString(evaluation)}
    />
  )
}
