import React from 'react'
import { Header } from 'semantic-ui-react'
import { Loading } from '../../components'
import reviewResponse from '../../utils/graphql/fragments/reviewResponse'
import useGetFullReviewStructure from '../../utils/hooks/useGetFullReviewStructure'
import { FullStructure } from '../../utils/types'

const ReviewPageWrapperTest: React.FC<{ structure: FullStructure }> = ({ structure }) => (
  <ReviewPageTest structure={structure} reviewAssignmentId={1020} />
)

const ReviewPageTest: React.FC<{
  reviewAssignmentId: number
  structure: FullStructure
}> = ({ reviewAssignmentId, structure }) => {
  const { fullStructure, error } = useGetFullReviewStructure({ reviewAssignmentId, structure })

  if (error) return <Header>Error</Header>
  if (!fullStructure) return <Loading />
  return (
    <pre>
      {JSON.stringify(
        Object.values(fullStructure.sections).map((section) => ({
          sections: section.reviewProgress,
          pages: Object.values(section.pages).map((page) => page.reviewProgress),
        })),
        null,
        '  '
      )}
      {JSON.stringify(
        {
          firstIncompleteReviewPage: fullStructure.firstIncompleteReviewPage,
          canSubmitReviewAs: fullStructure.canSubmitReviewAs,
        },
        null,
        '  '
      )}
    </pre>
  )
}

export default ReviewPageWrapperTest
