import React from 'react'
import { Link } from 'react-router-dom'
import { CellProps } from '../../../utils/types'

const ReviewerActionCell: React.FC<CellProps> = ({
  application: {
    reviewAssignedNotStartedCount,
    reviewAssignedCount,
    reviewDraftCount,
    reviewPendingCount,
    reviewSubmittedCount,
    reviewAvailableForSelfAssignmentCount,
    serial,
    assignCount,
    isFullyAssignedLevel1,
  },
}) => {
  const actions = []
  const not0 = (num: number | undefined) => num && Number(num) !== 0
  console.log(
    reviewAssignedNotStartedCount,
    reviewAssignedCount,
    reviewDraftCount,
    reviewPendingCount,
    reviewSubmittedCount,
    reviewAvailableForSelfAssignmentCount,
    not0(reviewPendingCount)
  )
  let canShowView = not0(reviewAssignedCount) || not0(reviewSubmittedCount)
  let canShowStart = not0(reviewAssignedNotStartedCount)

  if (not0(reviewPendingCount)) {
    canShowView = canShowStart = false
    actions.push('Re-Review')
  }

  if (not0(reviewDraftCount)) {
    canShowView = false
    actions.push('Continue')
  }

  if (not0(reviewAvailableForSelfAssignmentCount)) {
    canShowView = false
    actions.push('Self-Assign')
  }

  if (not0(assignCount) && isFullyAssignedLevel1) {
    canShowView = false
    actions.push('Re-Assign')
  }

  if (not0(assignCount) && !isFullyAssignedLevel1) {
    canShowView = false
    actions.push('Assign')
  }

  if (canShowStart) actions.push('Start')
  else if (canShowView) actions.push('View')

  return (
    <>
      {actions.map((action, index) => {
        return (
          <>
            {index > 0 ? <text style={{ color: '#003BFE', fontWeight: 100 }}>{' | '}</text> : ''}
            <Link
              key={index}
              style={{ color: '#003BFE', fontWeight: 400, letterSpacing: 1 }}
              to={`/application/${serial}/review`}
            >
              {action}
            </Link>
          </>
        )
      })}
    </>
  )
}
export default ReviewerActionCell
