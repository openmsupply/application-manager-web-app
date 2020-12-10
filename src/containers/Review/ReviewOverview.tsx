import React, { useEffect } from 'react'
import { Button, Card, Container, Header, List, Message, Segment } from 'semantic-ui-react'
import { Loading } from '../../components'
import useGetReviewAssignment from '../../utils/hooks/useGetReviewAssignment'
import useLoadApplication from '../../utils/hooks/useLoadApplication'
import { useRouter } from '../../utils/hooks/useRouter'
import strings from '../../utils/constants'
import { Link } from 'react-router-dom'
import { ReviewStatus } from '../../utils/generated/graphql'
import { AssignmentDetails } from '../../utils/types'
import useCreateReview from '../../utils/hooks/useCreateReview'

const ReviewOverview: React.FC = () => {
  const {
    push,
    params: { serialNumber },
  } = useRouter()

  const {
    error,
    loading,
    application,
    templateSections,
    isApplicationLoaded,
  } = useLoadApplication({ serialNumber: serialNumber })

  const {
    error: fetchAssignmentError,
    loading: loadingAssignemnt,
    assignment,
    assignedSections,
  } = useGetReviewAssignment({
    application,
    templateSections,
    reviewerId: 6,
    isApplicationLoaded,
  })

  useEffect(() => {
    if (assignment && assignment.review) {
      const { id, status } = assignment.review
      if (status === ReviewStatus.Submitted) push(`/application/${serialNumber}/review/${id}`)
    }
  }, [assignment])

  const { processing, error: createReviewError, create } = useCreateReview({
    onCompleted: (id: number) => {
      if (serialNumber && templateSections && templateSections.length > 0) {
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

  const getActionButton = ({ review }: AssignmentDetails) => {
    if (review) {
      const { id, status } = review
      if (
        review.status === ReviewStatus.ReviewPending ||
        review.status === ReviewStatus.ChangesRequired
      ) {
        return (
          <Button as={Link} to={`/application/${serialNumber}/review/${id}`}>
            {strings.BUTTON_REVIEW_CONTINUE}
          </Button>
        )
      }
      console.log(`Problem with review id ${id} status: ${status}`)
      return null
    }
    return (
      <Button loading={processing} onClick={handleCreate}>
        {strings.BUTTON_REVIEW_START}
      </Button>
    )
  }

  return error || fetchAssignmentError || createReviewError ? (
    <Message error header="Problem to load review homepage" list={[error, fetchAssignmentError]} />
  ) : loading || loadingAssignemnt ? (
    <Loading />
  ) : application && assignment ? (
    <Container>
      <Card fluid>
        <Card.Content>
          <Card.Header>{application.name}</Card.Header>
          <Card.Description>
            This is the Overview/Start page for Reviews of Application {serialNumber}.
          </Card.Description>
        </Card.Content>
        <Card.Content extra>
          <a
            href={
              'https://github.com/openmsupply/application-manager-web-app/issues/200#issuecomment-741432161'
            }
          >
            Click here for explanation.
          </a>
        </Card.Content>
      </Card>
      {assignedSections && (
        <Segment>
          <Header as="h5">Sections assigned to you:</Header>
          <List>
            {assignedSections.map((section) => (
              <List.Item>{section}</List.Item>
            ))}
          </List>
        </Segment>
      )}
      {getActionButton(assignment)}
    </Container>
  ) : (
    <Header as="h2" icon="exclamation circle" content="No review found!" />
  )
}

export default ReviewOverview
