import { DateTime } from 'luxon'
import { BasicStringObject } from '../../types'
import { ApplicationStatus, ApplicationOutcome } from '../../generated/graphql'

interface FilterMap {
  [urlQueryKey: string]: (urlQueryValue: string) => object
}

interface NamedDateMap {
  [key: string]: string[]
}

type GetGenericTypes = () => FilterMap
type GenericTypesMethod = (filterKey: string) => object

export default function buildQueryFilters(filters: BasicStringObject) {
  const graphQLfilter = Object.entries(filters).reduce((filterObj, [key, value]) => {
    if (!mapQueryToFilterField[key]) return filterObj
    return { ...filterObj, ...mapQueryToFilterField[key](value) }
  }, {})
  // If no filters, return a dummy filter to prevent GraphQL empty object error
  if (Object.keys(graphQLfilter).length === 0) return { templateCode: { isNull: false } }
  return graphQLfilter
}

/* 
  Query filters are mapped to an object provided by mapQueryToFilterField, they are in this format:
  [filterName]: (queryString) => {[columnName]: { graphQLfilter }}
  for example (url query parameter) ?filterName=queryString (?lastActiveDate=2021-02-01:2021-02-04)
  would result in => {lastActiveDate: { greaterThanOrEqualTo: "2021-02-01", lessThanOrEqualTo: "2021-02-04"  } } 
*/

/* 
  For generic types, mapping is provided via generiTypes -> getGenericTypes, and custom mapping is declared in mapQueryToFilterField
  for example getGenericTypes will return an object like this: 
  {
    ...
    isFullyAssignedLevel1: (filterString) => { isFullyAssigneLevel1: { equalTo: String(filterString).toLowerCase() === 'true' } }
  }
 */

const genericTypes: { computeFilter: GenericTypesMethod; columns: string[] }[] = [
  // DATE TYPE
  {
    computeFilter: (filterString: string) => {
      const [startDate, endDate] = parseDateString(filterString)
      const greaterThanOrEqualTo = startDate ? startDate : undefined
      const lessThan = endDate ? endDate : undefined

      return { greaterThanOrEqualTo, lessThan }
    },
    columns: ['lastActiveDate'],
  },
  // BOOLEAN TYPE
  {
    computeFilter: (filterString: string) => {
      return { equalTo: String(filterString).toLowerCase() === 'true' }
    },
    columns: ['isFullyAssignedLevel1'],
  },
]

// For every genericTypes mapping, return a method that generates a filter, see example above (isFullyAssignedLevel1)
const getGenericTypes: GetGenericTypes = () => {
  const resultFilters: FilterMap = {}
  const addToResultFilter = (columnName: string, method: GenericTypesMethod) => {
    const newFilterMethod = (filterString: string) => ({ [columnName]: method(filterString) })
    resultFilters[columnName] = newFilterMethod
  }

  genericTypes.forEach(({ computeFilter, columns }) =>
    columns.forEach((columnName) => addToResultFilter(columnName, computeFilter))
  )
  return resultFilters
}

const mapQueryToFilterField: FilterMap = {
  ...getGenericTypes(),

  type: (value: string) => ({ templateCode: { equalToInsensitive: value } }),

  // category -- not yet implemented in schema

  stage: (values: string) => ({ stage: inList(values) }),

  status: (values: string) => ({ status: inEnumList(values, ApplicationStatus) }),

  outcome: (values: string) => ({ outcome: inEnumList(values, ApplicationOutcome) }),

  applicant: (values: string) => ({
    or: [
      { applicant: inList(values) },
      { applicantFirstName: inList(values) },
      { applicantLastName: inList(values) },
      { applicantUsername: inList(values) },
    ],
  }),

  reviewer: (values: string) => ({ reviewerUsernames: inArray(values) }),

  assigner: (values: string) => ({ assignerUsernames: inArray(values) }),

  org: (values: string) => ({ orgName: inList(values) }),

  reviewerAction: (value: string) => ({ reviewerAction: { equalTo: value } }),

  assignerAction: (value: string) => ({ assignerAction: { equalTo: value } }),

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

// Use this to find string in an array of strings
const inArray = (values: string) => ({ overlaps: splitCommaList(values) })

// Use this if the values can be free text strings (e.g. stage name)
const inList = (values: string) => ({ inInsensitive: splitCommaList(values) })

// Use this if the values must conform to an Enum type (e.g. status, outcome)
const inEnumList = (values: string, enumList: any) => ({
  in: splitCommaList(values)
    .map((value) => value.toUpperCase().replace(' ', '_'))
    .filter((value) => [...Object.values(enumList)].includes(value)),
})

// Can represent dates as relative numbers (number of days), i.e. -1, +4, 4, -3
const convertRelativeDates = (dateStrings: string[]) =>
  dateStrings.map((dateString) => {
    if (!dateString.trim().match(/^[-+\d]+$/g)) return dateString
    return datePlusDays(Number(dateString))
  })

const parseDateString = (dateString: string) => {
  if (dateString in mapNamedDates) return mapNamedDates[dateString]
  const [startDate, endDate] = convertRelativeDates(dateString.split(':'))
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
