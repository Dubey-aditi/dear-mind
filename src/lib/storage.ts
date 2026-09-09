import type { Note } from '../types'
import { DEFAULT_NOTE_COLOR, isNoteColor } from './colors'

/**
 * The key everything is filed under in localStorage.
 *
 * The `v1` on the end is deliberate. If the shape of a Note ever changes in a
 * way old data can't satisfy, bumping this to v2 gives you a clean slate
 * instead of a crash — and the old data is still sitting there if you want to
 * write a migration for it.
 */
const STORAGE_KEY = 'dear-mind.notes.v1'

/** Whether the welcome screen has already been shown on this device. */
const WELCOME_KEY = 'dear-mind.welcomed.v1'

export function hasSeenWelcome(): boolean {
  try {
    return localStorage.getItem(WELCOME_KEY) === 'true'
  } catch {
    // Private mode: no memory, so the welcome shows every launch.
    // Mildly annoying beats crashing.
    return false
  }
}

export function markWelcomeSeen(): void {
  try {
    localStorage.setItem(WELCOME_KEY, 'true')
  } catch {
    // Nothing to do — worst case they see the welcome again next time.
  }
}

/**
 * Turn one unknown thing from storage into a Note — or `null` if it can't be.
 *
 * Two jobs in one function:
 *
 * 1. **Validation.** Anything in localStorage is just text, and it's text a
 *    user could have edited by hand. `JSON.parse` will happily hand back
 *    nonsense, and the crash comes later, mid-render, when something reads
 *    `.title` on a number. Checking here contains the damage.
 *
 * 2. **Migration.** `color` and `pinned` were added after the first notes were
 *    already saved. Old entries simply don't have them. Rather than throwing
 *    those notes away, we fill in a sensible default — so a note written
 *    before colours existed just becomes a Sky note.
 *
 * This is why the storage key didn't need bumping to v2: the old shape is
 * still readable, so nobody loses anything.
 */
function toNote(value: unknown): Note | null {
  if (typeof value !== 'object' || value === null) return null
  const candidate = value as Record<string, unknown>

  // Required since v1. Missing any of these and it isn't a note at all.
  if (typeof candidate.id !== 'string') return null
  if (typeof candidate.title !== 'string') return null
  if (typeof candidate.body !== 'string') return null
  if (typeof candidate.createdAt !== 'number') return null
  if (typeof candidate.updatedAt !== 'number') return null

  return {
    id: candidate.id,
    title: candidate.title,
    body: candidate.body,
    createdAt: candidate.createdAt,
    updatedAt: candidate.updatedAt,
    // Added later — fall back rather than reject.
    color: isNoteColor(candidate.color) ? candidate.color : DEFAULT_NOTE_COLOR,
    pinned: typeof candidate.pinned === 'boolean' ? candidate.pinned : false,
  }
}

/** Read the saved notes. Returns an empty list if there's nothing usable. */
export function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return [] // first ever visit

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    // Convert each entry, then drop the ones that came back null.
    // The `note is Note` predicate is what tells TypeScript the nulls are
    // really gone — otherwise it would still see (Note | null)[].
    return parsed
      .map(toNote)
      .filter((note): note is Note => note !== null)
  } catch {
    // Two things can land here: JSON.parse choking on damaged text, and
    // Safari in private mode, where touching localStorage throws outright.
    // Neither is worth breaking the app over — start empty instead.
    return []
  }
}

/** Write the notes. Returns false if the browser refused to store them. */
export function saveNotes(notes: Note[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
    return true
  } catch {
    // Usually the storage quota being full, occasionally private mode.
    return false
  }
}
