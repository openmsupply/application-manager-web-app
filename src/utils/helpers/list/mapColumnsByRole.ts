import {
  ApplicantCell,
  ApplicationNameCell,
  ConsolidatorCell,
  DeadlineCell,
  LastActiveDateCell,
  OrganisationCell,
  OutcomeCell,
  SerialNumberCell,
  StageCell,
  StatusCell,
} from '../../../components/List/Cells'
import { APPLICATION_COLUMNS, USER_ROLES } from '../../data'
import COLUMNS_PER_ROLE from '../../data/columnsPerUserRole'
import { ColumnDetails } from '../../types'

/**
 * @function: mapColumnsByRole
 * Map object with all columns to be displayed - based on the current user Role.
 * In each column details has the defining of the header title, possible filter keys and
 * a render function (To be done in another issue).
 * The render function will return the component to be rendered in each cell in this column
 * using the application in the row props.
 * - @param userRole - Current user role - as string (TODO: Use type)
 * - @returns Object with each Column details to construct header and rows of applications list.s
 */

const allColumns: { [key in APPLICATION_COLUMNS]: ColumnDetails } = {
  SERIAL_NUMBER: {
    headerName: ' ',
    sortName: 'serial',
    ColumnComponent: SerialNumberCell,
  },
  LAST_ACTIVE_DATE: {
    headerName: 'Active Date',
    sortName: 'last-active-date',
    ColumnComponent: LastActiveDateCell,
  },
  DEADLINE_DATE: {
    headerName: 'Deadline date',
    sortName: '', // Not yet implemented
    ColumnComponent: DeadlineCell,
  },
  APPLICATION_NAME: {
    headerName: 'Application Name',
    sortName: 'name',
    ColumnComponent: ApplicationNameCell,
  },
  APPLICANT: {
    headerName: 'Applicant',
    sortName: 'applicant',
    ColumnComponent: ApplicantCell,
  },
  ORGANISATION: {
    headerName: 'Organisation',
    sortName: 'org',
    ColumnComponent: OrganisationCell,
  },
  CONSOLIDATOR: {
    headerName: 'Consolidator',
    sortName: 'consolidator', // Not implemented in query
    ColumnComponent: ConsolidatorCell,
  },
  STAGE: {
    headerName: 'Stage',
    sortName: 'stage',
    ColumnComponent: StageCell,
  },
  STATUS: {
    headerName: 'Status',
    sortName: 'status',
    ColumnComponent: StatusCell,
  },
  OUTCOME: {
    headerName: 'Outcome',
    sortName: 'outcome',
    ColumnComponent: OutcomeCell,
  },
}

export default (userRoles: USER_ROLES): Array<ColumnDetails> => {
  const columns: Array<ColumnDetails> = COLUMNS_PER_ROLE[userRoles].map((key) => allColumns[key])
  return columns
}
