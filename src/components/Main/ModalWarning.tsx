import React from 'react'
import { Button, Header, Icon, Modal, ModalProps } from 'semantic-ui-react'

const ModalWarning: React.FC<ModalProps> = (showModal) => {
  const { open, title, message, option, onClick } = showModal

  // TOOD: Use more props from ModalProps for more general configuration of modal (e.g. Shorthand for different actions)
  return (
    <Modal open={open} basic size="small">
      <Header icon>
        <Icon name="exclamation triangle" color="orange" />
        {title}
      </Header>
      <Modal.Content>
        <p>{message}</p>
      </Modal.Content>
      <Modal.Actions>
        <Button
          color="green"
          inverted
          icon={<Icon name="checkmark" color="green" />}
          content={option}
          onClick={onClick}
        />
      </Modal.Actions>
    </Modal>
  )
}

export default ModalWarning
