import React, { useState, useMemo, useRef } from 'react'
import { Search } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { useCalendarStore } from '../../../entities/calendar'
import type { CalendarEvent } from '../../../entities/calendar'
import { useClickOutside } from '../../../shared/lib'
import styles from './SearchBar.module.scss'

interface Props {
  onEventSelect: (event: CalendarEvent) => void
}

export const SearchBar = ({ onEventSelect }: Props) => {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const { events, calendars } = useCalendarStore()
  const wrapperRef = useRef<HTMLDivElement>(null)

  useClickOutside(wrapperRef, () => setOpen(false), open)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return events
      .filter(e => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q))
      .slice(0, 8)
  }, [query, events])

  const handleSelect = (event: CalendarEvent) => {
    onEventSelect(event)
    setQuery('')
    setOpen(false)
  }

  const handleChange = (e: { target: { value: string } }) => {
    setQuery(e.target.value)
    setOpen(true)
  }

  const showDropdown = open && query.trim().length > 0

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div className={styles.inputWrap}>
        <Search size={16} className={styles.icon} />
        <input
          className={styles.input}
          placeholder="Пошук подій..."
          value={query}
          onChange={handleChange}
          onFocus={() => query.trim() && setOpen(true)}
        />
        {query && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={() => { setQuery(''); setOpen(false) }}
          >
            ×
          </button>
        )}
      </div>

      {showDropdown && (
        <div className={styles.dropdown}>
          {results.length > 0 ? results.map(event => {
            const cal = calendars.find(c => c.id === event.calendarId)
            return (
              <button
                key={event.id}
                type="button"
                className={styles.item}
                onClick={() => handleSelect(event)}
              >
                <span className={styles.dot} style={{ background: cal?.color ?? '#ccc' }} />
                <span className={styles.title}>{event.title}</span>
                <span className={styles.date}>{format(parseISO(event.date), 'd MMM yyyy')}</span>
              </button>
            )
          }) : (
            <div className={styles.empty}>Нічого не знайдено</div>
          )}
        </div>
      )}
    </div>
  )
}
