import { DateTime, Interval } from 'luxon'
import { today } from '../../../../utils/dateAndTime/parseDateRange'
import {
  DateOrNull,
  GetInterval,
  GetCurrentMonth,
  IsInRange,
  IsSelected,
  IsDateClickable,
  GetWeeks,
  Week,
  Day,
} from './types'

// Min and Max date to create interval if one start or end date is missing
const MIN_DATE = DateTime.local(3, 3, 3)
const MAX_DATE = MIN_DATE.plus({ year: 55555 })

export const getInterval: GetInterval = (_startDate, _endDate) => {
  if (!_startDate && !_endDate) return null

  const startDate = _startDate || MIN_DATE
  let endDate = _endDate || MAX_DATE

  if (startDate > endDate) endDate = startDate

  return Interval.fromDateTimes(startDate || MIN_DATE, endDate || MAX_DATE)
}

const caluclateCurrentMonth: GetCurrentMonth = (date, type, range) => {
  if (date) return date
  if (!range) return date || today()

  const isMinDate = range.start.equals(MIN_DATE)
  const isMaxDate = range.end.equals(MAX_DATE)

  if (isMinDate && isMaxDate) return today()

  if (type === 'FROM') {
    if (isMinDate) return range.end.minus({ day: 1 })
    return range.start
  }

  if (isMaxDate) return range.start.plus({ day: 1 })
  return range.end
}

export const getCurrentMonth: GetCurrentMonth = (date, type, range) => {
  const resultDate = caluclateCurrentMonth(date, type, range)
  return DateTime.local(resultDate.year, resultDate.month, 1)
}

const isInRange: IsInRange = (date, range) => {
  if (!range || !date) return false
  return range.contains(date) || range.end.equals(date)
}

const isSelected: IsSelected = (date, range, type) => {
  if (!range || !date) return false
  if (type === 'FROM') return range.start.equals(date)
  return range.end.equals(date)
}

const isDateClickable: IsDateClickable = (date, range, type) => {
  if (!date) return false
  if (!range) return true

  if (type === 'FROM') return date <= range.end
  return date >= range.start
}

export const getWeeks: GetWeeks = (month, range, type) => {
  const firstDay = month.weekday
  const daysInMonth = month.daysInMonth

  const weeks: Week[] = []
  let dayCount = 0
  let previousInRange = false
  let previousDay: Day | null = null
  do {
    const week: Week = []

    for (let dayOfWeek = 1; dayOfWeek <= 7; dayOfWeek++) {
      if (dayCount !== 0 || firstDay === dayOfWeek) dayCount++
      let date: DateOrNull = null
      if (dayCount > 0 && dayCount <= daysInMonth)
        date = DateTime.local(month.year, month.month, dayCount)

      const dayPartial = {
        dayString: date ? String(dayCount) : '',
        date,
        isInRange: isInRange(date, range),
        isSelected: isSelected(date, range, type),
        isDateClickable: isDateClickable(date, range, type),
      }

      const currentDay = {
        ...dayPartial,
        isFirstInRange: dayPartial.isInRange && !previousInRange,
        isLastInRange: dayPartial.isInRange && dayCount === daysInMonth,
      }

      week.push(currentDay)

      if (previousDay)
        previousDay.isLastInRange =
          previousDay.isLastInRange || (!dayPartial.isInRange && previousInRange)

      previousDay = currentDay
      previousInRange = dayPartial.isInRange
    }
    weeks.push(week)
  } while (dayCount < daysInMonth)

  return weeks
}
