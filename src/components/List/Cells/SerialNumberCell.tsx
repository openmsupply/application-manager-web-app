import React from 'react'
import { CellProps } from '../../../utils/types'

const SerialNumberCell: React.FC<CellProps> = ({ application }) => {
  return <p style={serialStyle}>{application.serial}</p>
}

// Styles - TODO: Move to LESS || Global class style (semantic)
const serialStyle = { color: 'rgb(150,150,150)' }
export default SerialNumberCell
