import { DateTime } from 'luxon'
import {
  BasicStringObject,
  FilterDefinition,
  FilterDefinitions,
  FilterTypeDefinitions,
} from '../../types'

interface NamedDateMap {
  [key: string]: string[]
}

export default function buildQueryFilters(
  filters: BasicStringObject,
  filterDefinitions: FilterDefinitions
) {
  const graphQLfilter = Object.entries(filters).reduce((filterObj, [filterName, filterValue]) => {
    const filterDefinition = filterDefinitions[filterName]
    if (!filterDefinition) return filterObj
    return { ...filterObj, ...constructFilter(filterDefinition, filterName, filterValue) }
  }, {})
  // If no filters, return a dummy filter to prevent GraphQL empty object error
  if (Object.keys(graphQLfilter).length === 0) return { templateCode: { isNull: false } }
  return graphQLfilter
}

// Defines how string filter are transfered to graphQL filter for each type
const filterTypeDefinitions: FilterTypeDefinitions = {
  number: (filterValue) => {
    const [fromNumber, toNumber] = filterValue.split(':')
    const greaterThanOrEqualTo = fromNumber ? fromNumber : undefined
    const lessThanOrEqualTo = toNumber ? toNumber : undefined

    return { greaterThanOrEqualTo, lessThanOrEqualTo }
  },
  date: (filterValue) => {
    const [startDate, endDate] = parseDateString(filterValue)
    const greaterThanOrEqualTo = startDate ? startDate : undefined
    const lessThan = endDate ? endDate : undefined

    return { greaterThanOrEqualTo, lessThan }
  },
  boolean: (filterValue) => ({
    equalTo: String(filterValue).toLowerCase() === 'true',
  }),

  equals: (filterValue) => ({ equalToInsensitive: filterValue }),
  // Use this if the values must conform to an Enum type (e.g. status, outcome)
  enumList: (filterValue, options) => ({
    in: splitCommaList(filterValue)
      .map((value) => value.toUpperCase().replace(' ', '_'))
      .filter((value) => (options?.enumList || []).includes(value)),
  }),
  // For string column of search and select values
  searchableListIn: (filterValue) => inList(filterValue),
  // For array column of search and select values
  searchableListInArray: (filterValue) => ({ overlaps: splitCommaList(filterValue) }),
  // For array column of static select values
  staticList: (filterValue) => inList(filterValue),
  // For string column of searchable values
  search: (filterValue) => ({ includesInsensitive: filterValue }),
}

// Constructs OR filter i.e. { or: [fieldName1: filter, fieldName2: filter]}
const constructOrFilter = (filter: object, orFieldNames: string[]) => ({
  or: orFieldNames.map((fieldName) => ({
    [fieldName]: filter,
  })),
})

// Uses filterDefinition and filterTypeDefinitions to construct
const constructFilter = (
  { type, options }: FilterDefinition,
  filterName: string,
  filterValue: string
) => {
  const filter = filterTypeDefinitions[type](filterValue, options)

  const { orFieldNames = [], substituteColumnName = '' } = options || {}
  // If orFieldNames are provided return or statement

  if (orFieldNames.length > 0) return constructOrFilter(filter, orFieldNames)
  // If substituteColumnName is provided use substituteColumnName
  if (substituteColumnName) return { [substituteColumnName]: filter }

  // otherwise use filterName
  return { [filterName]: filter }
}

const splitCommaList = (values: string) => values.split(',')

// Use this if the values can be free text strings (e.g. stage name)
const inList = (values: string) => ({ inInsensitive: splitCommaList(values) })

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
