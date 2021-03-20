import React from 'react'
import { CellProps } from '../../../utils/types'

const SerialNumberCell: React.FC<CellProps> = ({ application }) => {
  return (
    <p className="yow" style={{ color: 'rgb(150,150,150)' }}>
      {application.serial}
    </p>
  )
}
export default SerialNumberCell
