import { DateTime } from 'luxon'
import {
  ToDate,
  Today,
  ParseDate,
  ParsedDate,
  ParseDateRange,
  GetNamedDateRange,
  RelativeUnit,
} from './types'

const DATE_FORMAT = 'y-MM-dd'
const DATE_FORMAT_LABLE = 'd MMM'
const DATE_FORMAT_LABLE_DIFFERENT_YEAR = 'd MMM yy'

const toDate: ToDate = (date) => {
  const { year, month, day } = date
  return DateTime.local(year, month, day)
}

export const today: Today = () => toDate(DateTime.local())

// match first signed or unsigned digit, followed by deliminator _ then either
// day, week, quarter or year
const matchRelative = /^[+-]?\d+_(day|week|month|quarter|year){1}$/g

const parseDate: ParseDate = (dateString: string) => {
  if (dateString.trim().match(matchRelative)) {
    const [stringValue, unitString] = dateString.split('_')
    const value = Number(stringValue)
    const unit = unitString as RelativeUnit
    return { date: today().plus({ [unit]: value }), relative: { value, unit } }
  }

  let date: DateTime | null = null

  try {
    const result = DateTime.fromFormat(dateString, DATE_FORMAT)
    date = result.isValid ? result : null
  } catch (e) {}

  return { date }
}

export const formatDateUrl = ({ relative, date }: ParsedDate) => {
  if (relative) {
    return `${relative.value}_${relative.unit}`
  }
  if (date) return date.toFormat(DATE_FORMAT)
  return ''
}

export const formatDateLabel = ({ date }: ParsedDate) => {
  if (!date) return ''
  if (date.year === today().year) return date.toFormat(DATE_FORMAT_LABLE)
  return date.toFormat(DATE_FORMAT_LABLE_DIFFERENT_YEAR)
}

export const formatDateGraphQl = (date: DateTime) => date.toISODate()

export const parseDateRange: ParseDateRange = (dateString, namedDates = {}) => {
  if (namedDates) {
    const result = getNamedDateRanges(dateString, namedDates)
    if (result) return result
  }

  const [startDateString, endDateString] = dateString.split(':')
  let startDate: ParsedDate = { date: null }
  let endDate: ParsedDate = { date: null }

  if (startDateString) startDate = parseDate(startDateString)
  if (endDateString) endDate = parseDate(endDateString)

  return { startDate, endDate }
}

const getNamedDateRanges: GetNamedDateRange = (namedDate, namedDates) => {
  const namedDateRange = namedDates[namedDate]
  if (!namedDateRange) return null

  const [startDate, endDate] = namedDateRange.getDates()
  return {
    startDate: { date: startDate, named: namedDate },
    endDate: { date: endDate, named: namedDate },
  }
}
