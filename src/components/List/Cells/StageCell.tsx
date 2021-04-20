import React from 'react'
import { CellProps } from '../../../utils/types'
import { Stage } from '../../Review'

const StageCell: React.FC<CellProps> = ({ application }) => {
  const name = application.stage || ''
  return <Stage name={name} />
}

export default StageCell
