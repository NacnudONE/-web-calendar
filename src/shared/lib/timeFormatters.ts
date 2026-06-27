// am/pm рядок → 24h формат
export const to24 = (value: string): string => {
  const val = value.trim().toLowerCase()
  const match = val.match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/)
  if (!match) return ''
  let h = parseInt(match[1])
  const m = parseInt(match[2])
  const suffix = match[3]
  if (suffix === 'pm' && h !== 12) h += 12
  if (suffix === 'am' && h === 12) h = 0
  if (h >= 0 && h < 24 && m >= 0 && m < 60)
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  return ''
}

// 24h формат → am/pm рядок для показу в TimePicker
export const toDisplay = (value: string): string => {
  const [h, m] = value.split(':').map(Number)
  if (isNaN(h) || isNaN(m)) return value
  const suffix = h < 12 ? 'am' : 'pm'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`
}

// мітка години для сітки календаря
export const formatHour = (h: number): string => {
  if (h === 0) return ''
  if (h < 12) return `${h} am`
  if (h === 12) return '12 pm'
  return `${h - 12} pm`
}

// час події для показу в UI
export const formatEventTime = (time: string): string => {
  const [h, m] = time.split(':').map(Number)
  const suffix = h < 12 ? 'am' : 'pm'
  const hour = h % 12 || 12
  return m === 0 ? `${hour}:00 ${suffix}` : `${hour}:${String(m).padStart(2, '0')} ${suffix}`
}
