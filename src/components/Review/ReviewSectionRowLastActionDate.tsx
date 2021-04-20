import React, { CSSProperties } from 'react'
import { Grid, Label } from 'semantic-ui-react'
import getSimplifiedTimeDifference from '../../utils/dateAndTime/getSimplifiedTimeDifference'
import { ReviewAction, ReviewSectionComponentProps } from '../../utils/types'
import strings from '../../utils/constants'

const ReviewSectionRowLastActionDate: React.FC<ReviewSectionComponentProps> = ({
  action,
  thisReview,
  assignment,
  fullStructure,
}) => {
  const getContent = () => {
    switch (action) {
      case ReviewAction.canContinue: {
        return (
          <LastDate
            title={strings.ACTION_DATE_REVIEW_STARTED}
            indicator={getSimplifiedTimeDifference(thisReview?.timeStatusCreated)}
          />
        )
      }
      case ReviewAction.canView: {
        return (
          <LastDate
            title={strings.ACTION_DATE_REVIEW_SUBMITTED}
            indicator={getSimplifiedTimeDifference(thisReview?.timeStatusCreated)}
          />
        )
      }
      case ReviewAction.canStartReview: {
        return (
          <LastDate
            title={strings.ACTION_DATE_ASSIGNED}
            indicator={getSimplifiedTimeDifference(assignment.timeUpdated)}
          />
        )
      }

      case ReviewAction.canReReview: {
        return (
          <LastDate
            title={strings.ACTION_DATE_RE_SUBMITTED}
            indicator={getSimplifiedTimeDifference(fullStructure?.info.current?.date)}
          />
        )
      }

      case ReviewAction.canSelfAssign: {
        return (
          <LastDate
            title={strings.LABEL_APPLICATION_SUBMITTED}
            indicator={getSimplifiedTimeDifference(fullStructure?.info.current?.date)}
          />
        )
      }

      default:
        return null
    }
  }

  return <Grid.Column>{getContent()}</Grid.Column>
}

const LastDate: React.FC<{ title: string; indicator?: React.ReactNode }> = ({
  title,
  indicator,
}) => {
  return (
    <div style={inlineStyles.container}>
      <div style={inlineStyles.title}>{title}</div>
      <Label className="stripesLabel" style={inlineStyles.indicator}>
        {indicator}
      </Label>
    </div>
  )
}

// Styles - TODO: Move to LESS || Global class style (semantic)
const inlineStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  } as CSSProperties,
  title: {
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  } as CSSProperties,
  indicator: { fontSize: 12 },
}

export default ReviewSectionRowLastActionDate
