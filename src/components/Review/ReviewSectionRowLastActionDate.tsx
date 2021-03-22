import React from 'react'
import { Grid, Label } from 'semantic-ui-react'
import getSimplifiedTimeDifference from '../../utils/dateAndTime/getSimplifiedTimeDifference'
import { ReviewAction, ReviewSectionComponentProps } from '../../utils/types'
import strings from '../../utils/constants'
import { ReviewAssignmentStatus } from '../../utils/generated/graphql'

const ReviewSectionRowLastActionDate: React.FC<ReviewSectionComponentProps> = ({
  action,
  thisReview,
  assignment,
  fullStructure,
}) => {
  const getContent = () => {
    switch (action) {
      case ReviewAction.canContinue: {
        return (
          <LastDate
            title={strings.ACTION_DATE_REVIEW_STARTED}
            indicator={getSimplifiedTimeDifference(thisReview?.timeStatusCreated)}
          />
        )
      }
      case ReviewAction.canView: {
        return (
          <LastDate
            title={strings.ACTION_DATE_REVIEW_SUBMITTED}
            indicator={getSimplifiedTimeDifference(thisReview?.timeStatusCreated)}
          />
        )
      }
      case ReviewAction.canStartReview: {
        return (
          <LastDate
            title={strings.ACTION_DATE_ASSIGNED}
            indicator={getSimplifiedTimeDifference(assignment.timeCreated)}
          />
        )
      }

      case ReviewAction.canReReview: {
        return (
          <LastDate
            title={strings.ACTION_DATE_RE_SUBMITTED}
            indicator={getSimplifiedTimeDifference(fullStructure?.info.current?.date)}
          />
        )
      }

      case ReviewAction.canSelfAssign: {
        return (
          <LastDate
            title="APPLICATION SUBMITTED"
            indicator={getSimplifiedTimeDifference(fullStructure?.info.current?.date)}
          />
        )
      }

      default:
        return null
    }
  }

  return <Grid.Column>{getContent()}</Grid.Column>
}

const LastDate: React.FC<{ title: string; indicator?: React.ReactNode }> = ({
  title,
  indicator,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase' }}
      >
        {title}
      </div>
      <Label className="dreistripedlabel" style={{ fontSize: 12 }}>
        {indicator}
      </Label>
    </div>
  )
}

export default ReviewSectionRowLastActionDate
