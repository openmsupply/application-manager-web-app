import React from 'react'
import { Button, Modal, Segment } from 'semantic-ui-react'
import { useRouter } from '../../utils/hooks/useRouter'
import useGetQuestionReviewHistory from '../../utils/hooks/useGetQuestionReviewHistory'
import HistoryResponseElement from '../PageElements/Elements/HistoryResponseElement'
import { useUserState } from '../../contexts/UserState'
import { Stage } from '../Review'
import strings from '../../utils/constants'
import { StageDetails } from '../../utils/types'

interface HistoryPanelProps {
  templateCode: string
  // userLevel?: number
  stages: StageDetails[]
  isApplicant?: boolean
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({
  templateCode,
  // userLevel = 1,
  stages,
  isApplicant = false,
}) => {
  const {
    userState: { currentUser },
  } = useUserState()
  const {
    query: { serialNumber, showHistory },
    updateQuery,
  } = useRouter()

  const { historyList } = useGetQuestionReviewHistory({
    serial: serialNumber,
    questionCode: showHistory,
    templateCode,
    userId: currentUser?.userId || 0,
    // userLevel,
    isApplicant,
  })

  return (
    <Modal
      id="history-panel"
      closeIcon
      open={!!showHistory}
      onClose={() => updateQuery({ showHistory: null })}
    >
      <Modal.Header>{strings.TITLE_HISTORY_PANEL}</Modal.Header>
      <Modal.Content scrolling>
        <Modal.Description>
          {historyList.map(({ stageNumber, historyElements }) => {
            const stageDetails = stages.find(({ number }) => number === stageNumber)
            const stageName = stageDetails?.name || strings.STAGE_NOT_FOUND
            const stageColour = stageDetails?.colour || ''
            return (
              <div key={`history_stage_${stageName}`}>
                <Stage name={stageName} colour={stageColour} />
                {historyElements.map((historyElement, index) => (
                  <Segment basic className="summary-page-element-container" key={index}>
                    <div className="response-container">
                      <HistoryResponseElement {...historyElement} />
                    </div>
                  </Segment>
                ))}
              </div>
            )
          })}
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Button
          onClick={() => updateQuery({ showHistory: null })}
          primary
          content={strings.BUTTON_BACK}
        />
      </Modal.Actions>
    </Modal>
  )
}

export default HistoryPanel
