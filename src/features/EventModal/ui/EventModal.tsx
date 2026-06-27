import React, { useState, useRef } from 'react'
import { useClickOutside } from '../../../shared/lib'
import { format, parseISO } from 'date-fns'
import { useCalendarStore } from '../../../entities/calendar'
import type { CalendarEvent, RepeatRule } from '../../../entities/calendar'
import { Modal, Button, Input, Checkbox, Select, MiniCalendar, TimePicker } from '../../../shared/ui'
import styles from './EventModal.module.scss'

interface Props {
  date: string;
  event?: CalendarEvent;
  defaultTime?: string;
  onClose: () => void;
}

const EventModal = ({ date, event, defaultTime, onClose }: Props) => {
  const { calendars, addEvent, updateEvent, removeEvent, currentDay } = useCalendarStore()

  const defaultEnd = defaultTime
    ? `${String((Number(defaultTime.split(':')[0]) + 1) % 24).padStart(2, '0')}:00`
    : '10:00'

  const [title, setTitle] = useState(event?.title ?? '')
  const [description, setDescription] = useState(event?.description ?? '')
  const [startTime, setStartTime] = useState(event?.startTime ?? defaultTime ?? '09:00')
  const [endTime, setEndTime] = useState(event?.endTime ?? defaultEnd)
  const [calendarId, setCalendarId] = useState(event?.calendarId ?? calendars[0]?.id ?? '')
  const [allDay, setAllDay] = useState(event?.allDay ?? false)
  const [repeat, setRepeat] = useState<RepeatRule>(event?.repeat ?? 'none')
  const [userEditedEnd, setUserEditedEnd] = useState(false)
  const [selectedDate, setSelectedDate] = useState(date || currentDay)
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const datePickerRef = useRef<HTMLDivElement>(null)

  useClickOutside(datePickerRef, () => setDatePickerOpen(false), datePickerOpen)


  function addOneHour(time: string): string {
    const [h, m] = time.split(':').map(Number)
    const total = (h * 60 + m + 60) % (24 * 60)
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
  }

  function handleStartTimeChange(val: string) {
    setStartTime(val)
    if (!userEditedEnd) setEndTime(addOneHour(val))
  }

  function handleEndTimeChange(val: string) {
    setEndTime(val)
    setUserEditedEnd(true)
  }

  const isEdit = !!event
  const displayDate = format(parseISO(selectedDate), 'EEEE, MMMM d')
  const dayName = format(parseISO(selectedDate), 'EEEE')
  const dateNum = format(parseISO(selectedDate), 'd')

  function fmtTime(t: string) {
    const [h, m] = t.split(':').map(Number)
    const s = h < 12 ? 'am' : 'pm'
    const hr = h % 12 || 12
    return `${hr}:${String(m).padStart(2, '0')} ${s}`
  }

  const repeatOptions = [
    { value: 'none',      label: 'Does not repeat' },
    { value: 'daily',     label: 'Daily' },
    { value: 'weekly',    label: `Weekly on ${dayName}` },
    { value: 'monthly',   label: `Monthly on the ${dateNum}` },
    { value: 'weekdays',  label: 'Every weekday (Monday to Friday)' },
    { value: 'daytime',   label: `Every day at ${fmtTime(startTime)}` },
  ]
  const selectedCal = calendars.find((c) => c.id === calendarId)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!title.trim()) return

    if (isEdit) {
      updateEvent(event.id, {
        title,
        description,
        date: selectedDate,
        startTime: allDay ? '00:00' : startTime,
        endTime: allDay ? '23:59' : endTime,
        calendarId,
        allDay,
        repeat,
      })
    } else {
      addEvent({
        id: crypto.randomUUID(),
        title,
        description,
        date: selectedDate,
        startTime: allDay ? '00:00' : startTime,
        endTime: allDay ? '23:59' : endTime,
        calendarId,
        allDay,
        repeat,
      })
    }
    onClose()
  }

  return (
    <Modal isOpen title={isEdit ? 'Edit event' : 'Create event'} onClose={onClose}>
      <form className={styles.form} onSubmit={handleSubmit}>

        {/* Title */}
        <div className={styles.fieldRow}>
          <span className={styles.icon}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <text x="1" y="13" fontSize="14" fontWeight="700" fill="#6b7280" fontFamily="Inter, sans-serif">T</text>
            </svg>
          </span>
          <div className={styles.inputField}>
            <Input
              bare
              label="Title"
              className={styles.input}
              placeholder="Enter title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* Date + Time */}
        <div className={styles.fieldRow}>
          <span className={styles.icon}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8.5" r="6" stroke="#6b7280" strokeWidth="1.2"/>
              <path d="M8 5.5V8.5L10 10.5" stroke="#6b7280" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <div className={styles.dateTimeGroup}>
            <div className={styles.inputField} style={{ flex: 1 }}>
              <label className={styles.label}>Date</label>
              <button
                type="button"
                className={styles.dateText}
                onClick={() => setDatePickerOpen(o => !o)}
              >
                {displayDate}
              </button>
              {datePickerOpen && (
                <div className={styles.datePicker} ref={datePickerRef}>
                  <MiniCalendar
                    value={selectedDate}
                    onChange={(d) => { setSelectedDate(d); setDatePickerOpen(false) }}
                  />
                </div>
              )}
            </div>
            {!allDay && (
              <>
                <div className={styles.inputField} style={{ flex: '0 0 100px' }}>
                  <label className={styles.label}>Time</label>
                  <TimePicker value={startTime} onChange={handleStartTimeChange} />
                </div>
                <span className={styles.timeDash}>–</span>
                <div className={styles.inputField} style={{ flex: '0 0 100px' }}>
                  <label className={styles.label} style={{ visibility: 'hidden' }}>Time</label>
                  <TimePicker value={endTime} onChange={handleEndTimeChange} />
                </div>
              </>
            )}
          </div>
        </div>

        {/* All day + Does not repeat */}
        <div className={styles.allDayRow}>
          <Checkbox
            checked={allDay}
            onChange={(e) => setAllDay(e.target.checked)}
            label="All day"
          />
          <div className={styles.repeatField}>
            <Select
              bare
              className={styles.repeatSelect}
              value={repeat}
              onChange={(e) => setRepeat(e.target.value as RepeatRule)}
            >
              {repeatOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={styles.chevron}>
              <path d="M4 6l4 4 4-4" stroke="#6b7280" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Calendar */}
        <div className={styles.fieldRow}>
          <span className={styles.icon}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1.5" y="2.5" width="13" height="12" rx="1.5" stroke="#6b7280" strokeWidth="1.2"/>
              <path d="M1.5 6.5h13" stroke="#6b7280" strokeWidth="1.2"/>
              <path d="M5 1.5v2M11 1.5v2" stroke="#6b7280" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </span>
          <div className={styles.inputField}>
            <label className={styles.label}>Calendar</label>
            <div className={styles.calRow}>
              <span className={styles.calDot} style={{ background: selectedCal?.color }} />
              <Select
                bare
                className={styles.calSelect}
                value={calendarId}
                onChange={(e) => setCalendarId(e.target.value)}
              >
                {calendars.map((cal) => (
                  <option key={cal.id} value={cal.id}>{cal.name}</option>
                ))}
              </Select>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={styles.chevron}>
                <path d="M4 6l4 4 4-4" stroke="#6b7280" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className={styles.fieldRow}>
          <span className={styles.icon}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4.5h12M2 8h12M2 11.5h8" stroke="#6b7280" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </span>
          <div className={styles.inputField}>
            <Input
              bare
              label="Description"
              className={styles.input}
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          {isEdit && (
            <Button variant="error" onClick={() => { removeEvent(event.id); onClose() }}>
              Delete
            </Button>
          )}
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Modal>
  )
}

export default EventModal
