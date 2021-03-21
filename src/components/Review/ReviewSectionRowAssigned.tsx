import React from 'react'
import { Grid } from 'semantic-ui-react'
import strings from '../../utils/constants'
import { ReviewSectionComponentProps } from '../../utils/types'

const ReviewSectionRowAssigned: React.FC<ReviewSectionComponentProps> = ({
  isAssignedToCurrentUser,
  assignment,
}) => {
  const { lastName, firstName } = assignment.reviewer
  return (
    <Grid.Column>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ fontWeight: 500 }}>Review by </div>
        <div
          style={{
            marginLeft: 5,
            color: isAssignedToCurrentUser ? 'rgb(120, 120, 120)' : 'rgb(82, 123,237)',
          }}
        >
          {isAssignedToCurrentUser ? 'Yourself' : `${firstName || ''} ${lastName || ''}`}
        </div>
      </div>
    </Grid.Column>
  )
}

export default ReviewSectionRowAssigned
