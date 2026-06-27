import React, { useEffect, useRef } from 'react'
import classNames from 'classnames'
import { format, parseISO, startOfWeek, addDays } from 'date-fns'
import type { CalendarEvent } from '../../../entities/calendar'
import { useCalendarStore } from '../../../entities/calendar'
import { timeToMinutes, minutesToTime, snap15, formatEventTime, hexToRgba, layoutTimedEvents } from '../../../shared/lib'
import { useTimeGrid, HOURS } from '../../../shared/lib/useTimeGrid'
import { TimeColumn, EventTooltip } from '../../../shared/ui'
import styles from './WeekView.module.scss'

interface Props {
  onEventClick: (event: CalendarEvent, pos: { x: number; y: number }) => void
  onSlotClick: (time: string, date: string) => void
  onEventMove: (id: string, date: string, startTime: string, endTime: string) => void
}

export const WeekView = ({ onEventClick, onSlotClick, onEventMove }: Props) => {
  const { getEventColor, currentDay, getEventsForDate } = useCalendarStore()
  const { nowRef, nowMinutes, ghost, setGhost, tooltip, showTooltip, hideTooltip, dragRef } = useTimeGrid()
  const colRefs = useRef<(HTMLDivElement | null)[]>([])

  const weekStart = startOfWeek(parseISO(currentDay), { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const todayStr = format(new Date(), 'yyyy-MM-dd')

  useEffect(() => {
    nowRef.current?.scrollIntoView({ block: 'center' })
  }, [])

  const getColIndex = (clientX: number): number => {
    for (let i = 0; i < colRefs.current.length; i++) {
      const col = colRefs.current[i]
      if (!col) continue
      const rect = col.getBoundingClientRect()
      if (clientX >= rect.left && clientX <= rect.right) return i
    }
    return -1
  }

  const handleEventMouseDown = (e: React.MouseEvent, evt: CalendarEvent) => {
    e.preventDefault()

    const color = getEventColor(evt.calendarId)
    const startMin = timeToMinutes(evt.startTime)
    const endMin = timeToMinutes(evt.endTime)
    const duration = Math.max(endMin - startMin, 15)

    const initColIdx = getColIndex(e.clientX)
    const initCol = initColIdx >= 0 ? colRefs.current[initColIdx] : null
    if (!initCol) return

    const colRect = initCol.getBoundingClientRect()
    const rawOffset = e.clientY - colRect.top - startMin

    dragRef.current = {
      evt, color, duration, moved: false,
      offsetMin: Math.max(0, Math.min(rawOffset, duration - 15)),
    }

    const startY = e.clientY

    const onMove = (me: MouseEvent) => {
      const d = dragRef.current
      if (!d) return
      if (!d.moved && Math.abs(me.clientY - startY) < 8) return
      if (!d.moved) document.body.style.cursor = 'grabbing'
      d.moved = true

      const colIdx = getColIndex(me.clientX)
      if (colIdx < 0) return
      const col = colRefs.current[colIdx]
      if (!col) return

      const rect = col.getBoundingClientRect()
      const newTop = Math.max(0, Math.min(snap15(me.clientY - rect.top - d.offsetMin), 1440 - d.duration))
      const dateStr = format(weekDays[colIdx], 'yyyy-MM-dd')
      setGhost({ date: dateStr, top: newTop, height: d.duration, color: d.color })
    }

    const onUp = (ue: MouseEvent) => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
      const d = dragRef.current
      dragRef.current = null
      setGhost(null)
      if (!d) return
      if (!d.moved) {
        onEventClick(d.evt, { x: ue.clientX, y: ue.clientY })
        return
      }

      const colIdx = getColIndex(ue.clientX)
      if (colIdx < 0) return
      const col = colRefs.current[colIdx]
      if (!col) return

      const rect = col.getBoundingClientRect()
      const newStart = Math.max(0, Math.min(snap15(ue.clientY - rect.top - d.offsetMin), 1440 - d.duration))
      const newDate = format(weekDays[colIdx], 'yyyy-MM-dd')
      onEventMove(d.evt.id, newDate, minutesToTime(newStart), minutesToTime(newStart + d.duration))
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  const hasAnyAllDay = weekDays.some(day => getEventsForDate(format(day, 'yyyy-MM-dd')).some(e => e.allDay))

  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <div className={styles.headerOffset} />
          <div className={styles.daysHeader}>
            {weekDays.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const isToday = dateStr === todayStr
              return (
                <div key={dateStr} className={styles.dayCol}>
                  <div className={classNames(styles.dayBadge, { [styles.dayBadgeToday]: isToday })}>
                    <span className={styles.dayNum}>{format(day, 'd')}</span>
                    <span className={styles.dayName}>{format(day, 'EEE').toUpperCase()}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {hasAnyAllDay && (
          <div className={styles.allDayRow}>
            <div className={styles.allDayLabel}>All day</div>
            <div className={styles.allDayGrid}>
              {weekDays.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd')
                const allDayEvents = getEventsForDate(dateStr).filter(e => e.allDay)
                return (
                  <div key={dateStr} className={styles.allDayCell}>
                    {allDayEvents.map((evt) => {
                      const color = getEventColor(evt.calendarId)
                      return (
                        <div
                          key={evt.id}
                          className={classNames(styles.allDayChip, { [styles.eventDone]: evt.isDone })}
                          style={{ background: hexToRgba(color, 0.45), borderLeft: `4px solid ${color}` }}
                          onClick={(e) => onEventClick(evt, { x: e.clientX, y: e.clientY })}
                        >
                          {evt.title}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className={styles.body}>
          <TimeColumn />

          <div className={styles.daysGrid}>
            {weekDays.map((day, dayIdx) => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const isToday = dateStr === todayStr
              const timedEvents = getEventsForDate(dateStr).filter(e => !e.allDay)

              return (
                <div
                  key={dateStr}
                  className={styles.dayEventsCol}
                  ref={(el) => { colRefs.current[dayIdx] = el }}
                >
                  {HOURS.map((h) => (
                    <div
                      key={h}
                      className={styles.hourCell}
                      onClick={() => onSlotClick(`${String(h).padStart(2, '0')}:00`, dateStr)}
                    />
                  ))}

                  {isToday && (
                    <div ref={nowRef} className={styles.nowLine} style={{ top: `${nowMinutes}px` }} />
                  )}

                  {ghost && ghost.date === dateStr && (
                    <div
                      className={styles.eventGhost}
                      style={{ top: `${ghost.top}px`, height: `${ghost.height}px`, background: hexToRgba(ghost.color, 0.45) }}
                    />
                  )}

                  {(() => {
                    const layout = layoutTimedEvents(timedEvents)
                    return timedEvents.map((evt) => {
                      const start = timeToMinutes(evt.startTime)
                      const end = timeToMinutes(evt.endTime)
                      const duration = Math.max(end - start, 30)
                      const color = getEventColor(evt.calendarId)
                      const { col, totalCols } = layout.get(evt.id) ?? { col: 0, totalCols: 1 }
                      const gap = 2
                      const pct = 100 / totalCols
                      const left = `calc(${col * pct}% + ${gap / 2}px)`
                      const width = `calc(${pct}% - ${gap}px)`

                      return (
                        <div
                          key={evt.id}
                          className={classNames(styles.event, { [styles.eventDone]: evt.isDone })}
                          style={{ top: `${start}px`, height: `${duration}px`, left, width, background: hexToRgba(color, 0.3) }}
                          onMouseDown={(e) => { hideTooltip(); handleEventMouseDown(e, evt) }}
                          onMouseEnter={(e) => showTooltip(evt, e.clientX, e.clientY)}
                          onMouseLeave={hideTooltip}
                        >
                          <div className={styles.eventBorder} style={{ background: color }} />
                          <span className={styles.eventTitle}>{evt.title}</span>
                          <span className={styles.eventTime}>
                            {formatEventTime(evt.startTime)} - {formatEventTime(evt.endTime)}
                          </span>
                        </div>
                      )
                    })
                  })()}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {tooltip && <EventTooltip tooltip={tooltip} />}
    </>
  )
}

export default WeekView
