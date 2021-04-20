import React from 'react'
import { Grid } from 'semantic-ui-react'
import { SummaryViewWrapper } from '../../../../formElementPlugins'
import { SummaryViewWrapperProps } from '../../../../formElementPlugins/types'

interface SummaryInformationElementProps {
  summaryProps: SummaryViewWrapperProps
}

const SummaryInformationElement: React.FC<SummaryInformationElementProps> = ({ summaryProps }) => (
  <Grid>
    <Grid.Column stretched>
      <SummaryViewWrapper {...summaryProps} />
    </Grid.Column>
  </Grid>
)

export default SummaryInformationElement
