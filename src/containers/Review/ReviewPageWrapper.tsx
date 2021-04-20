import React from 'react'
import { Route, Switch } from 'react-router'
import { Message } from 'semantic-ui-react'
import { Loading, NoMatch } from '../../components'
import useGetApplicationStructure from '../../utils/hooks/useGetApplicationStructure'
import { useRouter } from '../../utils/hooks/useRouter'
import strings from '../../utils/constants'
import { AssignmentDetails, FullStructure } from '../../utils/types'
import ReviewPage from './ReviewPage'

const ReviewPageWrapper: React.FC<{
  structure: FullStructure
  reviewAssignments: AssignmentDetails[]
}> = ({ structure, reviewAssignments }) => {
  const {
    query: { reviewId },
    match: { path },
  } = useRouter()

  // Get application structure with evaluated properties (i.e visibility)
  const { error, fullStructure: fullApplicationStructure } = useGetApplicationStructure({
    structure,
    firstRunValidation: false,
    shouldCalculateProgress: false,
    shouldGetDraftResponses: false,
  })

  if (error) return <Message error title={strings.ERROR_GENERIC} list={[error]} />

  if (!fullApplicationStructure) return <Loading />

  // Find the review id used in URL in reviewAssignments
  const reviewAssignment = reviewAssignments.find(
    (reviewAssignment) => reviewAssignment?.review?.id === Number(reviewId)
  )

  if (!reviewAssignment) return <NoMatch />
  // Pass through structure and reviewAssignment associated to review
  return (
    <>
      <Switch>
        <Route exact path={path}>
          <ReviewPage {...{ fullApplicationStructure, reviewAssignment }} />
        </Route>
        <Route>
          <NoMatch />
        </Route>
      </Switch>
    </>
  )
}

export default ReviewPageWrapper
