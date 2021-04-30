import React from 'react'
import { Grid, Icon, Label } from 'semantic-ui-react'
import strings from '../../utils/constants'
import { ReviewAction, ReviewSectionComponentProps } from '../../utils/types'

const ReviewSectionRowAssigned: React.FC<ReviewSectionComponentProps> = ({
  isAssignedToCurrentUser,
  action,
  assignment,
}) => {
  const isSelfAssigned: boolean =
    action === ReviewAction.canStartReview || action === ReviewAction.canContinue
  const isReviewLocked: boolean =
    action === ReviewAction.canSelfAssignLocked || action === ReviewAction.canContinueLocked
  return (
    <Grid.Column className="padding-zero">
      {isAssignedToCurrentUser && action === ReviewAction.canSelfAssign ? (
        <Label className="simple-label" content={strings.LABEL_ASSIGNMENT_SELF} />
      ) : isSelfAssigned ? (
        <Label
          className="simple-label"
          colour="blue"
          sie="large"
          icon={<Icon name="circle" size="tiny" color="blue" />}
          content={strings.LABEL_ASSIGNED_TO_YOU}
        />
      ) : isReviewLocked ? (
        <Label
          className="simple-label"
          icon={<Icon name="ban" size="small" />}
          content={
            <>
              {`${strings.LABEL_ASSIGNMENT_LOCKED} `}
              <Label
                className="simple-label text-blue"
                content={
                  isAssignedToCurrentUser
                    ? strings.REVIEW_FILTER_YOURSELF
                    : `${assignment.reviewer?.firstName || ''} ${
                        assignment.reviewer?.lastName || ''
                      }`
                }
              />
            </>
          }
        />
      ) : (
        <Label
          className="simple-label"
          content={
            <>
              {action === ReviewAction.canSelfAssign
                ? `${strings.LABEL_ASSIGNMENT_AVAILABLE} `
                : `${strings.LABEL_REVIEWED_BY} `}
              <Label
                className="simple-label text-blue"
                content={
                  isAssignedToCurrentUser
                    ? strings.REVIEW_FILTER_YOURSELF
                    : `${assignment.reviewer?.firstName || ''} ${
                        assignment.reviewer?.lastName || ''
                      }`
                }
              />
            </>
          }
        />
      )}
    </Grid.Column>
  )
}

export default ReviewSectionRowAssigned
