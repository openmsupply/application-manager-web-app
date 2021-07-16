import React, { useState } from 'react'
import { Accordion, Button, Header, Icon } from 'semantic-ui-react'
import { EvaluatorNode, FullStructure } from '../../../utils/types'
import CheckboxIO from './CheckboxIO'
import Evaluation from './Evaluation'
import JsonIO from './JsonIO'

export type ParametersType = {
  [key: string]: EvaluatorNode
}
type ParametersProps = {
  parameters: ParametersType
  currentElementCode: string
  setParameters: (parameters: ParametersType) => void
  fullStructure?: FullStructure
}

export const Parameters: React.FC<ParametersProps> = ({
  parameters,
  setParameters,
  currentElementCode,
  fullStructure,
}) => {
  const [asGui, setAsGui] = useState(true)
  const [isActive, setIsActive] = useState(false)

  const sortedParameters = Object.entries(parameters).sort(([key1], [key2]) =>
    key1 > key2 ? -1 : key1 === key2 ? 0 : 1
  )
  return (
    <Accordion className="evaluation-container config-container-alternate">
      <Accordion.Title
        className="evaluation-container-title"
        active={isActive}
        onClick={() => setIsActive(!isActive)}
      >
        <Header
          as="h4"
          className="no-margin-no-padding"
        >{`Plugin Specific Parameters (${sortedParameters.length})`}</Header>
        <Icon size="large" name={isActive ? 'angle up' : 'angle down'} />
      </Accordion.Title>
      {isActive && (
        <Accordion.Content className="evaluation-container-content" active={isActive}>
          <>
            <div className="flex-column-start-center">
              <div className="flex-row-center-center">
                <CheckboxIO title="Show As GUI" value={asGui} setValue={setAsGui} />
                <div className="spacer-10" />
                {asGui && (
                  <Button
                    primary
                    inverted
                    onClick={() => {
                      setParameters({ ...parameters, newParameter: null })
                    }}
                  >
                    Add Parameter
                  </Button>
                )}
              </div>
              {!asGui && (
                <div className="long">
                  <JsonIO
                    isPropUpdated={true}
                    object={parameters}
                    label=""
                    setObject={(value) => setParameters(value as ParametersType)}
                  />
                </div>
              )}

              {asGui &&
                sortedParameters.map(([key, value]) => (
                  <Evaluation
                    setEvaluation={(value: any) =>
                      setParameters({ ...parameters, [key]: value?.value || value })
                    }
                    updateKey={(newKey) => {
                      const newParameters = { ...parameters }
                      delete newParameters[key]
                      setParameters({ ...newParameters, [newKey]: value })
                    }}
                    deleteKey={() => {
                      const newParameters = { ...parameters }
                      delete newParameters[key]
                      setParameters(newParameters)
                    }}
                    key={key}
                    evaluation={value}
                    currentElementCode={currentElementCode}
                    fullStructure={fullStructure}
                    label={key}
                  />
                ))}
            </div>
          </>
        </Accordion.Content>
      )}
    </Accordion>
  )
}
