import React from 'react'
import { useCalendarStore } from '../../../entities/calendar'
import { formatEventTime } from '../../lib'
import type { Tooltip } from '../../lib/useTimeGrid'
import styles from './EventTooltip.module.scss'

interface Props {
  tooltip: Tooltip
}

export const EventTooltip = ({ tooltip }: Props) => {
  const { calendars, getEventColor } = useCalendarStore()
  const cal = calendars.find(c => c.id === tooltip.evt.calendarId)
  const color = getEventColor(tooltip.evt.calendarId)

  return (
    <div className={styles.tooltip} style={{ left: tooltip.x + 14, top: tooltip.y + 10 }}>
      <div className={styles.tooltipDot} style={{ background: color }} />
      <div className={styles.tooltipBody}>
        <span className={styles.tooltipTitle}>{tooltip.evt.title}</span>
        <span className={styles.tooltipTime}>
          {tooltip.evt.allDay ? 'All day' : `${formatEventTime(tooltip.evt.startTime)} – ${formatEventTime(tooltip.evt.endTime)}`}
        </span>
        {tooltip.evt.description && (
          <span className={styles.tooltipDesc}>{tooltip.evt.description}</span>
        )}
        {cal && <span className={styles.tooltipCal}>{cal.name}</span>}
      </div>
    </div>
  )
}
