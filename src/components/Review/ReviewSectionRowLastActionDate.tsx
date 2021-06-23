import React from 'react'
import { Grid, Label } from 'semantic-ui-react'
import getSimplifiedTimeDifference from '../../utils/dateAndTime/getSimplifiedTimeDifference'
import { ReviewAction, ReviewSectionComponentProps } from '../../utils/types'
import strings from '../../utils/constants'

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
            indicator={getSimplifiedTimeDifference(thisReview?.stage.statusCreatedDate)}
          />
        )
      }
      case ReviewAction.canView: {
        return (
          <LastDate
            title={strings.ACTION_DATE_REVIEW_SUBMITTED}
            indicator={getSimplifiedTimeDifference(thisReview?.stage.statusCreatedDate)}
          />
        )
      }
      case ReviewAction.canStartReview: {
        return (
          <LastDate
            title={strings.ACTION_DATE_ASSIGNED}
            indicator={getSimplifiedTimeDifference(assignment.timeUpdated)}
          />
        )
      }

      case ReviewAction.canReReview: {
        return (
          <LastDate
            title={strings.ACTION_DATE_RE_SUBMITTED}
            indicator={getSimplifiedTimeDifference(
              fullStructure?.info.currentStage?.statusCreatedDate
            )}
          />
        )
      }

      case ReviewAction.canSelfAssign: {
        return (
          <LastDate
            title={strings.LABEL_APPLICATION_SUBMITTED}
            indicator={getSimplifiedTimeDifference(
              fullStructure?.info.currentStage?.statusCreatedDate
            )}
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
  return <Label className="simple-label" content={indicator} />
}

export default ReviewSectionRowLastActionDate
