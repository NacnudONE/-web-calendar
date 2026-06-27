import React from 'react'
import { HOURS } from '../../lib/useTimeGrid'
import { formatHour } from '../../lib'
import styles from './TimeColumn.module.scss'

export const TimeColumn = () => (
  <div className={styles.timeCol}>
    {HOURS.map((h) => (
      <div key={h} className={styles.timeCell}>
        <span>{formatHour(h)}</span>
      </div>
    ))}
  </div>
)
