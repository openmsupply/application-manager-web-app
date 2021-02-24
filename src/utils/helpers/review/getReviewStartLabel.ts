import strings from '../../constants'
import { REVIEW_STATUS } from '../../data/reviewStatus'
import { ReviewStatus } from '../../generated/graphql'

/**
 * @function getReviewStartLabel
 * Get label string of option to display on Review start page
 * @param status Current status of review
 */
const getReviewStartLabel = (status: string) => {
  switch (status) {
    case REVIEW_STATUS.DRAFT:
      return strings.BUTTON_REVIEW_CONTINUE
    case REVIEW_STATUS.PENDING:
      return strings.BUTTON_REVIEW_RE_REVIEW
    case REVIEW_STATUS.CHANGES_REQUESTED:
      return strings.BUTTON_REVIEW_MAKE_UPDATES
    case REVIEW_STATUS.SUBMITTED || REVIEW_STATUS.LOCKED:
      return strings.BUTTON_REVIEW_VIEW
    default:
      return status
  }
}

export default getReviewStartLabel
