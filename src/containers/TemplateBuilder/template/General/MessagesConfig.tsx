import React from 'react'
import { useEffect, useState } from 'react'
import { Label, Modal } from 'semantic-ui-react'
import ButtonWithFallback from '../../shared/ButtonWidthFallback'
import Evaluation from '../../shared/Evaluation'
import { useOperationState } from '../../shared/OperationContext'
import { useApplicationState } from '../ApplicationWrapper'
import { disabledMessage, useTemplateState } from '../TemplateWrapper'

type MessagesConfigProps = {
  isOpen: boolean
  onClose: () => void
}

type Evaluations = {
  key: 'submissionMessage' | 'startMessage'
  title: string
}[]
const evaluations: Evaluations = [
  { key: 'startMessage', title: 'Start Message' },
  { key: 'submissionMessage', title: 'Submission Message' },
]

const MessagesConfig: React.FC<MessagesConfigProps> = ({ isOpen, onClose }) => {
  const { structure } = useApplicationState()
  const {
    template: { isDraft, id: templateId },
    fromQuery,
  } = useTemplateState()
  const { updateTemplate } = useOperationState()

  const [state, setState] = useState({
    startMessage: fromQuery?.startMessage,
    submissionMessage: fromQuery?.submissionMessage,
  })

  useEffect(() => {
    if (!isOpen) return

    setState({
      startMessage: fromQuery?.startMessage,
      submissionMessage: fromQuery?.submissionMessage,
    })
  }, [isOpen])

  if (!isOpen) return null

  const updateMessage = async () => {
    const { startMessage, submissionMessage } = state
    const result = await updateTemplate(templateId, {
      startMessage,
      submissionMessage,
    })
    if (!result) return

    onClose()
  }

  return (
    <Modal className="config-modal" open={true} onClose={onClose}>
      <div className="config-modal-container">
        {!isDraft && <Label color="red">Template form only editable on draft templates</Label>}

        {evaluations.map(({ key, title }) => (
          <Evaluation
            label={title}
            key={key}
            currentElementCode={''}
            fullStructure={structure}
            evaluation={state[key]}
            setEvaluation={(evaluation) => setState({ ...state, [key]: evaluation })}
          />
        ))}
        <div className="spacer-20" />
        <div className="flex-row-center-center">
          <ButtonWithFallback
            title="Save"
            disabled={!isDraft}
            disabledMessage={disabledMessage}
            onClick={updateMessage}
          />
          ˀ
          <ButtonWithFallback title="Cancel" onClick={onClose} />
        </div>
      </div>
    </Modal>
  )
}

export default MessagesConfig
