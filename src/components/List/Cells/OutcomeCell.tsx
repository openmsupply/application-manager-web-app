import React from 'react'
import { Segment } from 'semantic-ui-react'
import { CellProps } from '../../../utils/types'

const OutcomeCell: React.FC<CellProps> = ({ application }) => (
  <Segment basic textAlign="center">
    <p>{application.outcome}</p>
  </Segment>
)

export default OutcomeCell
