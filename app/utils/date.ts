import type { EventItem } from '../types'

export const pad = (n: number): string => String(n).padStart(2, '0')

export const isoDate = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const parseISO = (str: string): Date => {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const getMonday = (d: Date): Date => {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const day = (date.getDay() + 6) % 7
  date.setDate(date.getDate() - day)
  return date
}

export const addDays = (d: Date, n: number): Date => {
  const date = new Date(d)
  date.setDate(date.getDate() + n)
  return date
}

export const formatFr = (d: Date, options: Intl.DateTimeFormatOptions): string =>
  new Intl.DateTimeFormat('fr-FR', options).format(d)

export const formatTimeRange = (start?: string, end?: string): string => {
  if (!start) return 'Horaire non précisé'
  return end ? `${start} – ${end}` : `À partir de ${start}`
}

/**
 * Generates an iCalendar (.ics) download for the event
 */
export const downloadIcs = (event: EventItem) => {
  const [year, month, day] = event.date.split('-').map(Number)
  const [startH, startM] = (event.start || '20:00').split(':').map(Number)
  
  let endH = startH + 2
  let endM = startM
  if (event.end) {
    const [eh, em] = event.end.split(':').map(Number)
    endH = eh
    endM = em
  }

  const dtStart = `${year}${pad(month)}${pad(day)}T${pad(startH)}${pad(startM)}00`
  const dtEnd = `${year}${pad(month)}${pad(day)}T${pad(endH)}${pad(endM)}00`

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CentraleSupelec//Com CS//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:comcs-${event.id}@centralesupelec.fr`,
    `SUMMARY:${event.title} (${event.asso})`,
    `DESCRIPTION:${(event.description || '').replace(/\n/g, '\\n')}`,
    `LOCATION:${event.place || 'CentraleSupélec'}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n')

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Creates Google Calendar URL
 */
export const getGoogleCalendarUrl = (event: EventItem): string => {
  const [year, month, day] = event.date.split('-').map(Number)
  const [startH, startM] = (event.start || '20:00').split(':').map(Number)
  
  let endH = startH + 2
  let endM = startM
  if (event.end) {
    const [eh, em] = event.end.split(':').map(Number)
    endH = eh
    endM = em
  }

  const startFormatted = `${year}${pad(month)}${pad(day)}T${pad(startH)}${pad(startM)}00`
  const endFormatted = `${year}${pad(month)}${pad(day)}T${pad(endH)}${pad(endM)}00`

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${event.title} · ${event.asso}`,
    dates: `${startFormatted}/${endFormatted}`,
    details: event.description || '',
    location: event.place || 'CentraleSupélec'
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
