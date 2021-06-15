import React, { useEffect, useState } from 'react'
import { Dropdown, Label, Message } from 'semantic-ui-react'
import Loading from '../../components/Loading'
import ReviewHome from './ReviewHome'
import { useUserState } from '../../contexts/UserState'
import useGetApplicationStructure from '../../utils/hooks/useGetApplicationStructure'
import { AssignmentDetails, Filters, FullStructure } from '../../utils/types'
import strings from '../../utils/constants'
import { ReviewHeader, Stage } from '../../components/Review'

const ALL_REVIEWERS = 0

const ReviewHomeWrapper: React.FC<{
  structure: FullStructure
  assignments: AssignmentDetails[]
}> = ({ structure, assignments }) => {
  const { error, fullStructure: fullApplicationStructure } = useGetApplicationStructure({
    structure,
    firstRunValidation: false,
    shouldCalculateProgress: false,
  })

  const [filters, setFilters] = useState<Filters | null>(null)

  const getFilteredByStage = (assignments: AssignmentDetails[]) => {
    if (!filters) return []
    return assignments.filter((assignment) => assignment.stage.id === filters.selectedStage)
  }

  const getFilteredReviewer = (assignments: AssignmentDetails[]) => {
    if (!filters) return []
    return getFilteredByStage(assignments).filter(
      (assignment) =>
        filters.selectedReviewer === ALL_REVIEWERS ||
        assignment.reviewer.id === filters.selectedReviewer
    )
  }

  if (error) return <Message error title={strings.ERROR_GENERIC} list={[error]} />

  if (!fullApplicationStructure) return <Loading />

  const reviewerAndStageSelectionProps: ReviewerAndStageSelectionProps = {
    filters,
    setFilters,
    structure: fullApplicationStructure,
    assignments,
  }

  return (
    <>
      <ReviewHeader applicationName={fullApplicationStructure.info.name} />
      <ReviewerAndStageSelection {...reviewerAndStageSelectionProps} />
      {filters && (
        <ReviewHome
          assignmentsByStage={getFilteredByStage(assignments)}
          assignmentsByUserAndStage={getFilteredReviewer(assignments)}
          fullApplicationStructure={fullApplicationStructure}
        />
      )}
    </>
  )
}

type ReviewerAndStageSelectionProps = {
  filters: Filters | null
  setFilters: (filters: Filters) => void
  structure: FullStructure
  assignments: AssignmentDetails[]
}

const ReviewerAndStageSelection: React.FC<ReviewerAndStageSelectionProps> = ({
  assignments,
  structure,
  filters,
  setFilters,
}) => {
  const {
    userState: { currentUser },
  } = useUserState()

  useEffect(() => {
    setFilters({
      selectedReviewer: currentUser?.userId as number,
      selectedStage: structure.info.current?.stage.id as number,
    })
  }, [])

  const changeFilters =
    (filterType: keyof Filters) =>
    (_: any, { value }: any) => {
      if (filters) setFilters({ ...filters, [filterType]: value })
    }

  if (!filters) return null

  const stageOptions = getStageOptions(structure, assignments)

  return (
    <div className="section-single-row-box-container" id="review-filters-container">
      <div className="centered-flex-box-row">
        <Label className="simple-label" content={strings.REVIEW_FILTER_SHOW_TASKS_FOR} />
        <Dropdown
          className="reviewer-dropdown"
          options={getReviewerOptions(assignments, currentUser?.userId as number)}
          value={filters?.selectedReviewer}
          onChange={changeFilters('selectedReviewer')}
        />
      </div>
      <div className="centered-flex-box-row">
        <Label className="uppercase-label" content={strings.REVIEW_FILTER_STAGE} />
        <Dropdown
          options={stageOptions}
          value={filters?.selectedStage}
          onChange={changeFilters('selectedStage')}
        />
      </div>
    </div>
  )
}

const getStageOptions = (structure: FullStructure, assignments: AssignmentDetails[]) =>
  structure.stages
    .filter(({ id }) => assignments.some(({ stage }) => id === stage.id))
    .map(({ id, title, colour }) => ({
      className: 'padding-zero',
      key: id,
      value: id,
      text: <Stage name={title} colour={colour || ''} />,
    }))

const getReviewerOptions = (assignments: AssignmentDetails[], currentUserId: number) => {
  const reviewerOptions: { value: number; key: number; text: string }[] = [
    {
      value: ALL_REVIEWERS,
      key: ALL_REVIEWERS,
      text: strings.REVIEW_FILTER_EVERYONE,
    },
    {
      value: currentUserId,
      key: currentUserId,
      text: strings.REVIEW_FILTER_YOURSELF,
    },
  ]
  assignments.forEach(({ reviewer: { id, username } }) => {
    if (!id || !username) return
    if (reviewerOptions.some((option) => option.key === id)) return
    reviewerOptions.push({
      value: id,
      key: id,
      text: username,
    })
  })

  return reviewerOptions
}

export default ReviewHomeWrapper