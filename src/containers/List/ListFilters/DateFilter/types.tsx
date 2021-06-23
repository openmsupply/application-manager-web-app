import { DateTime, Interval } from 'luxon'
import { ParsedDate } from '../../../../utils/dateAndTime/types'
import { NamedDates } from '../../../../utils/types'
import { FiltersCommon } from '../types'

export type DateOrNull = DateTime | null
export type IntervalOrNull = Interval | null
export type CalendarType = 'FROM' | 'TO'
export type ChangeMonthDirection = 'NEXT' | 'PREVIOUS'
export type Day = {
  dayString: string
  date: DateOrNull
  isInRange: boolean
  isSelected: boolean
  isFirstInRange: boolean
  isLastInRange: boolean
  isDateClickable: boolean
}
export type Week = Day[]

export type ParseDate = (option: string) => DateOrNull
export type ParseDateOption = (options: string[]) => { startDate: DateOrNull; endDate: DateOrNull }
export type GetInterval = (startDate: DateOrNull, endDate: DateOrNull) => IntervalOrNull
export type GetCurrentMonth = (
  currentMonth: DateOrNull,
  type: CalendarType,
  range: IntervalOrNull
) => DateTime
export type GetWeeks = (month: DateTime, range: IntervalOrNull, type: CalendarType) => Week[]
export type IsInRange = (date: DateOrNull, range: IntervalOrNull) => boolean
export type IsSelected = (date: DateOrNull, range: IntervalOrNull, type: CalendarType) => boolean
export type IsDateClickable = (
  date: DateOrNull,
  range: IntervalOrNull,
  type: CalendarType
) => boolean
export type ChangeMonth = (direction: ChangeMonthDirection) => void

export type NamedDatesProps = {
  namedDates: NamedDates
  date: ParsedDate
  setNamedDate: (namedDate: string) => void
}
export type DateFilterProps = FiltersCommon & {
  namedDates?: NamedDates
  dateString: string
  setDateString: (dateStrin: string) => void
}
export type CalendarProps = {
  type: CalendarType
  range: IntervalOrNull
  setSelected: (date: DateTime) => void
  otherMonth: DateOrNull
  namedDate?: string
  setCalendarMonth: (date: DateTime) => void
}
export type CalendarMonthProps = {
  currentMonth: DateTime
  otherMonth: DateOrNull
  type: CalendarType
  changeMonth: ChangeMonth
}
export type FilterTitleProps = {
  title: string
  criteria: string
}
