import React from 'react'
import { Link } from 'react-router-dom'
import { Button, Grid } from 'semantic-ui-react'
import { SummaryViewWrapper } from '../../../../formElementPlugins'
import { SummaryViewWrapperProps } from '../../../../formElementPlugins/types'
import { ApplicationResponse } from '../../../../utils/generated/graphql'
import strings from '../../../../utils/constants'

interface SummaryResponseElementProps {
  canEdit: boolean
  linkToPage: string
  latestApplicationResponse: ApplicationResponse
  previousApplicationResponse: ApplicationResponse
  summaryProps: SummaryViewWrapperProps
}

const SummaryResponseElement: React.FC<SummaryResponseElementProps> = ({
  canEdit,
  linkToPage,
  summaryProps,
}) => (
  <Grid columns="equal">
    <Grid.Column floated="left" width={4}>
      <SummaryViewWrapper {...summaryProps} />
    </Grid.Column>
    <Grid.Column floated="right" textAlign="right">
      {canEdit && (
        <Button content={strings.BUTTON_SUMMARY_EDIT} size="small" as={Link} to={linkToPage} />
      )}
    </Grid.Column>
  </Grid>
)

export default SummaryResponseElement
