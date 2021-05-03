import React from 'react'
import { Link } from 'react-router-dom'
import { Header } from 'semantic-ui-react'
import { CellProps } from '../../../utils/types'

const ApplicationNameCellReviewer: React.FC<CellProps> = ({ application }) => (
  <Link
    // size="small"
    // as={Link}
    to={`/application/${application.serial || 0}/review`}
    // content=
  >
    {application.name as string}
  </Link>
)

export default ApplicationNameCellReviewer
