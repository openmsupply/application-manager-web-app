import { DateTime, Duration } from 'luxon'
import strings from '../constants'

type DisplayOptions = {
  condition: (duration: Duration) => boolean
  display: (duration: Duration) => React.ReactNode
}

const displayOptions: DisplayOptions[] = [
  {
    condition: (duration) => duration.as('day') <= 1,
    display: () => strings.TODAY,
  },
  {
    condition: (duration) => duration.as('day') <= 2,
    display: () => strings.YESTERDAY,
  },
  {
    condition: (duration) => duration.as('day') <= 8,
    display: (duration) => `${Math.floor(duration.as('days'))} ${strings.DAYS_AGO}`,
  },
  {
    condition: (duration) => duration.as('week') < 2,
    display: () => strings.LAST_WEEK,
  },
  {
    condition: (duration) => duration.as('week') <= 4,
    display: (duration) => `${Math.floor(duration.as('week'))} ${strings.WEEKS_AGO}`,
  },
  {
    condition: (duration) => duration.as('month') < 2,
    display: () => strings.LAST_MONTH,
  },
  {
    condition: (duration) => duration.as('month') <= 12,
    display: (duration) => `${Math.floor(duration.as('month'))} ${strings.MONTHS_AGO}`,
  },
  {
    condition: (duration) => duration.as('year') <= 2,
    display: () => strings.LAST_YEAR,
  },
  {
    condition: (duration) => duration.as('year') > 2,
    display: (duration) => `${Math.floor(duration.as('year'))} ${strings.YEARS_AGO}`,
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
