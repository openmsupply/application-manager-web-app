import React from 'react'
import { Label } from 'semantic-ui-react'
import { CellProps } from '../../../utils/types'

const StageCell: React.FC<CellProps> = ({ application }) => {
  return <Label>{application.stage}</Label>
}

export default StageCell
