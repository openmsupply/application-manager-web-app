import React, { CSSProperties } from 'react'
import { Grid } from 'semantic-ui-react'
import strings from '../../utils/constants'
import { ReviewAction, ReviewSectionComponentProps } from '../../utils/types'

const ReviewSectionRowAssigned: React.FC<ReviewSectionComponentProps> = ({
  isAssignedToCurrentUser,
  action,
  assignment,
}) => {
  const { lastName, firstName } = assignment.reviewer
  return (
    <Grid.Column>
      <div style={inlineStyle.container}>
        {action === ReviewAction.canSelfAssign ? (
          <div style={inlineStyle.title}>{strings.LABEL_ASSIGNED_SELF}</div>
        ) : (
          <>
            <div style={inlineStyle.title}>{`${strings.LABEL_REVIEWED_BY} `}</div>
            <div style={inlineStyle.reviewer(isAssignedToCurrentUser)}>
              {isAssignedToCurrentUser
                ? strings.REVIEW_FILTER_YOURSELF
                : `${firstName || ''} ${lastName || ''}`}
            </div>
          </>
        )}
      </div>
    </Grid.Column>
  )
}

// Styles - TODO: Move to LESS || Global class style (semantic)
const inlineStyle = {
  container: { display: 'flex', alignItems: 'center' } as CSSProperties,
  title: { fontWeight: 500 },
  reviewer: (isAssignedToCurrentUser: boolean) =>
    ({
      marginLeft: 5,
      color: isAssignedToCurrentUser ? 'rgb(120, 120, 120)' : 'rgb(82, 123,237)',
    } as CSSProperties),
}

export default ReviewSectionRowAssigned
