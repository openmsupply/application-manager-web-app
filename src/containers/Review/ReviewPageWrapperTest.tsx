import React from 'react'
import { Header } from 'semantic-ui-react'
import { Loading } from '../../components'
import useGetFullReviewStructure from '../../utils/hooks/useGetFullReviewStructure'
import { FullStructure } from '../../utils/types'

const ReviewPageWrapperTest: React.FC<{ structure: FullStructure }> = ({ structure }) => {
  const reviewAssignmentId = 1007

  return <ReviewPageTest structure={structure} reviewAssignmentId={reviewAssignmentId} />
}

const ReviewPageTest: React.FC<{
  reviewAssignmentId: number
  structure: FullStructure
}> = ({ reviewAssignmentId, structure }) => {
  const { fullStructure, error } = useGetFullReviewStructure({ reviewAssignmentId, structure })

  if (error) return <Header>Error</Header>
  if (!fullStructure) return <Loading />
  return <pre>{JSON.stringify(fullStructure, null, '  ')}</pre>
}

export default ReviewPageWrapperTest
