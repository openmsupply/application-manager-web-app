import React from 'react'
import { Button, Header, Icon, Modal, ModalProps } from 'semantic-ui-react'

const ModalConfirmation: React.FC<ModalProps> = (showModal) => {
  const { title, message, option, onClick, ...modalProps } = showModal
  // TOOD: Use more props from ModalProps for more general configuration of modal (e.g. Shorthand for different actions)
  //   <Modal
  //   trigger={<Button>Show Modal</Button>}
  //   header='Reminder!'
  //   content='Call Benjamin regarding the reports.'
  //   actions={['Snooze', { key: 'done', content: 'Done', positive: true }]}
  // />
  return (
    <Modal closeIcon {...modalProps} basic size="small">
      <Header icon>
        <Icon name="check square outline" color="green" />
        {title}
      </Header>
      <Modal.Content>
        <p>{message}</p>
      </Modal.Content>
      <Modal.Actions>
        <Button
          color="green"
          inverted
          icon="checkmark"
          content={option}
          onClick={() => onClick()}
        />
      </Modal.Actions>
    </Modal>
  )
}

export default ModalConfirmation
