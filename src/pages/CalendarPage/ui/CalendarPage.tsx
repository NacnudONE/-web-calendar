import React, { useState, useRef } from 'react'
import { addDays, subDays, addWeeks, subWeeks, addMonths, subMonths, format, parseISO } from 'date-fns'
import { useCalendarStore } from '../../../entities/calendar'
import { Header } from '../../../widgets/Header'
import type { ViewMode } from '../../../widgets/Header'
import CalendarSidebar from '../../../widgets/CalendarSidebar'
import DayView from '../../../widgets/DayView'
import { WeekView } from '../../../widgets/WeekView'
import { MonthView } from '../../../widgets/MonthView'
import EventModal from '../../../features/EventModal'
import { EventInfoPopover } from '../../../features/EventInfoPopover'
import type { CalendarEvent } from '../../../entities/calendar'
import styles from './CalendarPage.module.scss'

export const CalendarPage = () => {
  const { currentDay, setCurrentDay } = useCalendarStore()
  const [view, setView] = useState<ViewMode>('day')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>()
  const [defaultTime, setDefaultTime] = useState<string | undefined>()
  const [modalDate, setModalDate] = useState<string>(currentDay)
  const [popoverEvent, setPopoverEvent] = useState<CalendarEvent | undefined>()
  const [popoverPos, setPopoverPos] = useState({ x: 0, y: 0 })
  const popoverJustClosed = useRef(false)

  const date = parseISO(currentDay)
  const displayDate = view === 'month'
    ? format(date, 'MMMM yyyy')
    : format(date, 'MMMM d, yyyy')

  const goToPrev = () => {
    if (view === 'week') setCurrentDay(format(subWeeks(date, 1), 'yyyy-MM-dd'))
    else if (view === 'month') setCurrentDay(format(subMonths(date, 1), 'yyyy-MM-dd'))
    else setCurrentDay(format(subDays(date, 1), 'yyyy-MM-dd'))
  }

  const goToNext = () => {
    if (view === 'week') setCurrentDay(format(addWeeks(date, 1), 'yyyy-MM-dd'))
    else if (view === 'month') setCurrentDay(format(addMonths(date, 1), 'yyyy-MM-dd'))
    else setCurrentDay(format(addDays(date, 1), 'yyyy-MM-dd'))
  }

  const goToToday = () => setCurrentDay(format(new Date(), 'yyyy-MM-dd'))

  const openCreate = (time?: string, date?: string) => {
    if (popoverJustClosed.current) return
    setEditingEvent(undefined)
    setDefaultTime(time)
    setModalDate(date ?? currentDay)
    setModalOpen(true)
  }

  const openEdit = (event: CalendarEvent, pos?: { x: number; y: number }) => {
    setPopoverEvent(event)
    setPopoverPos(pos ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 })
  }

  const openEditModal = (event: CalendarEvent) => {
    setPopoverEvent(undefined)
    setEditingEvent(event)
    setDefaultTime(undefined)
    setModalDate(event.date)
    setModalOpen(true)
  }

  const handleEventSelect = (event: CalendarEvent) => {
    setCurrentDay(event.date)
    openEditModal(event)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingEvent(undefined)
    setDefaultTime(undefined)
  }

  return (
    <div className={styles.page}>
      <Header
        view={view}
        displayDate={displayDate}
        onViewChange={setView}
        onPrev={goToPrev}
        onNext={goToNext}
        onToday={goToToday}
        onEventSelect={handleEventSelect}
      />

      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <CalendarSidebar onCreateClick={() => openCreate()} />
        </aside>

        <main className={styles.main}>
          {view === 'day' && (
            <DayView
              onEventClick={(evt, pos) => openEdit(evt, pos)}
              onSlotClick={(time) => openCreate(time)}
              onEventMove={(id, startTime, endTime) =>
                useCalendarStore.getState().updateEvent(id, { startTime, endTime })
              }
            />
          )}
          {view === 'week' && (
            <WeekView
              onEventClick={(evt, pos) => openEdit(evt, pos)}
              onSlotClick={(time, date) => openCreate(time, date)}
              onEventMove={(id, date, startTime, endTime) =>
                useCalendarStore.getState().updateEvent(id, { date, startTime, endTime })
              }
            />
          )}
          {view === 'month' && (
            <MonthView
              onEventClick={(evt, pos) => openEdit(evt, pos)}
              onDayClick={(date) => { setView('day'); setCurrentDay(date) }}
            />
          )}
        </main>
      </div>

      {popoverEvent && (
        <EventInfoPopover
          event={popoverEvent}
          calendar={useCalendarStore.getState().calendars.find(c => c.id === popoverEvent.calendarId)}
          pos={popoverPos}
          onClose={() => {
            popoverJustClosed.current = true
            requestAnimationFrame(() => { popoverJustClosed.current = false })
            setPopoverEvent(undefined)
          }}
          onEdit={() => openEditModal(popoverEvent)}
          onDelete={() => {
            useCalendarStore.getState().removeEvent(popoverEvent.id)
            setPopoverEvent(undefined)
          }}
        />
      )}

      {modalOpen && (
        <EventModal
          date={modalDate}
          event={editingEvent}
          defaultTime={defaultTime}
          onClose={closeModal}
        />
      )}
    </div>
  )
}
