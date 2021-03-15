import React, { useState } from 'react'
import { Form, Message, TextArea } from 'semantic-ui-react'
import strings from '../../utils/constants'
import {
  useGetReviewDecisionCommentQuery,
  useUpdateReviewDecisionCommentMutation,
} from '../../utils/generated/graphql'
import Loading from '../Loading'

type ReviewCommentProps = {
  reviewDecisionId: number
  isEditable: boolean
}

const ReviewComment: React.FC<ReviewCommentProps> = ({ reviewDecisionId, isEditable }) => {
  const [updateComment] = useUpdateReviewDecisionCommentMutation()
  const { data, error } = useGetReviewDecisionCommentQuery({ variables: { reviewDecisionId } })
  const [comment, setComment] = useState('')

  if (error) return <Message error title={strings.ERROR_GENERIC} list={[error]} />

  if (!data) return <Loading />

  const initialComment = data?.reviewDecision?.comment || ''

  if (!isEditable) return <p>{initialComment}</p>

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