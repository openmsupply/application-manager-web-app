import React from 'react'
import { Header, Icon } from 'semantic-ui-react'
import getSimplifiedTimeDifference from '../../../utils/dateAndTime/getSimplifiedTimeDifference'

interface HistoryResponseElementProps {
  author?: string
  title: string
  message: string
  timeUpdated: Date
  // attentionRequired?: boolean
  reviewerComment?: string
}

const HistoryResponseElement: React.FC<HistoryResponseElementProps> = ({
  author = '',
  title,
  message,
  timeUpdated,
  // attentionRequired = false,
  reviewerComment,
}) => {
  return (
    <div className="response-element-content">
      <p className="secondary author-name">{author}</p>
      <div className="decision-container">
        <div className="comment-container">
          <Header
            as="h5"
            // icon={attentionRequired && <Icon name="exclamation circle" color="red" size="tiny" />}
            content={title}
          />
          <p className="secondary date-indicator">{getSimplifiedTimeDifference(timeUpdated)}</p>
        </div>
        <p>{message}</p>
        {!!reviewerComment && (
          <div className="comment-container">
            <Icon name="comment alternate outline" color="grey" />
            <p className="secondary">{reviewerComment}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default HistoryResponseElement
