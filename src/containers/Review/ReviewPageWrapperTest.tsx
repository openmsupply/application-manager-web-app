import React from 'react'
import { Header } from 'semantic-ui-react'
import { Loading } from '../../components'
import { ReviewAssignment } from '../../utils/generated/graphql'
import useGetFullReviewStructure from '../../utils/hooks/useGetFullReviewStructure'
import { FullStructure } from '../../utils/types'

const ReviewPageWrapperTest: React.FC<{ structure: FullStructure }> = ({ structure }) => {
  const reviewAssignment: ReviewAssignment = {
    id: 1007,
  }

  return <ReviewPageTest structure={structure} reviewAssignment={reviewAssignment} />
}

const ReviewPageTest: React.FC<{
  reviewAssignment: ReviewAssignment
  structure: FullStructure
}> = ({ reviewAssignment, structure }) => {
  const { fullStructure, error } = useGetFullReviewStructure({ reviewAssignment, structure })

  if (error) return <Header>Error</Header>
  if (!fullStructure) return <Loading />
  return <pre>{JSON.stringify(fullStructure, null, '  ')}</pre>
}

export default ReviewPageWrapperTest
