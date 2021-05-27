import React from 'react'
import { Grid, Icon, Label } from 'semantic-ui-react'
import strings from '../../utils/constants'
import { User } from '../../utils/generated/graphql'
import { ReviewAction, ReviewSectionComponentProps } from '../../utils/types'

const ReviewSectionRowAssigned: React.FC<ReviewSectionComponentProps> = ({
  isAssignedToCurrentUser,
  action,
  assignment,
}) => {
  const getLabel = () => {
    switch (action) {
      case ReviewAction.canSelfAssign:
        return isAssignedToCurrentUser ? (
          <CurrentSelfAssignmentLabel />
        ) : (
          <TheirSelfAssignmentLabel {...assignment.reviewer} />
        )
      case ReviewAction.canStartReview:
      case ReviewAction.canContinue:
      case ReviewAction.canReReview:
      case ReviewAction.canUpdate:
      case ReviewAction.canView:
        return isAssignedToCurrentUser ? (
          <CurrentReviewInProgressLabel />
        ) : (
          <TheirReviewInProgressLabel {...assignment.reviewer} />
        )
      case ReviewAction.canSelfAssignLocked:
      case ReviewAction.canContinueLocked:
        return isAssignedToCurrentUser ? (
          <CurrentReviewLockedLabel />
        ) : (
          <TheirReviewLockedLabel {...assignment.reviewer} />
        )
      default:
        return null
    }
  }
  return <Grid.Column className="padding-zero">{getLabel()}</Grid.Column>
}

const CurrentReviewInProgressLabel: React.FC = () => (
  <Label
    className="simple-label relevant-text"
    sie="large"
    icon={<Icon name="circle" size="tiny" color="blue" />}
    content={strings.LABEL_ASSIGNED_TO_YOU}
  />
)

const CurrentSelfAssignmentLabel: React.FC = () => (
  <Label className="simple-label" content={strings.LABEL_ASSIGNMENT_SELF} />
)

const CurrentReviewLockedLabel: React.FC = () => (
  <Label
    className="simple-label"
    icon={<Icon name="ban" size="small" color="pink" />}
    content={
      <>
        {`${strings.LABEL_ASSIGNMENT_LOCKED} `}
        <Label className="simple-label" content={strings.REVIEW_FILTER_YOURSELF} />
      </>
    }
  />
)

const ReviewerLabel: React.FC<User> = ({ firstName, lastName }) => (
  <Label className="simple-label info-text" content={`${firstName || ''} ${lastName || ''}`} />
)

const TheirReviewLockedLabel: React.FC<User> = (reviewer) => (
  <Label
    className="simple-label"
    icon={<Icon name="ban" size="small" color="pink" />}
    content={
      <>
        {`${strings.LABEL_ASSIGNMENT_LOCKED} `}
        <ReviewerLabel {...reviewer} />
      </>
    }
  />
)

const TheirSelfAssignmentLabel: React.FC<User> = (reviewer) => (
  <Label
    className="simple-label"
    content={
      <>
        {`${strings.LABEL_ASSIGNMENT_AVAILABLE} `}
        <ReviewerLabel {...reviewer} />
      </>
    }
  />
)

const TheirReviewInProgressLabel: React.FC<User> = (reviewer) => (
  <Label
    className="simple-label"
    content={
      <>
        {`${strings.LABEL_REVIEWED_BY} `}
        <ReviewerLabel {...reviewer} />
      </>
    }
  />
)

export default ReviewSectionRowAssigned
