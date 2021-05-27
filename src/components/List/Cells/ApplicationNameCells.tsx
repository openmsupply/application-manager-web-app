import React from 'react'
import { Link } from 'react-router-dom'
import { CellProps } from '../../../utils/types'

const ApplicationNameCell: React.FC<CellProps> = ({ application }) => (
  <Link to={`/application/${application.serial || 0}`}>{application.name as string}</Link>
)

const ApplicationNameReviewLinkCell: React.FC<CellProps> = ({ application }) => (
  <Link to={`/application/${application.serial || 0}/review`}>{application.name as string}</Link>
)

export { ApplicationNameCell, ApplicationNameReviewLinkCell }
