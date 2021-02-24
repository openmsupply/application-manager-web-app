import { DateTime } from 'luxon'
import { BasicStringObject } from '../../types'
import { ApplicationStatus, ApplicationOutcome } from '../../generated/graphql'

interface FilterMap {
  [key: string]: (value: string) => object
}

interface NamedDateMap {
  [key: string]: string[]
}

export default function buildQueryFilters(filters: BasicStringObject) {
  const graphQLfilter = Object.entries(filters).reduce((filterObj, [key, value]) => {
    if (!mapQueryToFilterField[key]) return filterObj
    return { ...filterObj, ...mapQueryToFilterField[key](value) }
  }, {})
  // If no filters, return a dummy filter to prevent GraphQL empty object error
  if (Object.keys(graphQLfilter).length === 0) return { templateCode: { isNull: false } }
  return graphQLfilter
}

const mapQueryToFilterField: FilterMap = {
  type: (value: string) => ({ templateCode: { equalToInsensitive: value } }),

  // category -- not yet implemented in schema

  stage: (values: string) => ({ stage: inList(values) }),

  status: (values: string) => ({ status: inEnumList(values, ApplicationStatus) }),

  outcome: (values: string) => ({ outcome: inEnumList(values, ApplicationOutcome) }),
  // action
  // assigned
  // consolidator
  applicant: (values: string) => ({
    or: [
      { applicant: inList(values) },
      { applicantFirstName: inList(values) },
      { applicantLastName: inList(values) },
      { applicantUsername: inList(values) },
    ],
  }),

  org: (values: string) => ({ orgName: inList(values) }),

  lastActiveDate: (value: string) => {
    const [startDate, endDate] = parseDateString(value)
    console.log('Dates:', startDate, endDate)
    return { lastActiveDate: { greaterThanOrEqualTo: startDate, lessThan: endDate } }
  },

  // deadlineDate (TBD)

  search: (value: string) => ({
    or: [
      { name: { includesInsensitive: value } },
      { applicantUsername: { includesInsensitive: value } },
      { applicant: { includesInsensitive: value } },
      { orgName: { includesInsensitive: value } },
      { templateName: { includesInsensitive: value } },
      { stage: { startsWithInsensitive: value } },
    ],
  }),
}

const splitCommaList = (values: string) => values.split(',')

// Use this if the values can be free text strings (e.g. stage name)
const inList = (values: string) => ({ inInsensitive: splitCommaList(values) })

// Use this if the values must conform to an Enum type (e.g. status, outcome)
const inEnumList = (values: string, enumList: any) => ({
  in: splitCommaList(values)
    .map((value) => value.toUpperCase())
    .filter((value) => Object.values(enumList).includes(value)),
})

const parseDateString = (dateString: string) => {
  if (dateString in mapNamedDates) return mapNamedDates[dateString]
  const [startDate, endDate] = dateString.split(':')
  if (endDate === undefined)
    // Exact date -- add 1 to cover until start of the next day
    return [startDate, datePlusDays(1, startDate)]
  if (endDate === '') return [startDate, undefined] // No end date boundary
  if (startDate === '') return [undefined, endDate] // No start date boundary
  return [startDate, endDate]
}

const datePlusDays = (offset = 0, dateString: string | undefined = undefined) =>
  dateString
    ? DateTime.fromISO(dateString).plus({ days: offset }).toISODate()
    : DateTime.local().plus({ days: offset }).toISODate()

const mapNamedDates: NamedDateMap = {
  today: [datePlusDays(), datePlusDays(1)],
  yesterday: [datePlusDays(-1), datePlusDays()],
  'this-week': [datePlusDays(-7), datePlusDays(1)],
  // TO-DO:
  //  last-week,
  //  this-month,
  //  last-month,
  //  this-quarter,
  //  last-quarter,
  //  this-year,
  //  last-year
  //  etc...
}
