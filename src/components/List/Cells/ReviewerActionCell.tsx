import React from 'react'
import { Link } from 'react-router-dom'
import { CellProps } from '../../../utils/types'
import strings from '../../../utils/constants'
import { AssignerAction, ReviewerAction } from '../../../utils/generated/graphql'
import { Icon } from 'semantic-ui-react'

const ReviewerActionCell: React.FC<CellProps> = ({
  application: { serial, reviewerAction, assignerAction },
}) => {
  const actions = []

  const getReviewActionString = (reviewerAction: ReviewerAction) => {
    switch (reviewerAction) {
      case ReviewerAction.SelfAssign:
        return strings.ACTION_SELF_ASSIGN
      case ReviewerAction.UpdateReview:
        return strings.ACTION_UPDATE
      case ReviewerAction.RestartReview:
        return strings.ACTION_RE_REVIEW
      case ReviewerAction.ContinueReview:
        return strings.ACTION_CONTINUE
      case ReviewerAction.StartReview:
        return strings.ACTION_START
      default:
        // ReviewerAction.ViewReview
        return strings.ACTION_VIEW
    }
  }

  const getAssignActionString = (assignerAction: AssignerAction) => {
    switch (assignerAction) {
      case AssignerAction.ReAssign:
        return strings.ACTION_RE_ASSIGN
      default:
        // AssignerAction.Assign
        return strings.ACTION_ASSIGN
    }
  }

  if (!!reviewerAction) actions.push(getReviewActionString(reviewerAction))
  if (!!assignerAction) actions.push(getAssignActionString(assignerAction))

  if (actions.length == 0)
    return (
      <Link className="user-action" to={`/application/${serial}/review`}>
        <Icon name="angle right" />
      </Link>
    )

  return (
    <>
      {actions.map((action, index) => (
        <>
          {/* To-do: style the | once we can see it properly */}
          {index > 0 ? <span key={`divider_${index}`}>{' | '}</span> : ''}
          <Link key={index} className="user-action" to={`/application/${serial}/review`}>
            {action}
          </Link>
        </>
      ))}
    </>
  )
}

export default ReviewerActionCell
