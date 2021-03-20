import React from 'react'
import { CellProps } from '../../../utils/types'

const ApplicationNameCell: React.FC<CellProps> = ({ application }) => <p>{application.name}</p>

export default ApplicationNameCell
