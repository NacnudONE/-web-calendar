import React, { useState } from 'react'
import classNames from 'classnames'
import { format, parseISO, addMonths, subMonths, isSameDay, isSameMonth, isToday } from 'date-fns'
import { buildMonthGrid } from '../../lib'
import styles from './MiniCalendar.module.scss'

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

interface Props {
  value: string
  onChange: (date: string) => void
}

export const MiniCalendar = ({ value, onChange }: Props) => {
  const selected = parseISO(value)
  const [viewDate, setViewDate] = useState(selected)

  const days = buildMonthGrid(viewDate)

  const handleDay = (day: Date) => {
    onChange(format(day, 'yyyy-MM-dd'))
    if (!isSameMonth(day, viewDate)) setViewDate(day)
  }

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <span className={styles.monthLabel}>{format(viewDate, 'MMMM yyyy')}</span>
        <div className={styles.navBtns}>
          <button className={styles.navBtn} onClick={() => setViewDate(d => subMonths(d, 1))}>
            <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
              <path d="M5 1L1 5l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className={styles.navBtn} onClick={() => setViewDate(d => addMonths(d, 1))}>
            <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
              <path d="M1 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        {WEEKDAYS.map((wd, i) => (
          <div key={i} className={styles.weekday}>{wd}</div>
        ))}
        {days.map(day => {
          const isOut = !isSameMonth(day, viewDate)
          const isSel = isSameDay(day, selected)
          const isTod = isToday(day)

          return (
            <button
              key={day.toISOString()}
              className={classNames(styles.day, {
                [styles.outside]: isOut,
                [styles.selected]: isSel,
                [styles.today]: isTod && !isSel,
                [styles.todaySelected]: isTod && isSel,
              })}
              onClick={() => handleDay(day)}
            >
              {format(day, 'd')}
            </button>
          )
        })}
      </div>
    </div>
  )
}
