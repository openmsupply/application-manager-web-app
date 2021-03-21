import { NONAME } from 'dns'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Message, Segment, Header, Dropdown, Grid, Button, Icon, Label } from 'semantic-ui-react'
import { Loading } from '../../components'
import { useUserState } from '../../contexts/UserState'
import strings from '../../utils/constants'
import { useAssignSectionToUserMutation } from '../../utils/generated/graphql'
import useAssignSectionToUser from '../../utils/hooks/useAssignSectionToUser'
import useGetFullApplicationStructure from '../../utils/hooks/useGetFullApplicationStructure'
import { AssignmentDetailsNEW, FullStructure } from '../../utils/types'
import ReviewSectionRow from './ReviewSectionRow'

interface ReviewHomeProps {
  assignments: AssignmentDetailsNEW[]
  structure: FullStructure
}

type Filters = {
  selectedReviewer: number
  selectedStage: number
}

const ALL_REVIEWERS = 0

const ReviewHome: React.FC<ReviewHomeProps> = ({ assignments, structure }) => {
  const { error, fullStructure: fullApplicationStructure } = useGetFullApplicationStructure({
    structure,
    firstRunValidation: false,
    shouldCalculateProgress: false,
  })

  const [filters, setFilters] = useState<Filters | null>(null)

  const getFilteredReviewer = (assignments: AssignmentDetailsNEW[]) => {
    if (!filters) return []
    return assignments.filter(
      (assignment) =>
        (filters.selectedReviewer === ALL_REVIEWERS ||
          assignment.reviewer.id === filters.selectedReviewer) &&
        assignment.stage.id === filters.selectedStage
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

  const assignerAssignments = assignments.filter((assignment) => assignment.isAssigner)

  console.log(assignerAssignments)

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Button
          as={Link}
          to={`/applications?type=${structure.info.type}`}
          style={{ background: 'none' }}
          icon
        >
          <Icon size="large" name="angle left" />
        </Button>
        <Header as="h2" style={{ padding: 0, margin: 10 }}>
          {' '}
          {`${structure.info.name}`}
        </Header>
      </div>
      <ReviewerAndStageSelection {...reviewerAndStageSelectionProps} />
      {filters &&
        Object.values(fullApplicationStructure.sections).map(({ details: { id, title, code } }) => (
          <Segment
            className="dreistripes"
            key={id}
            style={{
              borderRadius: 7,
              boxShadow: 'none',
              borderWidth: 2,
              paddingBottom: 30,
              paddingLeft: 30,
              paddingRight: 30,
            }}
          >
            <Header
              style={{
                fontWeight: 800,
                paddingBottom: 20,
              }}
            >
              {title}
            </Header>
            <AssignmentSection
              sectionCode={code}
              assignments={assignments}
              structure={fullApplicationStructure}
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

type AssignmentSectionProps = {
  sectionCode: string
  assignments: AssignmentDetailsNEW[]
  structure: FullStructure
}

const AssignmentSection: React.FC<AssignmentSectionProps> = ({
  assignments,
  sectionCode,
  structure,
}) => {
  const assign = useAssignSectionToUser({ structure, sectionCode })

  const assignable = assignments.filter((assignment) => assignment.isAssigner)
  if (assignable.length === 0) return null

  const assignableTo: AssignmentDetailsNEW[] = []

  assignable.forEach((assignment) => {
    if (assignableTo.find(({ reviewer }) => reviewer.id === assignment?.review?.id)) return
    if (!assignment.templateSectionRestrictions?.includes(sectionCode)) return

    assignableTo.push(assignment)
  })

  const options = [
    ...assignableTo.map(({ reviewer }) => ({
      key: reviewer.id,
      text: `${reviewer.firstName || ''} ${reviewer.lastName || ''}`,
      value: reviewer.id,
    })),
    {
      key: 0,
      value: 0,
      text: 'Not Assigned',
    },
  ]

  const findAssignment = assignableTo.find((assignment) =>
    assignment.reviewQuestionAssignments.find((reviewQuestionAssignment) => {
      console.log(reviewQuestionAssignment.templateElement)
      console.log(reviewQuestionAssignment.templateElement?.section?.code)
      console.log(reviewQuestionAssignment.templateElement?.section?.code === sectionCode)
      return reviewQuestionAssignment.templateElement?.section?.code === sectionCode
    })
  )

  const value = findAssignment?.reviewer.id || 0
  console.log(sectionCode, assignableTo, value, findAssignment)
  return (
    <Grid columns="equal" verticalAlign="middle" style={{ borderRadius: 10 }}>
      <Grid.Column floated="left">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ fontWeight: 500 }}>Review by </div>
          <Dropdown
            options={options}
            value={value}
            onChange={async (_: any, { value }: any) => {
              if (value === 0) return
              const assignment = assignments.find((assignment) => assignment.reviewer.id === value)
              if (!assignment) return

              await assign(assignment)
            }}
            style={{
              border: '2px solid rgb(150,150, 150)',
              marginLeft: 10,
              fontSize: 12,
              padding: 10,
              fontWeight: 800,
              paddingTop: 2,
              paddingBottom: 2,
              borderRadius: 4,
            }}
          />
        </div>
      </Grid.Column>
    </Grid>
  )
}

type ReviewerAndStageSelectionProps = {
  filters: Filters | null
  setFilters: (filters: Filters) => void
  structure: FullStructure
  assignments: AssignmentDetailsNEW[]
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
    <Grid columns="equal">
      <Grid.Column floated="left">
        <div
          style={{
            marginLeft: 30,
            display: 'flex',
            alignItems: 'center',
            color: 'rgb(120,120, 120)',
            fontSize: 14,
            fontWeight: 800,
          }}
        >
          {`${strings.REVIEW_FILTER_SHOW_TASKS_FOR} `}
          <Dropdown
            options={getReviewerOptions(assignments, currentUser?.userId as number)}
            value={filters?.selectedReviewer}
            onChange={changeFilters('selectedReviewer')}
            style={{
              border: '2px solid rgb(150,150, 150)',
              marginLeft: 10,
              fontSize: 14,
              padding: 10,
              fontWeight: 800,
              paddingTop: 2,
              paddingBottom: 2,
              borderRadius: 4,
            }}
          />
        </div>
      </Grid.Column>
      <Grid.Column floated="right" textAlign="right">
        <div
          style={{
            marginRight: 30,
            display: 'flex',
            alignItems: 'center',
            color: 'rgb(120,120, 120)',
            fontSize: 14,
            fontWeight: 800,
            textTransform: 'uppercase',
            justifyContent: 'flex-end',
          }}
        >
          {`${strings.REVIEW_FILTER_STAGE} `}

          <Dropdown
            options={stageOptions}
            value={filters?.selectedStage}
            onChange={changeFilters('selectedStage')}
            style={
              stageOptions.find(
                (options) => options.key == filters?.selectedStage && options.text === 'Assessment'
              )
                ? {
                    color: 'white',
                    background: 'rgb(86, 180, 219)',
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.81px',
                    padding: 10,
                    fontWeight: 800,
                    marginLeft: 10,
                    paddingTop: 2,
                    paddingBottom: 2,
                    borderRadius: 4,
                  }
                : {
                    color: 'white',
                    background: 'rgb(225, 126, 72)',
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.81px',
                    padding: 10,
                    marginLeft: 10,
                    fontWeight: 800,
                    paddingTop: 2,
                    paddingBottom: 2,
                    borderRadius: 4,
                  }
            }
          />
        </div>
      </Grid.Column>
    </Grid>
  )
}

const getStageOptions = (structure: FullStructure, assignments: AssignmentDetailsNEW[]) =>
  structure.stages
    .filter(({ id }) => assignments.some(({ stage }) => id === stage.id))
    .map(({ id, title }) => ({
      key: id,
      value: id,
      content: (
        <Label
          style={
            title === 'Assessment'
              ? {
                  color: 'white',
                  background: 'rgb(86, 180, 219)',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.81px',
                }
              : {
                  color: 'white',
                  background: 'rgb(225, 126, 72)',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.81px',
                }
          }
        >
          {title}
        </Label>
      ),
      text: title,
    }))

const getReviewerOptions = (assignments: AssignmentDetailsNEW[], currentUserId: number) => {
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
  assignments.forEach(({ reviewer: { id, firstName, lastName } }) => {
    if (!id || !firstName || !lastName) return
    if (reviewerOptions.some((option) => option.key === id)) return
    reviewerOptions.push({
      value: id,
      key: id,
      text: `${firstName} ${lastName}`,
    })
  })

  return reviewerOptions
}

export default ReviewHome
