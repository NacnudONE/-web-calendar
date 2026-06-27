// час у рядку → хвилини
export const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

// хвилини → час у рядку
export const minutesToTime = (m: number): string =>
  `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`

// округлює до найближчих 15 хвилин
export const snap15 = (m: number): number => Math.round(m / 15) * 15

// поточний час у хвилинах
export const getNowMinutes = (): number => {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}
