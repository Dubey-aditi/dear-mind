/**
 * The colours a note can be. A union of exact strings, not just `string` —
 * so `note.color = 'purple'` is caught by TypeScript, and every place that
 * switches on the colour is forced to handle all five.
 */
export type NoteColor = 'sky' | 'mist' | 'sage' | 'blush' | 'sand'

// This describes the shape of a single note. It exists only while you're
// writing code — TypeScript erases it before the browser ever sees it.
// Its job is to catch mistakes: misspell `title` as `titel` anywhere in the
// app and your editor underlines it immediately.
export interface Note {
  id: string
  title: string
  body: string
  color: NoteColor
  pinned: boolean
  /** Milliseconds since 1970, from Date.now(). Easy to store and to sort. */
  createdAt: number
  updatedAt: number
}

/**
 * What the editor collects from you — the parts of a note you actually type
 * or choose. Everything else (id, timestamps, pinned) is the app's business.
 *
 * This started life as two arguments, `onSave(title, body)`. Adding colour
 * would have made three, and the next feature four. Once a parameter list
 * starts growing, one named object is easier to read at the call site and
 * cheaper to extend later.
 */
export type NoteDraft = {
  title: string
  body: string
  color: NoteColor
}
