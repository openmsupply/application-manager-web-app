import React from 'react'
import { Grid, Message } from 'semantic-ui-react'
import { Loading } from '../../components'
import {
  ReviewSectionRowAssigned,
  ReviewSectionRowLastActionDate,
  ReviewSectionRowProgress,
  ReviewSectionRowAction,
} from '../../components/Review'
import strings from '../../utils/constants'
import useGetFullReviewStructure from '../../utils/hooks/useGetFullReviewStructure'
import {
  AssignmentDetailsNEW,
  FullStructure,
  ReviewAction,
  ReviewSectionComponentProps,
} from '../../utils/types'

// Component renders a line for review assignment within a section
// to be used in ReviewHome and Expansions
type ReviewSectionRowProps = {
  sectionId: number
  assignment: AssignmentDetailsNEW
  fullApplicationStructure: FullStructure
}

const ReviewSectionRow: React.FC<ReviewSectionRowProps> = ({
  sectionId,
  assignment,
  fullApplicationStructure,
}) => {
  const { fullReviewStructure, error } = useGetFullReviewStructure({
    reviewAssignment: assignment,
    fullApplicationStructure,
    filteredSectionIds: [sectionId],
  })

  if (error) return <Message error title={strings.ERROR_GENERIC} list={[error]} />
  if (!fullReviewStructure) return <Loading />
  const section = fullReviewStructure.sortedSections?.find(
    (section) => section.details.id === sectionId
  )
  if (!section) return null

  const thisReview = fullReviewStructure?.thisReview
  const isAssignedToCurrentUser = !!section?.reviewAction?.isAssignedToCurrentUser

  const props: ReviewSectionComponentProps = {
    fullStructure: fullReviewStructure,
    section,
    assignment,
    thisReview,
    isAssignedToCurrentUser,
    action: section?.reviewAction?.action || ReviewAction.unknown,
  }

  return (
    <>
      {section?.reviewAction?.isReviewable && (
        <Grid columns="equal" verticalAlign="middle" style={{ borderRadius: 10 }}>
          <ReviewSectionRowAssigned {...props} />
          <ReviewSectionRowLastActionDate {...props} />
          <ReviewSectionRowProgress {...props} />
          <ReviewSectionRowAction {...props} />
        </Grid>
      )}{' '}
    </>
  )
}

export default ReviewSectionRow
