import React from 'react'
import { Link } from 'react-router-dom'
import { Icon, Label, Progress, Segment } from 'semantic-ui-react'
import { ApplicationStatus } from '../../../utils/generated/graphql'
import { CellProps } from '../../../utils/types'

enum ACTIONS {
  EDIT_DRAFT = 'Edit draft',
  MAKE_CHANGES = 'Make changes',
  RENEW = 'Renew',
}

const StatusCell: React.FC<CellProps> = ({ application }) => {
  const { serial, stage, status } = application
  switch (status) {
    case ApplicationStatus.ChangesRequired:
      return (
        <Segment basic textAlign="center">
          <Link to={`/application/${serial}`}>
            <Icon name="exclamation circle" color="red" />
            {ACTIONS.MAKE_CHANGES}
          </Link>
        </Segment>
      )
    case ApplicationStatus.Draft:
      return (
        <Segment basic textAlign="center">
          <Progress size="tiny" />
          <Link to={`/application/${serial}`}>{ACTIONS.EDIT_DRAFT}</Link>
          <Icon name="trash alternate outline" style={{ marginLeft: 10 }} />
        </Segment>
      )
    case ApplicationStatus.Expired:
      return <Link to={`/application/${serial}/renew`}>{ACTIONS.RENEW}</Link> // TODO: Add Renew page (and logic)
    case ApplicationStatus.ChangesRequired:
      return <Link to={`/application/${serial}`}>{ACTIONS.MAKE_CHANGES}</Link> // TODO: Show number of responses to make changes
    case undefined:
      console.log('Problem to get status of application serial ', serial)
      return null
    default:
      return (
        <Segment basic textAlign="center">
          <p>{status}</p>
        </Segment>
      )
  }
}

export default StatusCell
