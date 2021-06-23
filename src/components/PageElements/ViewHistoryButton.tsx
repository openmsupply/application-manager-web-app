import React from 'react'
import { Label } from 'semantic-ui-react'
import strings from '../../utils/constants'
import { useRouter } from '../../utils/hooks/useRouter'

const ViewHistoryButton: React.FC<{ elementCode: string }> = ({ elementCode }) => {
  const { updateQuery } = useRouter()
  return (
    <div className="history-container">
      <Label
        className="link-label clickable"
        icon="history"
        content={strings.BUTTON_VIEW_HISTORY}
        onClick={() => updateQuery({ showHistory: elementCode })}
      />
    </div>
  )
}

export default ViewHistoryButton
