import React from 'react'
import { Link } from 'react-router-dom'
import { CellProps } from '../../../utils/types'

const ApplicationNameCell: React.FC<CellProps> = ({ application }) => (
  <p>
    <Link to={`/application/${application.serial}`}>{application.name}</Link>
  </p>
)

export default ApplicationNameCell
