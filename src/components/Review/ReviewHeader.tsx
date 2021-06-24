import React from 'react'
import { Header } from 'semantic-ui-react'
import { StageDetails } from '../../utils/types'
import strings from '../../utils/constants'
import { Stage } from '../Review'

export interface ReviewHeaderProps {
  applicationName: string
  stage: StageDetails
}

const ReviewHeader: React.FC<ReviewHeaderProps> = ({ applicationName, stage }) => {
  return (
    <div id="application-summary-header">
      <Header
        as="h5"
        content={applicationName}
        subheader={<Header as="h2" content={strings.LABEL_REVIEW} />}
      />
      <Stage name={stage.name || ''} colour={stage.colour} />
      {/* <p>{strings.SUBTITLE_REVIEW}</p> */}
    </div>
  )
}

export default ReviewHeader
