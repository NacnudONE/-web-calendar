import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'
import type { CalendarEvent } from '../../entities/calendar'
import { timeToMinutes } from './timeUtils'

export const buildMonthGrid = (date: Date): Date[] =>
  eachDayOfInterval({
    start: startOfWeek(startOfMonth(date), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(date), { weekStartsOn: 1 }),
  })

// розраховує колонки для подій що перекриваються
export const layoutTimedEvents = (events: CalendarEvent[]): Map<string, { col: number; totalCols: number }> => {
  const result = new Map<string, { col: number; totalCols: number }>()
  for (const evt of events) {
    const evtStart = timeToMinutes(evt.startTime)
    const evtEnd = Math.max(evtStart + 30, timeToMinutes(evt.endTime))
    const overlapping = events
      .filter(other => {
        const os = timeToMinutes(other.startTime)
        const oe = Math.max(os + 30, timeToMinutes(other.endTime))
        return os < evtEnd && oe > evtStart
      })
      .sort((a, b) => {
        const diff = timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
        return diff !== 0 ? diff : a.id.localeCompare(b.id)
      })
    result.set(evt.id, { col: overlapping.findIndex(o => o.id === evt.id), totalCols: overlapping.length })
  }
  return result
}
