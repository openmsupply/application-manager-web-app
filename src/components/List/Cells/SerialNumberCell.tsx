import React from 'react'
import { CellProps } from '../../../utils/types'

const SerialNumberCell: React.FC<CellProps> = ({ application }) => {
  return <p className="yow">{application.serial}</p>
}
export default SerialNumberCell
