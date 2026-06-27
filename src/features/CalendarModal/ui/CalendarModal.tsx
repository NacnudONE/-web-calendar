import classNames from 'classnames'
import React, { useState } from 'react'
import { Modal, Button, Input, IconButton } from '../../../shared/ui'
import type { Calendar } from '../../../entities/calendar'
import styles from './CalendarModal.module.scss'

const PALETTE = [
  '#ef4444', '#ec4899', '#f97316', '#eab308',
  '#84cc16', '#22c55e', '#14b8a6', '#3b82f6',
  '#8b5cf6', '#a855f7', '#6366f1', '#78716c',
]

interface Props {
  calendar?: Calendar;
  onSave: (name: string, color: string) => void;
  onClose: () => void;
}

const CalendarModal = ({ calendar, onSave, onClose }: Props) => {
  const [name, setName] = useState(calendar?.name ?? '')
  const [color, setColor] = useState(calendar?.color ?? PALETTE[0])

  const handleSubmit = () => {
    if (!name.trim()) return
    onSave(name.trim(), color)
    onClose()
  }

  return (
    <Modal
      isOpen
      title={calendar ? 'Edit calendar' : 'Create calendar'}
      onClose={onClose}
    >
      <div className={styles.form}>
        <div className={styles.field}>
          <span className={styles.icon}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <text x="1" y="13" fontSize="14" fontWeight="700" fill="#6b7280" fontFamily="Inter, sans-serif">T</text>
            </svg>
          </span>
          <div className={styles.fieldContent}>
            <Input
              bare
              label="Title"
              className={styles.input}
              placeholder="Enter title"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <div className={styles.colorSection}>
          <span className={styles.colorLabel}>Colour</span>
          <div className={styles.palette}>
            {PALETTE.map((c) => (
              <IconButton
                key={c}
                style={{
                  background: c,
                  border: `2px solid ${color === c ? '#323749' : 'transparent'}`,
                  transform: color === c ? 'scale(1.1)' : undefined,
                }}
                className={classNames(styles.colorBtn)}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>

        <div className={styles.actions}>
          <Button onClick={handleSubmit}>Save</Button>
        </div>
      </div>
    </Modal>
  )
}

export default CalendarModal
