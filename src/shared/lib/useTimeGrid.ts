import { useRef, useState, useEffect } from 'react'
import type { CalendarEvent } from '../../entities/calendar'
import { getNowMinutes } from './timeUtils'


export type Tooltip = { evt: CalendarEvent; x: number; y: number }

export type DragState = {
  evt: CalendarEvent
  offsetMin: number
  duration: number
  color: string
  moved: boolean
}

export type Ghost = { top: number; height: number; color: string; date?: string }

export const HOURS = Array.from({ length: 24 }, (_, i) => i)

export const useTimeGrid = () => {
  const nowRef = useRef<HTMLDivElement>(null)
  const [nowMinutes, setNowMinutes] = useState(getNowMinutes)
  const [ghost, setGhost] = useState<Ghost | null>(null)
  const [tooltip, setTooltip] = useState<Tooltip | null>(null)
  const tooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dragRef = useRef<DragState | null>(null)

  const showTooltip = (evt: CalendarEvent, x: number, y: number) => {
    tooltipTimer.current = setTimeout(() => setTooltip({ evt, x, y }), 400)
  }

  const hideTooltip = () => {
    if (tooltipTimer.current) clearTimeout(tooltipTimer.current)
    setTooltip(null)
  }

  useEffect(() => {
    const id = setInterval(() => setNowMinutes(getNowMinutes()), 60_000)
    return () => clearInterval(id)
  }, [])

  return { nowRef, nowMinutes, ghost, setGhost, tooltip, showTooltip, hideTooltip, dragRef }
}
