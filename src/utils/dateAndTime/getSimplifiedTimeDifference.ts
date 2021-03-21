import { DateTime, Duration } from 'luxon'
import strings from '../constants'

type DisplayOptions = {
  condition: (duration: Duration) => boolean
  display: (duration: Duration) => React.ReactNode
}

const displayOptions: DisplayOptions[] = [
  {
    condition: (duration) => duration.as('minute') <= 2,
    display: () => 'Just Now',
  },
  {
    condition: (duration) => duration.as('minute') <= 60,
    display: (duration) => `${Math.floor(duration.as('minute'))} mins`,
  },
  {
    condition: (duration) => duration.as('hour') <= 2,
    display: (duration) => 'Last Hour',
  },
  {
    condition: (duration) => duration.as('hour') <= 24,
    display: (duration) => `${Math.floor(duration.as('hour'))} hours`,
  },
  {
    condition: (duration) => duration.as('day') <= 1,
    display: () => strings.DATE_TODAY,
  },
  {
    condition: (duration) => duration.as('day') <= 2,
    display: () => strings.DATE_YESTERDAY,
  },
  {
    condition: (duration) => duration.as('day') <= 8,
    display: (duration) => `${Math.floor(duration.as('days'))} ${strings.DATE_DAYS_AGO}`,
  },
  {
    condition: (duration) => duration.as('week') < 2,
    display: () => strings.DATE_LAST_WEEK,
  },
  {
    condition: (duration) => duration.as('week') <= 4,
    display: (duration) => `${Math.floor(duration.as('week'))} ${strings.DATE_WEEKS_AGO}`,
  },
  {
    condition: (duration) => duration.as('month') < 2,
    display: () => strings.DATE_LAST_MONTH,
  },
  {
    condition: (duration) => duration.as('month') <= 12,
    display: (duration) => `${Math.floor(duration.as('month'))} ${strings.DATE_MONTHS_AGO}`,
  },
  {
    condition: (duration) => duration.as('year') <= 2,
    display: () => strings.DATE_LAST_YEAR,
  },
  {
    condition: (duration) => duration.as('year') > 2,
    display: (duration) => `${Math.floor(duration.as('year'))} ${strings.DATE_YEARS_AGO}`,
  },
]

const getSimplifiedTimeDifference = (date: Date | undefined) => {
  if (!date) return ''

  const duration = DateTime.local().diff(DateTime.fromISO(`${date}`))

  const displayOption = displayOptions.find((displayOption) => displayOption.condition(duration))

  if (!displayOption) return ''

  return displayOption.display(duration)
}

export default getSimplifiedTimeDifference
