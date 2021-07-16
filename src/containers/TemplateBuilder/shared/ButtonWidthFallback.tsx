import React from 'react'
import { Popup, Button } from 'semantic-ui-react'

type ButtonWithFallbackProps = {
  onClick: () => void
  title: string
  disabled?: boolean
  disabledMessage?: string
}

const ButtonWithFallback: React.FC<ButtonWithFallbackProps> = ({
  onClick,
  title,
  disabled = false,
  disabledMessage,
}) => (
  <Popup
    content={disabledMessage}
    disabled={!disabled || !disabledMessage}
    trigger={
      <div>
        <Button inverted primary size="tiny" disabled={disabled} onClick={onClick}>
          {title}
        </Button>
      </div>
    }
  />
)

export default ButtonWithFallback
