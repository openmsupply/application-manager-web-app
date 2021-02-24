import React from 'react'
import { DateTime } from 'luxon'
import { CellProps } from '../../../utils/types'

const LastActiveDateCell: React.FC<CellProps> = ({ application }) => {
  return <p>{DateTime.fromISO(application.lastActiveDate).toISODate()}</p>
}
export default LastActiveDateCell
