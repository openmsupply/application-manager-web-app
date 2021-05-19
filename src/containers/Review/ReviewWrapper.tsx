import React from 'react'
import { Route, Switch } from 'react-router'
import { Message } from 'semantic-ui-react'
import { Loading, NoMatch } from '../../components'
import { useUserState } from '../../contexts/UserState'
import useGetReviewInfo from '../../utils/hooks/useGetReviewInfo'
import { useRouter } from '../../utils/hooks/useRouter'
import usePageTitle from '../../utils/hooks/usePageTitle'
import { FullStructure } from '../../utils/types'
import strings from '../../utils/constants'
import ReviewPageWrapper from './ReviewPageWrapper'
import ReviewHome from './ReviewHome'
import { ReviewContainer } from '../../components/Review'

interface ReviewWrapperProps {
  structure: FullStructure
}

const ReviewWrapper: React.FC<ReviewWrapperProps> = ({ structure }) => {
  const {
    match: { path },
  } = useRouter()
  const {
    userState: { currentUser },
  } = useUserState()

  usePageTitle(strings.PAGE_TITLE_REVIEW.replace('%1', structure.info.serial))

  const userId = currentUser?.userId as number

  // I think we need an option to selecte review assgnments where
  // userId is reviewerId or assignerId or both or not match it at all (just by row level permission restrictions)
  const { error, loading, assignments } = useGetReviewInfo({
    applicationId: structure.info.id,
    userId,
  })

  if (error) return <Message error header={strings.ERROR_REVIEW_PAGE} list={[error]} />

  if (loading) return <Loading />

  if (!assignments || assignments.length === 0) return <NoMatch />

  return (
    <ReviewContainer application={structure.info}>
      <Switch>
        <Route exact path={path}>
          <ReviewHome {...{ assignments, structure, userId }} />
        </Route>
        <Route exact path={`${path}/:reviewId`}>
          <ReviewPageWrapper {...{ structure, reviewAssignments: assignments }} />
        </Route>
        <Route>
          <NoMatch />
        </Route>
      </Switch>
    </ReviewContainer>
  )
}

export default ReviewWrapper
