import React from 'react'
import { Link } from 'react-router-dom'
import { ApplicationStatus } from '../../../utils/generated/graphql'
import { CellProps } from '../../../utils/types'
import strings from '../../../utils/constants'
import { Icon } from 'semantic-ui-react'

const ApplicantActionCell: React.FC<CellProps> = ({ application: { status, serial } }) => {
  let action = ''

  if (status === ApplicationStatus.ChangesRequired) action = strings.ACTION_UPDATE
  if (status === ApplicationStatus.Draft) action = strings.ACTION_CONTINUE

  if (!action)
    return (
      <Link className="user-action" to={`/application/${serial}`}>
        <Icon name="angle right" />
      </Link>
    )

  return (
    <Link className="user-action" to={`/application/${serial}`}>
      {action}
    </Link>
  )
}

export default ApplicantActionCell
