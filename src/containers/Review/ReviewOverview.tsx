import React, { useEffect } from 'react'
import {
  Button,
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

// TODO: Remove this

const ReviewOverview: React.FC = () => {
  const {
    push,
    params: { serialNumber },
  } = useRouter()
  const {
    userState: { currentUser },
  } = useUserState()

  const { error, loading, application, assignment, sectionsAssigned } = useGetReviewAssignment({
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

  const handleCreate = (_: any) => {
    if (!assignment) {
      console.log('Problem to create review - unexpected parameters')
      return
    }

    create({
      reviewAssigmentId: assignment.id,
      applicationResponses: assignment.questions.map(({ responseId }) => ({
        applicationResponseId: responseId,
      })),
    })
  }

  const getProgresOrLabel = ({ assigned, progress }: SectionState) => {
    if (assigned) {
      if (progress && progress.done > 0 && progress.total > 0) {
        return (
          <Progress
            percent={(100 * progress.done) / progress.total}
            size="tiny"
            success={progress.valid}
            error={!progress.valid}
          />
        )
      } else if (!assignment?.review) {
        return (
          <Segment vertical>
            <Icon name="circle" size="mini" color="blue" />
            <Label basic>{strings.LABEL_ASSIGNED_TO_YOU}</Label>
          </Segment>
        )
      } else return <Label basic>MISSING PROGRESS... TODO</Label>
    } else return <p>{strings.LABEL_ASSIGNED_TO_OTHER}</p>
  }

  const getActionButton = ({ review }: AssignmentDetails) => {
    if (review) {
      const { id, status } = review

      return (
        <Button
          as={Link}
          to={`/application/${serialNumber}/review/${id}`}
          content={getReviewStartLabel(status)}
        />
      )
    }
    return (
      <Button loading={processing} onClick={handleCreate}>
        {strings.BUTTON_REVIEW_START}
      </Button>
    )
  }

  const displayStatus = () => {
    const status = assignment?.review?.status as string
    switch (status) {
      case REVIEW_STATUS.DRAFT:
        return <Label color="brown" content={status} />
      case REVIEW_STATUS.CHANGES_REQUESTED:
        return <Label color="red" content={status} />
      case REVIEW_STATUS.LOCKED:
      case REVIEW_STATUS.SUBMITTED:
        return <Label color="grey" content={status} />
      case REVIEW_STATUS.PENDING:
        return <Label color="yellow" content={status} />

      default:
        return <Label content={status} />
    }
  }

  return error ? (
    <NoMatch />
  ) : loading ? (
    <Loading />
  ) : application && assignment ? (
    <Segment.Group>
      <Segment textAlign="center">
        <Label color="blue">{strings.STAGE_PLACEHOLDER}</Label>
        {displayStatus()}
        <Header content={application.name} subheader={strings.DATE_APPLICATION_PLACEHOLDER} />
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
      </Segment>
    </Segment.Group>
  ) : (
    <Message error content={strings.ERROR_REVIEW_OVERVIEW} />
  )
}

export default ReviewOverview
