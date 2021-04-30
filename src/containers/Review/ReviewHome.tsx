import React, { useEffect, useState } from 'react'
import { Message, Segment, Header, Dropdown, Label } from 'semantic-ui-react'
import { Loading } from '../../components'
import { Stage } from '../../components/Review'
import { useUserState } from '../../contexts/UserState'
import strings from '../../utils/constants'
import useGetApplicationStructure from '../../utils/hooks/useGetApplicationStructure'
import { AssignmentDetails, FullStructure } from '../../utils/types'
import AssignmentSectionRow from './AssignmentSectionRow'
import ReviewSectionRow from './ReviewSectionRow'

interface ReviewHomeProps {
  assignments: AssignmentDetails[]
  structure: FullStructure
}

type Filters = {
  selectedReviewer: number
  selectedStage: number
}

const ALL_REVIEWERS = 0

const ReviewHome: React.FC<ReviewHomeProps> = ({ assignments, structure }) => {
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
      <ReviewerAndStageSelection {...reviewerAndStageSelectionProps} />
      {filters &&
        Object.values(fullApplicationStructure.sections).map(({ details: { id, title, code } }) => (
          <Segment className="stripes" key={id}>
            <Header as="h5" content={title} />
            <AssignmentSectionRow
              {...{
                assignments: getFilteredByStage(assignments),
                structure: fullApplicationStructure,
                sectionCode: code,
              }}
            />
            {getFilteredReviewer(assignments).map((assignment) => (
              <ReviewSectionRow
                {...{
                  key: assignment.id,
                  sectionId: id,
                  assignment,
                  fullApplicationStructure,
                }}
              />
            ))}
          </Segment>
        ))}
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

  const changeFilters = (filterType: keyof Filters) => (_: any, { value }: any) => {
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

export default ReviewHome
