import React, { useState, useRef } from 'react'
import { format, parseISO, addDays, subDays, isToday } from 'date-fns'
import { uk } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, CalendarDays, List, LogOut } from 'lucide-react'
import { useCalendarStore } from '../entities/calendar'
import type { CalendarEvent } from '../entities/calendar'
import { useAuthStore } from '../features/auth'
import { useClickOutside } from '../shared/lib'
import EventModal from '../features/EventModal'
import styles from './MobileApp.module.scss'

const MobileApp = () => {
  const { currentDay, setCurrentDay, calendars, getEventsForDate, updateCalendar } = useCalendarStore()
  const { user, logout } = useAuthStore()
  const [tab, setTab] = useState<'day' | 'calendars'>('day')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useClickOutside(menuRef, () => setMenuOpen(false), menuOpen)

  const date = parseISO(currentDay)
  const events = getEventsForDate(currentDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  const openCreate = () => {
    setEditingEvent(undefined)
    setModalOpen(true)
  }

  const openEdit = (event: CalendarEvent) => {
    setEditingEvent(event)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingEvent(undefined)
  }

  const goToPrev = () => setCurrentDay(format(subDays(date, 1), 'yyyy-MM-dd'))
  const goToNext = () => setCurrentDay(format(addDays(date, 1), 'yyyy-MM-dd'))
  const goToToday = () => setCurrentDay(format(new Date(), 'yyyy-MM-dd'))

  const dateLabel = isToday(date)
    ? `Сьогодні, ${format(date, 'd MMMM', { locale: uk })}`
    : format(date, 'EEEE, d MMMM yyyy', { locale: uk })

  return (
    <div className={styles.app}>

      {/* ── Header ─────────────────────────────────── */}
      <header className={styles.header}>
        <span className={styles.logo}>WebCalendar</span>
        <div className={styles.headerRight}>
          {!isToday(date) && (
            <button className={styles.todayBtn} onClick={goToToday}>Сьогодні</button>
          )}
          <div className={styles.userWrap} ref={menuRef}>
            <button className={styles.avatar} onClick={() => setMenuOpen(o => !o)}>
              {user?.picture
                ? <img src={user.picture} alt={user.name} className={styles.avatarImg} />
                : <span className={styles.avatarLetter}>{user?.name?.[0]?.toUpperCase() ?? 'U'}</span>}
            </button>
            {menuOpen && (
              <div className={styles.userMenu}>
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{user?.name}</span>
                  <span className={styles.userEmail}>{user?.email}</span>
                </div>
                <button className={styles.logoutBtn} onClick={() => logout()}>
                  <LogOut size={16} />
                  Вийти
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Навігація по днях ───────────────────────── */}
      <div className={styles.dateNav}>
        <button className={styles.navArrow} onClick={goToPrev}>
          <ChevronLeft size={20} />
        </button>
        <span className={styles.dateLabel}>{dateLabel}</span>
        <button className={styles.navArrow} onClick={goToNext}>
          <ChevronRight size={20} />
        </button>
      </div>

      {/* ── Головний контент ───────────────────────── */}
      <main className={styles.main}>

        {tab === 'day' && (
          <>
            {events.length === 0 ? (
              <div className={styles.empty}>Немає подій на цей день</div>
            ) : (
              <div className={styles.eventList}>
                {events.map(event => {
                  const cal = calendars.find(c => c.id === event.calendarId)
                  return (
                    <div key={event.id} className={styles.eventCard} style={{ borderLeftColor: cal?.color ?? '#ccc' }} onClick={() => openEdit(event)}>
                      <span className={styles.eventTime}>
                        {event.allDay ? 'Весь день' : `${event.startTime} – ${event.endTime}`}
                      </span>
                      <span className={styles.eventTitle} style={{ textDecoration: event.isDone ? 'line-through' : 'none' }}>
                        {event.title}
                      </span>
                      {event.description && (
                        <span className={styles.eventDesc}>{event.description}</span>
                      )}
                      <span className={styles.eventCalendar}>{cal?.name}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {tab === 'calendars' && (
          <div className={styles.calendarList}>
            {calendars.map(cal => (
              <div
                key={cal.id}
                className={`${styles.calendarItem} ${cal.isVisible === false ? styles.calendarItemHidden : ''}`}
                onClick={() => updateCalendar(cal.id, { isVisible: cal.isVisible === false })}
              >
                <span
                  className={styles.calDot}
                  style={{
                    background: cal.isVisible === false ? 'transparent' : cal.color,
                    border: `2px solid ${cal.color}`,
                  }}
                />
                <span className={styles.calName}>{cal.name}</span>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* ── Нижня навігація ────────────────────────── */}
      <nav className={styles.navBar}>
        <button
          className={`${styles.navItem} ${tab === 'day' ? styles.navItemActive : ''}`}
          onClick={() => setTab('day')}
        >
          <List size={20} />
          <span>Події</span>
        </button>
        <button className={styles.navItemCenter} onClick={openCreate}>
          <Plus size={24} />
        </button>
        <button
          className={`${styles.navItem} ${tab === 'calendars' ? styles.navItemActive : ''}`}
          onClick={() => setTab('calendars')}
        >
          <CalendarDays size={20} />
          <span>Календарі</span>
        </button>
      </nav>

      {modalOpen && (
        <EventModal
          date={editingEvent?.date ?? currentDay}
          event={editingEvent}
          onClose={closeModal}
        />
      )}

    </div>
  )
}

export default MobileApp
