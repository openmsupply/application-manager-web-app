import React, { ReactNode } from 'react'
import { Icon, Label } from 'semantic-ui-react'
import strings from '../../utils/constants'
import { User } from '../../utils/generated/graphql'

export const CurrentReviewInProgressLabel: React.FC = () => (
  <LabelWrapper
    labelContent={strings.LABEL_ASSIGNED_TO_YOU}
    iconNode={<Icon name="circle" size="tiny" color="blue" />}
    showAsRelevantInfo={true}
  />
)

export const CurrentSelfAssignmentLabel: React.FC = () => (
  <LabelWrapper labelContent={strings.LABEL_ASSIGNMENT_SELF} />
)

export const CurrentReviewLockedLabel: React.FC = () => (
  <LabelWrapper
    labelContent={`${strings.LABEL_ASSIGNMENT_LOCKED} ${strings.REVIEW_FILTER_YOURSELF}`}
    iconNode={<Icon name="ban" size="small" color="pink" />}
  />
)

export const TheirReviewLockedLabel: React.FC<User> = (reviewer) => (
  <LabelWrapper
    labelContent={`${strings.LABEL_ASSIGNMENT_LOCKED} `}
    iconNode={<Icon name="ban" size="small" color="pink" />}
    reviewer={reviewer}
  />
)

export const TheirSelfAssignmentLabel: React.FC<User> = (reviewer) => (
  <LabelWrapper labelContent={`${strings.LABEL_ASSIGNMENT_AVAILABLE} `} reviewer={reviewer} />
)

export const TheirReviewInProgressLabel: React.FC<User> = (reviewer) => (
  <LabelWrapper labelContent={`${strings.LABEL_REVIEW_REVIEWED_BY} `} reviewer={reviewer} />
)

export const ReviewByLabel: React.FC<{ user?: User }> = ({ user }) => {
  const doneByYourself = !user
  const reviewLabel = `${strings.LABEL_REVIEW_REVIEWED_BY} ${
    doneByYourself ? strings.ASSIGNMENT_YOURSELF : ''
  }`
  return <LabelWrapper labelContent={reviewLabel} reviewer={user} />
}

export const ConsolidationByLabel: React.FC<{ user?: User }> = ({ user }) => {
  const doneByYourself = !user
  const consolidationLabel = `${strings.LABEL_REVIEW_CONSOLIDATION_BY} ${
    doneByYourself ? strings.ASSIGNMENT_YOURSELF : ''
  }`
  return <LabelWrapper labelContent={consolidationLabel} reviewer={user} />
}

interface LabelWrapperProps {
  reviewer?: User
  iconNode?: ReactNode
  labelContent: string
  showAsRelevantInfo?: boolean
}

const LabelWrapper: React.FC<LabelWrapperProps> = ({
  iconNode,
  labelContent,
  reviewer,
  showAsRelevantInfo = false,
}) => (
  <Label
    className={`simple-label ${showAsRelevantInfo ? 'relevant-text' : ''}`}
    icon={iconNode}
    content={
      <>
        {labelContent}
        {reviewer && <ReviewerLabel {...reviewer} />}
      </>
    }
  />
)

const ReviewerLabel: React.FC<User> = ({ firstName, lastName }) => (
  <Label className="simple-label info-text" content={`${firstName || ''} ${lastName || ''}`} />
)
