import React, { CSSProperties, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Message, Segment, Header, Dropdown, Grid, Button, Icon } from 'semantic-ui-react'
import { Loading } from '../../components'
import { tempStageStyle } from '../../components/Review'
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
      <div style={inlineStyles.top}>
        <Button
          as={Link}
          to={`/applications?type=${structure.info.type}`}
          style={inlineStyles.link}
          icon
        >
          <Icon size="large" name="angle left" />
        </Button>
        <Header as="h2" style={inlineStyles.title} content={`${structure.info.name}`} />
      </div>
      <ReviewerAndStageSelection {...reviewerAndStageSelectionProps} />
      {filters &&
        Object.values(fullApplicationStructure.sections).map(({ details: { id, title, code } }) => (
          <Segment className="stripes" key={id} style={inlineStyles.body}>
            <Header style={inlineStyles.section} content={title} />
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
  const selectedStageText =
    stageOptions.find((options) => options.key == filters?.selectedStage)?.text || ''

  return (
    <Grid columns="equal">
      <Grid.Column floated="left">
        <div style={inlineStyles.assignedFilterContainer}>
          {`${strings.REVIEW_FILTER_SHOW_TASKS_FOR} `}
          <Dropdown
            options={getReviewerOptions(assignments, currentUser?.userId as number)}
            value={filters?.selectedReviewer}
            onChange={changeFilters('selectedReviewer')}
            style={inlineStyles.assignedFilterDropdown}
          />
        </div>
      </Grid.Column>
      <Grid.Column floated="right" textAlign="right">
        <div style={inlineStyles.stageFilterContainer}>
          {`${strings.REVIEW_FILTER_STAGE} `}
          <Dropdown
            options={stageOptions}
            value={filters?.selectedStage}
            onChange={changeFilters('selectedStage')}
            style={tempStageStyle(selectedStageText)}
          />
        </div>
      </Grid.Column>
    </Grid>
  )
}

const getStageOptions = (structure: FullStructure, assignments: AssignmentDetails[]) =>
  structure.stages
    .filter(({ id }) => assignments.some(({ stage }) => id === stage.id))
    .map(({ id, title }) => ({
      key: id,
      value: id,
      text: title,
    }))

const getReviewerOptions = (assignments: AssignmentDetails[], currentUserId: number) => {
  const reviewerOptions: { value: number; key: number; text: string }[] = [
    {
      value: ALL_REVIEWERS,
      key: ALL_REVIEWERS,
      text: strings.REVIEW_FILTER_ALL,
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

// Styles - TODO: Move to LESS || Global class style (semantic)
const inlineStyles = {
  top: { display: 'flex', alignItems: 'center' } as CSSProperties,
  link: { background: 'none' } as CSSProperties,
  title: { padding: 0, margin: 10 } as CSSProperties,
  body: {
    borderRadius: 7,
    boxShadow: 'none',
    borderWidth: 2,
    paddingBottom: 30,
    paddingLeft: 30,
    paddingRight: 30,
  } as CSSProperties,
  section: {
    fontWeight: 800,
    paddingBottom: 20,
  } as CSSProperties,
  assignedFilterContainer: {
    marginLeft: 30,
    display: 'flex',
    alignItems: 'center',
    color: 'rgb(120,120, 120)',
    fontSize: 14,
    fontWeight: 800,
  } as CSSProperties,
  assignedFilterDropdown: {
    border: '2px solid rgb(150,150, 150)',
    marginLeft: 10,
    fontSize: 14,
    padding: 10,
    fontWeight: 800,
    paddingTop: 2,
    paddingBottom: 2,
    borderRadius: 4,
  } as CSSProperties,
  stageFilterContainer: {
    marginRight: 30,
    display: 'flex',
    alignItems: 'center',
    color: 'rgb(120,120, 120)',
    fontSize: 14,
    fontWeight: 800,
    textTransform: 'uppercase',
    justifyContent: 'flex-end',
  } as CSSProperties,
}

export default ReviewHome
