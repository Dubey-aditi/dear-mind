// Intl is built into every browser — no date library needed for this.
// { numeric: 'auto' } is what turns "1 day ago" into the nicer "yesterday".
const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY

/** "just now", "5 minutes ago", "yesterday", or a date once it's over a week old. */
export function formatRelative(timestamp: number): string {
  const elapsed = Date.now() - timestamp

  if (elapsed < MINUTE) return 'just now'
  // Intl expects negative numbers for the past, hence the minus signs.
  if (elapsed < HOUR) return relative.format(-Math.floor(elapsed / MINUTE), 'minute')
  if (elapsed < DAY) return relative.format(-Math.floor(elapsed / HOUR), 'hour')
  if (elapsed < WEEK) return relative.format(-Math.floor(elapsed / DAY), 'day')

  return formatShortDate(timestamp)
}

/** "12 Sep" — compact enough for the corner of a note card. */
export function formatShortDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  })
}
