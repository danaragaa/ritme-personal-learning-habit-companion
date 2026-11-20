/**
 * Returns a consistent local date string in YYYY-MM-DD format.
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Parses a local YYYY-MM-DD string safely at local noon to avoid UTC midnight shift.
 */
export function parseLocalDateString(dateStr: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim())
  if (match) {
    const year = Number(match[1])
    const month = Number(match[2]) - 1
    const day = Number(match[3])
    return new Date(year, month, day, 12, 0, 0, 0)
  }
  return new Date(dateStr)
}

/**
 * Returns the Monday local date string (YYYY-MM-DD) for the week containing `date`.
 * Matches the Monday–Sunday weekly study cycle used across RITME.
 */
export function getLocalWeekStartDateString(date: Date = new Date()): string {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0)
  const day = d.getDay() // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const diffToMonday = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diffToMonday)
  return getLocalDateString(d)
}

/**
 * Checks whether an ISO timestamp or YYYY-MM-DD local date falls inside the current Monday–Sunday local week.
 */
export function isDateInCurrentLocalWeek(
  dateInput: string,
  refDate: Date = new Date()
): boolean {
  if (!dateInput) return false
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(dateInput.trim())
    ? parseLocalDateString(dateInput)
    : new Date(dateInput)
  if (Number.isNaN(parsed.getTime())) return false
  return getLocalWeekStartDateString(parsed) === getLocalWeekStartDateString(refDate)
}

/**
 * Formats a Date or ISO string into a readable localized date.
 */
export function formatDisplayDate(
  dateInput: Date | string = new Date(),
  locale: 'id' | 'en' = 'id'
): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  return new Intl.DateTimeFormat(locale === 'id' ? 'id-ID' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}
