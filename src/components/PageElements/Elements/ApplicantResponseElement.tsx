import React from 'react'
import { Grid, Icon, Label } from 'semantic-ui-react'
import { SummaryViewWrapper } from '../../../formElementPlugins'
import { SummaryViewWrapperProps } from '../../../formElementPlugins/types'
import strings from '../../../utils/constants'
import getSimplifiedTimeDifference from '../../../utils/dateAndTime/getSimplifiedTimeDifference'
import { ApplicationResponse } from '../../../utils/generated/graphql'

interface ApplicantResponseElementProps {
  applicationResponse: ApplicationResponse
  summaryViewProps: SummaryViewWrapperProps
  isResponseUpdated?: boolean
}

const ApplicantResponseElement: React.FC<ApplicantResponseElementProps> = ({
  applicationResponse,
  summaryViewProps,
  isResponseUpdated = false,
  children,
}) => {
  return (
    <Grid columns="equal" className="element-grid">
      <Grid.Column textAlign="left">
        <SummaryViewWrapper {...summaryViewProps} />
      </Grid.Column>
      {isResponseUpdated && (
        <Grid.Column width={10} textAlign="left">
          <Icon name="circle" size="tiny" color="blue" />
          <Label className="simple-label">
            <strong>{strings.LABEL_UPDATED}</strong>
          </Label>
          <Label size="mini" className="simple-label shift-up-1">
            <strong>{getSimplifiedTimeDifference(applicationResponse.timeUpdated)}</strong>
          </Label>
        </Grid.Column>
      )}
      <Grid.Column width={2} textAlign="left" verticalAlign="middle">
        {children}
      </Grid.Column>
    </Grid>
  )
}

export default ApplicantResponseElement
