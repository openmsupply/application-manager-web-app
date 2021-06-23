import { DateTime } from 'luxon'
import { NamedDates } from '../types'

export type RelativeUnit = 'day' | 'week' | 'month' | 'quarter' | 'year'

export type ParsedDate = {
  date: DateTime | null
  relative?: { value: number; unit: RelativeUnit }
  named?: string
}

type ParsedDateRange = {
  startDate: ParsedDate
  endDate: ParsedDate
}

export type ParseDate = (dateString: string) => ParsedDate
export type ParseDateRange = (dateString: string, namedDates?: NamedDates) => ParsedDateRange
export type GetNamedDateRange = (
  namedDate: string,
  namedDates: NamedDates
) => ParsedDateRange | null
export type ToDate = (date: DateTime) => DateTime
export type Today = () => DateTime
