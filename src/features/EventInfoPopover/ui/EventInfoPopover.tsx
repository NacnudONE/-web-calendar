import React, { useEffect, useRef } from 'react'
import { Pencil, Trash2, X } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import type { CalendarEvent, Calendar } from '../../../entities/calendar'
import { useCalendarStore } from '../../../entities/calendar'
import classNames from 'classnames'
import { formatEventTime, DEFAULT_CALENDAR_COLOR, useClickOutside } from '../../../shared/lib'
import styles from './EventInfoPopover.module.scss'

interface Props {
  event: CalendarEvent
  calendar?: Calendar
  pos: { x: number; y: number }
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}

export const EventInfoPopover = ({ event, calendar, pos, onClose, onEdit, onDelete }: Props) => {
  const ref = useRef<HTMLDivElement>(null)
  const { toggleEventDone } = useCalendarStore()

  useClickOutside(ref, onClose)

  useEffect(() => {
    if (!ref.current) return
    const el = ref.current
    const { innerWidth, innerHeight } = window
    const rect = el.getBoundingClientRect()
    let x = pos.x + 12
    let y = pos.y - 12
    if (x + rect.width > innerWidth - 16) x = pos.x - rect.width - 12
    if (y + rect.height > innerHeight - 16) y = innerHeight - rect.height - 16
    if (y < 16) y = 16
    el.style.left = `${x}px`
    el.style.top  = `${y}px`
  }, [pos])

  return (
    <div ref={ref} className={styles.popover} style={{ left: pos.x + 12, top: pos.y - 12 }}>
      <div className={styles.header}>
        <button className={styles.iconBtn} title="Редагувати" onClick={onEdit}>
          <Pencil size={15} />
        </button>
        <button className={classNames(styles.iconBtn, styles.iconBtnDelete)} title="Видалити" onClick={onDelete}>
          <Trash2 size={15} />
        </button>
        <button className={styles.iconBtn} title="Закрити" onClick={onClose}>
          <X size={14} />
        </button>
      </div>

      <div className={styles.body}>
        <div className={styles.colorBar}>
          <div className={styles.dot} style={{ background: calendar?.color ?? DEFAULT_CALENDAR_COLOR }} />
          <div className={styles.info}>
            <span className={classNames(styles.title, { [styles.titleDone]: event.isDone })}>
              {event.title}
            </span>
            <span className={styles.time}>
              {format(parseISO(event.date), 'EEEE, MMMM d')} · {event.allDay ? 'All day' : `${formatEventTime(event.startTime)} – ${formatEventTime(event.endTime)}`}
            </span>
            {calendar && <span className={styles.calName}>{calendar.name}</span>}
            {event.description && <span className={styles.description}>{event.description}</span>}
          </div>
        </div>

        {!event.isDone && (
          <button
            className={styles.doneBtn}
            onClick={() => toggleEventDone(event.id)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Done
          </button>
        )}
      </div>
    </div>
  )
}
