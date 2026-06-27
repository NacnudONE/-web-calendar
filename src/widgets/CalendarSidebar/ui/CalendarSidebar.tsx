import React, { useState } from 'react'
import classNames from 'classnames'
import { useCalendarStore } from '../../../entities/calendar'
import type { Calendar } from '../../../entities/calendar'
import { MiniCalendar, Button, IconButton } from '../../../shared/ui'
import CalendarModal from '../../../features/CalendarModal'
import DeleteCalendarModal from '../../../features/DeleteCalendarModal'
import styles from './CalendarSidebar.module.scss'

interface Props {
  onCreateClick: () => void;
}

const ColorCheck = ({ color, checked, onChange }: { color: string; checked: boolean; onChange: () => void }) => {
  return (
    <IconButton
      className={styles.colorCheck}
      style={{ background: checked ? color : 'transparent', border: `2px solid ${color}` }}
      onClick={(e) => { e.stopPropagation(); onChange() }}
      title={checked ? 'Hide calendar' : 'Show calendar'}
    >
      {checked && (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </IconButton>
  )
}

const CalendarSidebar = ({ onCreateClick }: Props) => {
  const { currentDay, setCurrentDay, calendars, addCalendar, updateCalendar, removeCalendar } = useCalendarStore()
  const [editingCal, setEditingCal] = useState<Calendar | undefined>()
  const [deletingCal, setDeletingCal] = useState<Calendar | undefined>()
  const [showCreate, setShowCreate] = useState(false)

  const handleSave = (name: string, color: string) => {
    if (editingCal) {
      updateCalendar(editingCal.id, { name, color })
      setEditingCal(undefined)
    } else {
      addCalendar({ id: crypto.randomUUID(), name, color, isDefault: false, isVisible: true })
      setShowCreate(false)
    }
  }

  return (
    <div className={styles.sidebar}>
      <Button
        className={styles.createBtn}
        onClick={onCreateClick}
        icon={
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v10M1 6h10" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        }
      >
        Create
      </Button>

      <div className={styles.datepickerWrap}>
        <MiniCalendar value={currentDay} onChange={setCurrentDay} />
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>My calendars</span>
          <IconButton className={styles.addBtn} onClick={() => setShowCreate(true)} title="Add calendar">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v10M1 6h10" stroke="#323749" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </IconButton>
        </div>

        <ul className={styles.list}>
          {calendars.map((cal) => (
            <li key={cal.id} className={styles.item}>
              <ColorCheck
                color={cal.color}
                checked={cal.isVisible}
                onChange={() => updateCalendar(cal.id, { isVisible: !cal.isVisible })}
              />
              <span className={styles.name} onClick={() => updateCalendar(cal.id, { isVisible: !cal.isVisible })}>{cal.name}</span>
              <div className={styles.itemActions}>
                {!cal.isDefault && (
                  <IconButton
                    className={classNames(styles.iconBtn, styles.iconBtnDelete)}
                    onClick={(e) => { e.stopPropagation(); setDeletingCal(cal) }}
                    title="Delete"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M1.5 3h9M4.5 3V2a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1M5 5.5v3M7 5.5v3M2.5 3l.5 7a.5.5 0 00.5.5h5a.5.5 0 00.5-.5l.5-7" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </IconButton>
                )}
                <IconButton
                  className={styles.iconBtn}
                  onClick={(e) => { e.stopPropagation(); setEditingCal(cal) }}
                  title="Edit"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M8.5 1.5a1.414 1.414 0 012 2L3.5 10.5l-3 .5.5-3 7.5-6.5z" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </IconButton>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {(showCreate || editingCal) && (
        <CalendarModal
          calendar={editingCal}
          onSave={handleSave}
          onClose={() => { setShowCreate(false); setEditingCal(undefined) }}
        />
      )}

      {deletingCal && (
        <DeleteCalendarModal
          calendarName={deletingCal.name}
          onConfirm={() => removeCalendar(deletingCal.id)}
          onClose={() => setDeletingCal(undefined)}
        />
      )}
    </div>
  )
}

export default CalendarSidebar
