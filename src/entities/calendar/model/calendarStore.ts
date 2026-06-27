import { create } from 'zustand'
import { format, parseISO, getDay, getDate } from 'date-fns'
import {
  collection, doc, setDoc, deleteDoc, updateDoc, onSnapshot,
} from 'firebase/firestore'
import { db } from '../../../shared/firebase'
import { DEFAULT_CALENDAR_COLOR } from '../../../shared/lib'
import type { Calendar, CalendarEvent } from './types'

const matchesRecurring = (evt: CalendarEvent, date: string): boolean => {
  if (!evt.repeat || evt.repeat === 'none') return false
  if (date <= evt.date) return false

  const evtDay = parseISO(evt.date)
  const tgtDay = parseISO(date)

  switch (evt.repeat) {
    case 'daily':
    case 'daytime':
      return true
    case 'weekly':
      return getDay(tgtDay) === getDay(evtDay)
    case 'monthly':
      return getDate(tgtDay) === getDate(evtDay)
    case 'weekdays':
      return getDay(tgtDay) >= 1 && getDay(tgtDay) <= 5
    default:
      return false
  }
}

const DEFAULT_CALENDAR: Calendar = {
  id: 'default',
  name: 'My Calendar',
  color: DEFAULT_CALENDAR_COLOR,
  isDefault: true,
  isVisible: true,
}

interface CalendarStore {
  currentDay: string
  calendars: Calendar[]
  events: CalendarEvent[]
  uid: string | null
  _unsubCalendars: (() => void) | null
  _unsubEvents: (() => void) | null

  setCurrentDay: (date: string) => void

  initializeForUser: (uid: string) => void
  cleanup: () => void

  addCalendar: (calendar: Calendar) => void
  removeCalendar: (id: string) => void
  updateCalendar: (id: string, updates: Partial<Calendar>) => void

  addEvent: (event: CalendarEvent) => void
  removeEvent: (id: string) => void
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void
  getEventsForCurrentDay: () => CalendarEvent[]
  getEventsForDate: (date: string) => CalendarEvent[]
  getEventColor: (calendarId: string) => string
  toggleEventDone: (id: string) => void
}

export const useCalendarStore = create<CalendarStore>()((set, get) => ({
  currentDay: format(new Date(), 'yyyy-MM-dd'),
  calendars: [],
  events: [],
  uid: null,
  _unsubCalendars: null,
  _unsubEvents: null,

  setCurrentDay: (date) => set({ currentDay: date }),

  initializeForUser: (uid) => {
    get()._unsubCalendars?.()
    get()._unsubEvents?.()

    set({ uid })

    const calsRef = collection(db, 'users', uid, 'calendars')
    const eventsRef = collection(db, 'users', uid, 'events')

    let firstCalsSnap = true

    const unsubCalendars = onSnapshot(calsRef, (snapshot) => {
      const calendars = snapshot.docs.map(d => d.data() as Calendar)
      if (firstCalsSnap && calendars.length === 0) {
        setDoc(doc(db, 'users', uid, 'calendars', DEFAULT_CALENDAR.id), DEFAULT_CALENDAR)
      }
      firstCalsSnap = false
      set({ calendars })
    })

    const unsubEvents = onSnapshot(eventsRef, (snapshot) => {
      set({ events: snapshot.docs.map(d => d.data() as CalendarEvent) })
    })

    set({ _unsubCalendars: unsubCalendars, _unsubEvents: unsubEvents })
  },

  cleanup: () => {
    get()._unsubCalendars?.()
    get()._unsubEvents?.()
    set({ calendars: [], events: [], uid: null, _unsubCalendars: null, _unsubEvents: null })
  },

  addCalendar: (calendar) => {
    const { uid } = get()
    if (!uid) return
    setDoc(doc(db, 'users', uid, 'calendars', calendar.id), calendar)
  },

  removeCalendar: (id) => {
    const { uid } = get()
    if (!uid) return
    deleteDoc(doc(db, 'users', uid, 'calendars', id))
  },

  updateCalendar: (id, updates) => {
    const { uid } = get()
    if (!uid) return
    updateDoc(doc(db, 'users', uid, 'calendars', id), updates as Record<string, unknown>)
  },

  addEvent: (event) => {
    const { uid } = get()
    if (!uid) return
    setDoc(doc(db, 'users', uid, 'events', event.id), event)
  },

  removeEvent: (id) => {
    const { uid } = get()
    if (!uid) return
    deleteDoc(doc(db, 'users', uid, 'events', id))
  },

  updateEvent: (id, updates) => {
    const { uid, events } = get()
    if (!uid) return
    set({ events: events.map(e => e.id === id ? { ...e, ...updates } : e) })
    updateDoc(doc(db, 'users', uid, 'events', id), updates as Record<string, unknown>)
  },

  toggleEventDone: (id) => {
    const { uid, events } = get()
    if (!uid) return
    const evt = events.find(e => e.id === id)
    if (!evt) return
    updateDoc(doc(db, 'users', uid, 'events', id), { isDone: !evt.isDone })
  },

  getEventsForCurrentDay: () => get().getEventsForDate(get().currentDay),

  getEventColor: (calendarId) =>
    get().calendars.find(c => c.id === calendarId)?.color ?? DEFAULT_CALENDAR_COLOR,

  getEventsForDate: (date) => {
    const { calendars, events } = get()
    return events.flatMap((evt) => {
      const cal = calendars.find((c) => c.id === evt.calendarId)
      if (cal?.isVisible === false) return []
      if (evt.date === date) return [evt]
      if (matchesRecurring(evt, date)) return [{ ...evt, date }]
      return []
    })
  },
}))
