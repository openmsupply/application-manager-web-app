import React from 'react'
import { Grid } from 'semantic-ui-react'
import { SummaryViewWrapper } from '../../../formElementPlugins'
import { SummaryViewWrapperProps } from '../../../formElementPlugins/types'

const SummaryInformationElement: React.FC<SummaryViewWrapperProps> = (summaryViewProps) => (
  <Grid>
    <Grid.Column stretched>
      <SummaryViewWrapper {...summaryViewProps} />
    </Grid.Column>
  </Grid>
)

export default SummaryInformationElement
