import React, { useState } from 'react'
import { Form, Message, TextArea } from 'semantic-ui-react'
import strings from '../../utils/constants'
import {
  useGetReviewDecisionCommentQuery,
  useUpdateReviewDecisionCommentMutation,
} from '../../utils/generated/graphql'
import Loading from '../Loading'

type ReviewCommentProps = {
  reviewDecisionId?: number
  isEditable: boolean
}

const ReviewComment: React.FC<ReviewCommentProps> = ({ reviewDecisionId, isEditable }) => {
  const [updateComment] = useUpdateReviewDecisionCommentMutation()
  const { data, error } = useGetReviewDecisionCommentQuery({
    variables: { reviewDecisionId: reviewDecisionId as number },
    skip: !reviewDecisionId,
    fetchPolicy: 'network-only',
  })
  const [comment, setComment] = useState('')

  if (!reviewDecisionId) return null

  if (error) return <Message error title={strings.ERROR_GENERIC} list={[error]} />

  if (!data) return <Loading />

  if (!isEditable)
    return data?.reviewDecision?.comment ? (
      <Message
        compact
        attached="bottom"
        icon="comment outline"
        header={strings.TITLE_REVIEW_COMMENT}
        content={data?.reviewDecision?.comment}
      />
    ) : null

  const initialComment = data?.reviewDecision?.comment || ''
  return (
    <Form>
      <TextArea
        defaultValue={initialComment}
        onChange={(_, { value }) => setComment(String(value))}
        onBlur={() => updateComment({ variables: { reviewDecisionId, comment } })}
      />
    </Form>
  )
}

export default ReviewComment
