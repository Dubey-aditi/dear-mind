import type { NoteColor } from '../types'

/**
 * The note palette.
 *
 * Every gradient is a lightened pair drawn from a colour already in the app's
 * theme — sky, mist, forest, rose, paper — so a wall of mixed-colour notes
 * still reads as one family. Each one runs from a deeper tint to a paler one,
 * which is what gives the cards a soft top-left light.
 *
 * They're all light enough that navy and indigo text stays readable on top.
 */
export const NOTE_COLORS: Record<NoteColor, { label: string; gradient: string }> = {
  sky: {
    label: 'Sky',
    gradient: 'linear-gradient(160deg, #b2d2fb 0%, #dceafb 100%)',
  },
  mist: {
    label: 'Mist',
    gradient: 'linear-gradient(160deg, #b9c8d6 0%, #dfe7ee 100%)',
  },
  sage: {
    label: 'Sage',
    gradient: 'linear-gradient(160deg, #c1cfc2 0%, #e2eae0 100%)',
  },
  blush: {
    label: 'Blush',
    gradient: 'linear-gradient(160deg, #e2c3c4 0%, #f2e1e0 100%)',
  },
  sand: {
    label: 'Sand',
    gradient: 'linear-gradient(160deg, #e4d6c0 0%, #f4ebdd 100%)',
  },
}

/** The order the swatches appear in the picker. */
export const NOTE_COLOR_IDS = Object.keys(NOTE_COLORS) as NoteColor[]

export const DEFAULT_NOTE_COLOR: NoteColor = 'sky'

/**
 * Notes store the colour's *name*, not its gradient. That means restyling the
 * palette later only touches this file — no saved note needs rewriting.
 * This guard is what checks a name read back from storage is still one we know.
 */
export function isNoteColor(value: unknown): value is NoteColor {
  return typeof value === 'string' && value in NOTE_COLORS
}
