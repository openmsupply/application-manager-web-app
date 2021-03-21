import React from 'react'
import { Link } from 'react-router-dom'
import { ApplicationStatus } from '../../../utils/generated/graphql'
import { CellProps } from '../../../utils/types'

const ApplicantActionCell: React.FC<CellProps> = ({ application: { status, serial } }) => {
  let action = ''

  if (status === ApplicationStatus.ChangesRequired) action = 'Update'
  if (status === ApplicationStatus.Draft) action = 'Continue'

  return (
    <>
      <Link
        style={{ color: '#003BFE', fontWeight: 400, letterSpacing: 1 }}
        to={`/application/${serial}`}
      >
        {action}
      </Link>
    </>
  )
}
export default ApplicantActionCell
