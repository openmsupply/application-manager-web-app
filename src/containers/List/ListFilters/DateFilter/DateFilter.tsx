import React, { useState, useEffect } from 'react'
import { DateTime, Info } from 'luxon'
import { getCurrentMonth, getInterval, getWeeks } from './helpers'
import {
  DateFilterProps,
  IntervalOrNull,
  CalendarType,
  CalendarProps,
  NamedDatesProps,
  CalendarMonthProps,
  ChangeMonth,
  ChangeMonthDirection,
  Day,
  FilterTitleProps,
} from './types'
import { FilterContainer } from '../common'
import { Icon } from 'semantic-ui-react'
import {
  formatDateLabel,
  formatDateUrl,
  parseDateRange,
} from '../../../../utils/dateAndTime/parseDateRange'

const WEEKDAYS = Info.weekdays('short')

const DateFilter: React.FC<DateFilterProps> = ({
  namedDates = {},
  title = '',
  dateString = '',
  setDateString,
  onRemove,
}) => {
  // Below variable is puerly for next/previous button visibility
  const [calendarMonths, setCalendarMonths] = useState<{ [key in CalendarType]: DateTime | null }>({
    FROM: null,
    TO: null,
  })

  const dateRange = parseDateRange(dateString, namedDates)
  const { startDate, endDate } = dateRange
  const range: IntervalOrNull = getInterval(startDate.date, endDate.date)

  const getFilterCriteria = () => {
    if (!startDate.date && !endDate.date) return ''
    if (startDate.named) return namedDates[startDate.named].title

    if (!startDate.date) return `Before ${formatDateLabel(endDate)}`
    if (!endDate.date) return `After ${formatDateLabel(startDate)}`

    return `${formatDateLabel(startDate)} - ${formatDateLabel(endDate)}`
  }

  const renderCalendar = (type: CalendarType) => (
    <Calendar
      key={type}
      type={type}
      range={range}
      namedDate={startDate.named}
      otherMonth={calendarMonths[type === 'TO' ? 'FROM' : 'TO']}
      setCalendarMonth={(date: DateTime) =>
        setCalendarMonths((calendarMonths) => ({ ...calendarMonths, [type]: date }))
      }
      setSelected={(date: DateTime) => {
        const options = []
        if (type === 'FROM') {
          options.push(formatDateUrl({ date }))
          options.push(formatDateUrl(endDate))
        } else {
          options.push(formatDateUrl(startDate))
          options.push(formatDateUrl({ date }))
        }

        setDateString(options.join(':'))
      }}
    />
  )

  return (
    <FilterContainer
      replacementTrigger={<FilterTitle title={title} criteria={getFilterCriteria()} />}
      onRemove={onRemove}
    >
      <div className="date-filter" onClick={(e) => e.stopPropagation()}>
        <NamedDates namedDates={namedDates} date={startDate} setNamedDate={setDateString} />
        {renderCalendar('FROM')}
        {renderCalendar('TO')}
      </div>
    </FilterContainer>
  )
}

const FilterTitle: React.FC<FilterTitleProps> = ({ title, criteria }) => {
  return (
    <div className="date-filter-title">
      <Icon name="calendar alternate" />
      <div className={title && criteria ? 'title-and-criteria' : ''}>
        {criteria && <div className="filter-criteria">{criteria}</div>}
        {title && <div>{title}</div>}
      </div>
    </div>
  )
}

const NamedDates: React.FC<NamedDatesProps> = ({ namedDates, date, setNamedDate }) => {
  const keys = Object.keys(namedDates)
  if (keys.length === 0) return null

  return (
    <div className="named-dates">
      {keys.map((key) => (
        <div
          key={key}
          onClick={() => setNamedDate(key)}
          className={date.named === key ? 'selected-named-date' : ''}
        >
          {namedDates[key].title}
        </div>
      ))}
    </div>
  )
}

const CalendarMonth: React.FC<CalendarMonthProps> = ({
  currentMonth,
  otherMonth,
  type,
  changeMonth,
}) => {
  const canRenderMonthChange = (direction: ChangeMonthDirection) => {
    if (!otherMonth) return true
    if (direction === 'NEXT' && type === 'TO') return true
    if (direction === 'PREVIOUS' && type === 'FROM') return true

    return type === 'TO' ? currentMonth > otherMonth : currentMonth < otherMonth
  }

  const renderMonthChange = (direction: ChangeMonthDirection) => (
    <div className="month-button" onClick={() => changeMonth(direction)}>
      {' '}
      <Icon
        name={direction === 'NEXT' ? 'chevron right' : 'chevron left'}
        color="grey"
        size="large"
      />
    </div>
  )

  return (
    <div className="month-selector">
      {canRenderMonthChange('PREVIOUS') && renderMonthChange('PREVIOUS')}
      <div className="month-name">{`${currentMonth.monthLong} ${currentMonth.year}`}</div>

      {canRenderMonthChange('NEXT') && renderMonthChange('NEXT')}
    </div>
  )
}

const Calendar: React.FC<CalendarProps> = ({
  type,
  range,
  setSelected,
  otherMonth,
  setCalendarMonth,
  namedDate,
}) => {
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth(null, type, range))
  // When current month changes, inform parent so that allowed next/previous can be adjusted in sibling calendar
  useEffect(() => {
    setCalendarMonth(currentMonth)
  }, [currentMonth])

  // When named date is selected, reset currentMonth
  useEffect(() => {
    if (namedDate) setCurrentMonth(getCurrentMonth(null, type, range))
  }, [namedDate])

  const weeks = getWeeks(currentMonth, range, type)
  const changeMonth: ChangeMonth = (direction) =>
    setCurrentMonth(currentMonth[direction === 'PREVIOUS' ? 'minus' : 'plus']({ month: 1 }))

  const renderDayCell = (
    { dayString, isInRange, isSelected, isFirstInRange, isLastInRange, isDateClickable, date }: Day,
    index: number
  ) => {
    const classClickable = isDateClickable ? 'clickable' : 'not-clickable'
    const classFirstInRange = isFirstInRange ? 'first-in-range' : ''
    const classLastInRange = isLastInRange ? 'last-in-range' : ''
    const classDayInRange = isInRange ? 'day-in-range' : ''

    return (
      <div
        key={index}
        className={`${classClickable} ${classFirstInRange} ${classLastInRange} ${classDayInRange}`}
        onClick={() => {
          if (date) setSelected(date)
        }}
      >
        <div className={isSelected ? 'day-selected' : ''}>
          <div>{dayString}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="calendar-container">
      <CalendarMonth
        changeMonth={changeMonth}
        currentMonth={currentMonth}
        otherMonth={otherMonth}
        type={type}
      />

      <div className="calendar-days-container">
        <div className="week-day-headers">
          {WEEKDAYS.map((weekday) => (
            <div key={weekday}>{weekday.toUpperCase()}</div>
          ))}
        </div>

        {weeks.map((week, index) => (
          <div key={index} className="week-day-row">
            {week.map(renderDayCell)}
          </div>
        ))}
      </div>
    </div>
  )
}

export default DateFilter
