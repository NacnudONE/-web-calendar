import React from 'react'
import { format, parseISO, isSameMonth } from 'date-fns'
import type { CalendarEvent } from '../../../entities/calendar'
import { useCalendarStore } from '../../../entities/calendar'
import classNames from 'classnames'
import { formatEventTime, hexToRgba, buildMonthGrid } from '../../../shared/lib'
import styles from './MonthView.module.scss'

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MAX_VISIBLE = 3

interface Props {
  onEventClick: (event: CalendarEvent, pos: { x: number; y: number }) => void
  onDayClick: (date: string) => void
}

const MonthView = ({ onEventClick, onDayClick }: Props) => {
  const { currentDay, getEventColor, getEventsForDate, setCurrentDay } = useCalendarStore()
  const today = format(new Date(), 'yyyy-MM-dd')
  const date = parseISO(currentDay)

  const days = buildMonthGrid(date)

  return (
    <div className={styles.wrapper}>
      <div className={styles.dayNames}>
        {DAY_NAMES.map(d => (
          <div key={d} className={styles.dayName}>{d}</div>
        ))}
      </div>

      <div className={styles.grid}>
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const isToday = dateStr === today
          const isCurrentMonth = isSameMonth(day, date)
          const events = getEventsForDate(dateStr)
          const visible = events.slice(0, MAX_VISIBLE)
          const hidden = events.length - MAX_VISIBLE

          return (
            <div
              key={dateStr}
              className={classNames(styles.dayCell, { [styles.dayCellOther]: !isCurrentMonth })}
              onClick={() => onDayClick(dateStr)}
            >
              <div className={classNames(styles.dayNum, { [styles.dayNumToday]: isToday })}>
                {format(day, 'd')}
              </div>

              <div className={styles.events}>
                {visible.map(evt => {
                  const color = getEventColor(evt.calendarId)
                  return (
                    <div
                      key={evt.id}
                      className={classNames(styles.eventChip, { [styles.eventChipDone]: evt.isDone })}
                      style={{ background: hexToRgba(color, 0.18), borderLeft: `3px solid ${color}` }}
                      onClick={e => { e.stopPropagation(); onEventClick(evt, { x: e.clientX, y: e.clientY }) }}
                    >
                      {!evt.allDay && (
                        <span className={styles.chipTime}>{formatEventTime(evt.startTime)}</span>
                      )}
                      <span className={styles.chipTitle}>{evt.title}</span>
                    </div>
                  )
                })}
                {hidden > 0 && (
                  <div
                    className={styles.moreChip}
                    onClick={e => {
                      e.stopPropagation()
                      setCurrentDay(dateStr)
                      onDayClick(dateStr)
                    }}
                  >
                    +{hidden} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MonthView
