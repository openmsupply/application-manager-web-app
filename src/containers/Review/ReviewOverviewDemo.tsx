import React, { useEffect } from 'react'
import {
  Accordion,
  Button,
  Container,
  Grid,
  Header,
  Icon,
  Label,
  List,
  Message,
  Progress,
  Segment,
} from 'semantic-ui-react'
import { Loading, NoMatch } from '../../components'
import useGetReviewAssignment from '../../utils/hooks/useGetReviewAssignment'
import { useRouter } from '../../utils/hooks/useRouter'
import strings from '../../utils/constants'
import { Link } from 'react-router-dom'
import { AssignmentDetails, SectionState } from '../../utils/types'
import useCreateReview from '../../utils/hooks/useCreateReview'
import { useUserState } from '../../contexts/UserState'
import getReviewStartLabel from '../../utils/helpers/review/getReviewStartLabel'
import { REVIEW_STATUS } from '../../utils/data/reviewStatus'
import useGetReviewAssignmentDemo from '../../utils/hooks/useGetReviewAssignmentDemo'
import useGetFullApplicationStructure from '../../utils/hooks/useGetFullApplicationStructure'
import {
  ActionPluginsOrderBy,
  ReviewAssignmentStatus,
  ReviewStatus,
  useUpdateReviewAssignmentMutation,
} from '../../utils/generated/graphql'

const ReviewOverview: React.FC = ({ structure }) => {
  const {
    push,
    params: { serialNumber },
  } = useRouter()
  const {
    userState: { currentUser },
  } = useUserState()

  const [updateReviewAssignment] = useUpdateReviewAssignmentMutation()

  const { error, reviewerAssignments } = useGetReviewAssignmentDemo({
    reviewerId: currentUser?.userId as number,
    serialNumber,
  })

  const { processing, error: createReviewError, create } = useCreateReview({
    reviewerId: currentUser?.userId as number,
    serialNumber,
    onCompleted: (id: number) => {
      if (serialNumber) {
        // Call Review page after creation
        push(`/application/${serialNumber}/review/${id}`)
      }
    },
  })

  // const handleCreate = (reviewAssignment) => {
  //   if (!assignment) {
  //     console.log('Problem to create review - unexpected parameters')
  //     return
  //   }

  //   create({
  //     reviewAssigmentId: reviewAssignment.id,
  //     applicationResponses: assignment.questions.map(({ responseId }) => ({
  //       applicationResponseId: responseId,
  //     })),
  //   })
  // }

  // const getProgresOrLabel = ({ assigned, progress }: SectionState) => {
  //   if (assigned) {
  //     if (progress && progress.done > 0 && progress.total > 0) {
  //       return (
  //         <Progress
  //           percent={(100 * progress.done) / progress.total}
  //           size="tiny"
  //           success={progress.valid}
  //           error={!progress.valid}
  //         />
  //       )
  //     } else if (!assignment?.review) {
  //       return (
  //         <Segment vertical>
  //           <Icon name="circle" size="mini" color="blue" />
  //           <Label basic>{strings.LABEL_ASSIGNED_TO_YOU}</Label>
  //         </Segment>
  //       )
  //     } else return <Label basic>MISSING PROGRESS... TODO</Label>
  //   } else return <p>{strings.LABEL_ASSIGNED_TO_OTHER}</p>
  // }

  const buttonActionList = [
    {
      topTitle: 'Can Self Assign Review',
      topIcon: 'check circle',
      actionTitle: 'Self Assign',
      action: (reviewAssignment) =>
        updateReviewAssignment({
          variables: { id: reviewAssignment.id, data: { status: ReviewAssignmentStatus.Assigned } },
        }),
      condition: (reviewAssignment) =>
        reviewAssignment.status === ReviewAssignmentStatus.AvailableForSelfAssignment,
    },
    {
      topTitle: 'Can Start Review',
      actionTitle: 'Start',
      topIcon: 'play',
      condition: (reviewAssignment) =>
        reviewAssignment.status === ReviewAssignmentStatus.Assigned && !reviewAssignment.review,
    },
    {
      topTitle: 'Can Continue Review',
      actionTitle: 'Continue',
      topIcon: 'edit',
      condition: (reviewAssignment) => reviewAssignment?.review?.status === ReviewStatus.Draft,
    },
    {
      topTitle: 'Can Update Review (Changes Requested)',
      actionTitle: 'Update',
      topIcon: 'reply',
      condition: (reviewAssignment) =>
        reviewAssignment?.review?.status === ReviewStatus.ChangesRequested,
    },
    {
      topTitle: 'Can View Review',
      actionTitle: 'View',
      topIcon: 'zoom in',
      condition: (reviewAssignment) => reviewAssignment?.review?.status === ReviewStatus.Submitted,
    },
    {
      topTitle: 'Can Re-start Review',
      actionTitle: 'Re-start',
      topIcon: 'sign-in',
      condition: (reviewAssignment) => reviewAssignment?.review?.status === ReviewStatus.Pending,
    },
  ]

  const getActionIndicator = (reviewAssignment) => {
    const buttonAction = buttonActionList.find((actionButton) =>
      actionButton.condition(reviewAssignment)
    )
    if (!buttonAction) return null

    return (
      <Label>
        <Icon name={buttonAction.topIcon} />
        {buttonAction.topTitle}
      </Label>
    )
  }

  const getActionButton = (reviewAssignment) => {
    const buttonAction = buttonActionList.find((actionButton) =>
      actionButton.condition(reviewAssignment)
    )
    if (!buttonAction) return null

    return (
      <Button
        onClick={() => {
          if (buttonAction.action) buttonAction.action(reviewAssignment)
        }}
      >
        {buttonAction.actionTitle}
      </Button>
    )
  }
  // const displayStatus = () => {
  //   const status = assignment?.review?.status as string
  //   switch (status) {
  //     case REVIEW_STATUS.DRAFT:
  //       return <Label color="brown" content={status} />
  //     case REVIEW_STATUS.CHANGES_REQUESTED:
  //       return <Label color="red" content={status} />
  //     case REVIEW_STATUS.LOCKED:
  //     case REVIEW_STATUS.SUBMITTED:
  //       return <Label color="grey" content={status} />
  //     case REVIEW_STATUS.PENDING:
  //       return <Label color="yellow" content={status} />

  //     default:
  //       return <Label content={status} />
  //   }
  // }

  const panels = []

  if (reviewerAssignments) {
    reviewerAssignments.map((reviewAssignment) => {
      panels.push({
        key: reviewAssignment.id,
        title: {
          content: (
            <>
              <Label
                color="blue"
                content={`Stage: ${reviewAssignment.stage.title}`}
                style={{ margin: 5 }}
              />
              <Label
                color="purple"
                content={`Level: ${reviewAssignment.level}`}
                style={{ margin: 5 }}
              />
              {getActionIndicator(reviewAssignment)}
            </>
          ),
        },
        content: {
          content: (
            <>
              <Message
                info
                header="More Info"
                content="More information by section about current state of review"
              />
              {getActionButton(reviewAssignment)}
            </>
          ),
        },
      })
    })
  }

  return error ? (
    <Message error content={strings.ERROR_REVIEW_OVERVIEW} />
  ) : !reviewerAssignments ? null : (
    <Segment.Group>
      <Segment textAlign="center">
        <Header content={structure.info.name} subheader={strings.DATE_APPLICATION_PLACEHOLDER} />
        <Accordion
          styled
          defaultActiveIndex={panels.length - 1}
          panels={panels}
          style={{ width: '100%' }}
        />
        {/* <pre>{JSON.stringify(reviewerAssignments, null, ' ')}</pre>
        <pre>{JSON.stringify(structure, null, ' ')}</pre> */}
      </Segment>
      {/* <Segment textAlign="center">
        <Label color="blue">{strings.STAGE_PLACEHOLDER}</Label>
        {displayStatus()}
  
        <Header
          as="h3"
          color="grey"
          content={strings.TITLE_REVIEW_SUMMARY}
          subheader={strings.SUBTITLE_REVIEW}
        />
      </Segment>
      <Segment
        style={{
          backgroundColor: 'white',
          padding: 10,
          margin: '0px 50px',
          minHeight: 500,
          flex: 1,
        }}
      >
        <List divided relaxed="very">
          {sectionsAssigned &&
            Object.entries(sectionsAssigned).map(([sectionCode, sectionState]) => {
              const { details, progress } = sectionState
              return (
                <List.Item
                  key={`list-item-${sectionCode}`}
                  children={
                    <Grid>
                      <Grid.Column width={10}>
                        <p>{details.title}</p>
                      </Grid.Column>
                      <Grid.Column width={4}>{getProgresOrLabel(sectionState)}</Grid.Column>
                      <Grid.Column width={2}>
                        {progress && (
                          <Button color="blue">{strings.BUTTON_APPLICATION_RESUME}</Button>
                        )}
                      </Grid.Column>
                    </Grid>
                  }
                ></List.Item>
              )
            })}
        </List>
        {getActionButton(assignment)}
      </Segment>
      <Segment>
        {createReviewError && (
          <Message error header={strings.ERROR_REVIEW_OVERVIEW}>
            {createReviewError}
          </Message>
        )}
      </Segment> */}
    </Segment.Group>
  )
}

export default ReviewOverview
