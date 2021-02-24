import { ReviewResponseDecision, TemplateElementCategory } from '../../generated/graphql'
import {
  ReviewerResponsesPayload,
  ReviewProgressStatus,
  ReviewQuestionDecision,
  SectionDetails,
  SectionState,
} from '../../types'

export enum REVIEW_PROGRESS_STATUS {
  NOT_COMPLETED = 'NOT_COMPLETED',
  DECLINED = 'DECLINED',
  APPROVED = 'APPROVED',
}

/**
 * @function validateReview
 * Run the validation of the review responses progress of sections
 * assigned to the reviewer and check if review is complete:
 * - All review responses are Approved, or
 * - At least one review response is Decline
 * @param userId Current reviewer userId
 * @param reviewSections All reviews responses and elements of application
 * @returns Section details of first incomple review or undefined if valid review
 */
export const validateReview = ({
  userId,
  reviewSections,
}: ReviewerResponsesPayload): SectionDetails | undefined => {
  const sectionsProgress: {
    section: SectionDetails
    progress: ReviewProgressStatus
  }[] = Object.values(reviewSections)
    .filter(({ assigned }) => assigned?.id === userId)
    .map((section) => {
      return getReviewProgressStatus(section)
    })
  return sectionsProgress.some(({ progress }) => progress === REVIEW_PROGRESS_STATUS.DECLINED) ||
    sectionsProgress.every(({ progress }) => progress === REVIEW_PROGRESS_STATUS.APPROVED)
    ? undefined
    : sectionsProgress.find(({ progress }) => progress === REVIEW_PROGRESS_STATUS.NOT_COMPLETED)
        ?.section
}

/**
 * @function getReviewProgressStatus
 * Get review progress on the specific section received
 * @param section State of section in the structure - containing pages with review_responses
 * @returns Object with section details and review progress status
 */
const getReviewProgressStatus = (
  section: SectionState
): { section: SectionDetails; progress: ReviewProgressStatus } => {
  const sectionReviews = getReviewsInSection(section)
  return {
    section: section.details,
    progress: sectionReviews.some(({ decision }) => decision === ReviewResponseDecision.Decline)
      ? REVIEW_PROGRESS_STATUS.DECLINED
      : sectionReviews.every(({ decision }) => decision === ReviewResponseDecision.Approve)
      ? REVIEW_PROGRESS_STATUS.APPROVED
      : REVIEW_PROGRESS_STATUS.NOT_COMPLETED,
  }
}

/**
 * @function getReviewsInSection
 * Get flattened array of all review responses in the section received.
 * @param section State of section in the structure - containing pages with review_responses
 */
const getReviewsInSection = (section: SectionState): ReviewQuestionDecision[] => {
  const { pages } = section
  const reviewResponses: ReviewQuestionDecision[] = []
  Object.values(pages).forEach(({ state }) => {
    // TODO: Create utility function to filter out all INFORMATION elements when checking for status
    const questions = state
      .filter(({ element }) => element.category === TemplateElementCategory.Question)
      .filter(({ review }) => review !== undefined)
    reviewResponses.concat(questions.map(({ review }) => review as ReviewQuestionDecision))
  })

  return reviewResponses
}
