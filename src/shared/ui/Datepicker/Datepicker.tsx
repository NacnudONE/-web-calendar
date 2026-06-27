import React from 'react'
import styles from './Datepicker.module.scss'

type DatepickerProps = {
  value: string
  onChange: (date: string) => void
  label?: string
}

export const Datepicker = ({ value, onChange, label }: DatepickerProps) => {
  return (
    <div className={styles.datepickerContainer}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.inputWrapper}>
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={styles.input}
        />
      </div>
    </div>
  )
}
