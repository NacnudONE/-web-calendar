import React, { useEffect } from 'react'
import classNames from 'classnames'
import { format, parseISO } from 'date-fns'
import type { CalendarEvent } from '../../../entities/calendar'
import { useCalendarStore } from '../../../entities/calendar'
import { timeToMinutes, minutesToTime, snap15, formatEventTime, hexToRgba, layoutTimedEvents } from '../../../shared/lib'
import { useTimeGrid, HOURS } from '../../../shared/lib/useTimeGrid'
import { TimeColumn, EventTooltip } from '../../../shared/ui'
import styles from './DayView.module.scss'

interface Props {
  onEventClick: (event: CalendarEvent, pos: { x: number; y: number }) => void
  onSlotClick: (time: string) => void
  onEventMove: (id: string, startTime: string, endTime: string) => void
}

export const DayView = ({ onEventClick, onSlotClick, onEventMove }: Props) => {
  const { getEventsForCurrentDay, getEventColor, currentDay } = useCalendarStore()
  const events = getEventsForCurrentDay()
  const { nowRef, nowMinutes, ghost, setGhost, tooltip, showTooltip, hideTooltip, dragRef } = useTimeGrid()

  const dayNum = format(parseISO(currentDay), 'd')
  const dayName = format(parseISO(currentDay), 'EEE').toUpperCase()
  const isToday = currentDay === format(new Date(), 'yyyy-MM-dd')

  useEffect(() => {
    if (isToday) nowRef.current?.scrollIntoView({ block: 'center' })
  }, [isToday])

  const handleEventMouseDown = (e: React.MouseEvent, evt: CalendarEvent) => {
    e.preventDefault()

    const col = document.querySelector<HTMLDivElement>(`.${styles.eventsCol}`)
    if (!col) return

    const color = getEventColor(evt.calendarId)
    const startMin = timeToMinutes(evt.startTime)
    const endMin = timeToMinutes(evt.endTime)
    const duration = Math.max(endMin - startMin, 15)
    const colRect = col.getBoundingClientRect()
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
      const rect = col.getBoundingClientRect()
      const newTop = Math.max(0, Math.min(snap15(me.clientY - rect.top - d.offsetMin), 1440 - d.duration))
      setGhost({ top: newTop, height: d.duration, color: d.color })
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
      const rect = col.getBoundingClientRect()
      const newStart = Math.max(0, Math.min(snap15(ue.clientY - rect.top - d.offsetMin), 1440 - d.duration))
      onEventMove(d.evt.id, minutesToTime(newStart), minutesToTime(newStart + d.duration))
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  const allDayEvents = events.filter(e => e.allDay)
  const timedEvents = events.filter(e => !e.allDay)

  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <div className={styles.headerOffset} />
          <div className={styles.dayHeader}>
            <div className={classNames(styles.dayBadge, { [styles.dayBadgeToday]: isToday })}>
              <span className={styles.dayNum}>{dayNum}</span>
              <span className={styles.dayName}>{dayName}</span>
            </div>
          </div>
        </div>

        {allDayEvents.length > 0 && (
          <div className={styles.allDayRow}>
            <div className={styles.allDayLabel}>All day</div>
            <div className={styles.allDayEvents}>
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
          </div>
        )}

        <div className={styles.dayView}>
          <TimeColumn />

          <div className={styles.eventsCol}>
            {HOURS.map((h) => (
              <div
                key={h}
                className={styles.hourCell}
                onClick={() => onSlotClick(`${String(h).padStart(2, '0')}:00`)}
              />
            ))}

            {isToday && (
              <div ref={nowRef} className={styles.nowLine} style={{ top: `${nowMinutes}px` }} />
            )}

            {ghost && (
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
                const gap = 4
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
        </div>
      </div>

      {tooltip && <EventTooltip tooltip={tooltip} />}
    </>
  )
}

export default DayView
