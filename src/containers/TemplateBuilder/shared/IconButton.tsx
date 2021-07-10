import React from 'react'

import { Icon, Popup } from 'semantic-ui-react'
import { SemanticICONS } from 'semantic-ui-react/dist/commonjs/generic'

type IconButtonProps = {
  disabledMessage?: string
  disabled?: boolean
  title?: string
  name: SemanticICONS
  onClick: () => void
}

export const IconButton: React.FC<IconButtonProps> = ({
  name,
  onClick,
  title = '',
  disabledMessage,
  disabled = false,
}) => {
  const renderIcon = () => (
    <Icon
      className={`icon-button`}
      name={name}
      onClick={() => (disabled ? console.log('action disable') : onClick())}
    />
  )
  return (
    <Popup
      content={disabledMessage}
      disabled={!disabled || !disabledMessage}
      trigger={
        <div className={disabled ? '' : 'clickable'}>
          {title && (
            <div className={`io-wrapper`}>
              <div className="io-component key">{title}</div>
              <div className="io-component value">{renderIcon()}</div>
            </div>
          )}
          {!title && renderIcon()}
        </div>
      }
    />
  )
}
