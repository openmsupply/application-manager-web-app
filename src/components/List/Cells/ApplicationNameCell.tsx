import React from 'react'
import { Link } from 'react-router-dom'
import { CellProps } from '../../../utils/types'

const ApplicationNameCell: React.FC<CellProps> = ({ application }) => <p>{application.name}</p>

export default ApplicationNameCell
