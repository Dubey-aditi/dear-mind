import { useEffect, useState, type ReactNode, type SubmitEvent } from 'react'
import type { Note, NoteColor, NoteDraft } from '../types'
import {
  DEFAULT_NOTE_COLOR,
  NOTE_COLORS,
  NOTE_COLOR_IDS,
} from '../lib/colors'
import { formatRelative } from '../lib/date'
import Flower from './Flower'

type NoteEditorProps = {
  /** Leave this out to write a new note; pass one to edit it. */
  note?: Note
  onSave: (draft: NoteDraft) => void
  /** Only provided when editing — you can't delete a note that doesn't exist. */
  onDelete?: () => void
  onCancel: () => void
}

export default function NoteEditor({
  note,
  onSave,
  onDelete,
  onCancel,
}: NoteEditorProps) {
  // The value passed to useState is only used the very first time this
  // component renders. After that, React keeps whatever the user typed.
  // So `note.title` seeds the field without freezing it.
  const [title, setTitle] = useState(note?.title ?? '')
  const [body, setBody] = useState(note?.body ?? '')
  const [color, setColor] = useState<NoteColor>(note?.color ?? DEFAULT_NOTE_COLOR)
  // One value rather than two booleans, for the same reason EditorState is a
  // union in App: "confirming a delete AND a discard at once" shouldn't be
  // something you can even write down.
  const [confirming, setConfirming] = useState<'delete' | 'discard' | null>(null)

  const isEmpty = title.trim() === '' && body.trim() === ''

  // Has anything actually changed since the editor opened? For a new note the
  // starting point is blank, so typing a single letter counts.
  const isDirty =
    title !== (note?.title ?? '') ||
    body !== (note?.body ?? '') ||
    color !== (note?.color ?? DEFAULT_NOTE_COLOR)

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    // Without this, the browser reloads the whole page on submit.
    event.preventDefault()
    if (isEmpty) return
    onSave({ title: title.trim(), body: body.trim(), color })
  }

  // A back arrow that silently threw away what you'd typed would be a trap.
  // If nothing has changed, leaving is free — so just go.
  function handleBack() {
    if (isDirty) setConfirming('discard')
    else onCancel()
  }

  /**
   * Make the phone's own back gesture close the editor instead of quitting
   * the app.
   *
   * The whole app is one page with no URL routing, so the browser has nothing
   * to go "back" to — on Android, back would close Dear Mind outright. The fix
   * is to give it something: pushing a history entry when the editor opens
   * means the first back press pops *that* instead.
   *
   * Empty dependency array, so this runs once when the editor mounts.
   */
  useEffect(() => {
    window.history.pushState({ dearMindEditor: true }, '')

    return () => {
      // Two ways to get here. If the user pressed back, the browser already
      // removed our entry and history.state is whatever came before. If they
      // saved or discarded instead, our entry is still sitting on the stack
      // and has to be taken off — otherwise it piles up and the next back
      // press would appear to do nothing.
      if (window.history.state?.dearMindEditor) {
        window.history.back()
      }
    }
  }, [])

  /**
   * React to the back press itself. Separate from the effect above because
   * this one depends on `isDirty` — it needs re-subscribing whenever that
   * flips, while the history entry must be pushed exactly once.
   */
  useEffect(() => {
    function handlePopState() {
      if (isDirty) {
        // Put the entry back so we stay on the editor, then ask.
        window.history.pushState({ dearMindEditor: true }, '')
        setConfirming('discard')
      } else {
        onCancel()
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [isDirty, onCancel])

  return (
    <div className="fixed inset-0 z-50 animate-slide-up bg-paper">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex h-dvh max-w-md flex-col px-8"
      >
        <header className="flex items-center justify-between pt-8">
          {/* Back on the left is where every phone puts it, so it needs no
              explaining. -ml-2 pulls the button's padding back so the arrow
              lines up with the text below rather than looking indented. */}
          <div className="flex items-center gap-2">
            <IconButton
              label="Back to notes"
              onClick={handleBack}
              className="-ml-2 text-navy"
            >
              <path
                d="M19 12H5M11 6l-6 6 6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </IconButton>
            <Flower className="size-8" />
          </div>

          {/* Rendered only when onDelete was passed, i.e. only when editing */}
          {onDelete && (
            <IconButton
              label="Delete note"
              onClick={() => setConfirming('delete')}
              className="-mr-2 text-navy"
            >
              <path
                d="M4 7h16M9 7V5h6v2M7 7l1 12h8l1-12"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </IconButton>
          )}
        </header>

        {/* A "controlled input": React holds the value, and every keystroke
            fires onChange, which sets state, which re-renders with the new
            value. The input never keeps its own copy. */}
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Give your thought a title..."
          className="mt-10 w-full border-b border-indigo bg-transparent pb-3 text-2xl text-forest outline-none placeholder:text-hush"
          // Popping the keyboard open is welcoming for a blank note, and
          // intrusive when you only opened an old one to read it.
          autoFocus={!note}
        />

        {note && (
          <p className="mt-2 text-[11px] text-muted">
            {note.updatedAt === note.createdAt
              ? `Written ${formatRelative(note.createdAt)}`
              : `Edited ${formatRelative(note.updatedAt)}`}
          </p>
        )}

        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Start writing..."
          className="mt-6 w-full flex-1 resize-none bg-transparent text-base leading-relaxed text-forest outline-none placeholder:text-hush"
        />

        {/* Hidden while confirming — one decision at a time */}
        {confirming === null && (
          <div className="py-5">
            <ColorPicker value={color} onChange={setColor} />
          </div>
        )}

        <div className="mb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          {confirming === 'delete' ? (
            <Confirm
              message="Delete this note? This can't be undone."
              cancelLabel="Keep it"
              confirmLabel="Delete"
              onCancel={() => setConfirming(null)}
              onConfirm={() => onDelete?.()}
            />
          ) : confirming === 'discard' ? (
            <Confirm
              message="Leave without saving? Your changes will be lost."
              cancelLabel="Keep writing"
              confirmLabel="Discard"
              onCancel={() => setConfirming(null)}
              onConfirm={onCancel}
            />
          ) : (
            <button
              type="submit"
              disabled={isEmpty}
              className="w-full rounded-full bg-navy py-3.5 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-30"
            >
              {note ? 'Save changes' : 'Save note'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

// Delete and discard ask the same shape of question, so they share one
// component and differ only in wording.
function Confirm({
  message,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  message: string
  cancelLabel: string
  confirmLabel: string
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <>
      <p className="mb-3 text-center text-sm text-muted">{message}</p>
      <div className="flex gap-3">
        {/* type="button" matters: inside a <form>, a button with no type
            defaults to "submit" and would save instead. */}
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-full border border-navy py-3.5 text-sm font-semibold text-navy transition active:scale-[0.98]"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 rounded-full bg-rose py-3.5 text-sm font-semibold text-white transition active:scale-[0.98]"
        >
          {confirmLabel}
        </button>
      </div>
    </>
  )
}

// A row of swatches. role="radiogroup" plus aria-checked tells a screen
// reader this is a pick-one control, which coloured circles alone don't convey.
function ColorPicker({
  value,
  onChange,
}: {
  value: NoteColor
  onChange: (color: NoteColor) => void
}) {
  return (
    <div className="flex items-center gap-3" role="radiogroup" aria-label="Note colour">
      {NOTE_COLOR_IDS.map((id) => {
        const isSelected = id === value
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={NOTE_COLORS[id].label}
            onClick={() => onChange(id)}
            style={{ backgroundImage: NOTE_COLORS[id].gradient }}
            // ring-offset paints a gap in the page colour between swatch and
            // ring, so the selected one reads clearly against any gradient.
            className={`size-9 rounded-full transition active:scale-90 ${
              isSelected
                ? 'ring-2 ring-navy ring-offset-2 ring-offset-paper'
                : ''
            }`}
          />
        )
      })}
    </div>
  )
}

// A tiny local component so the two header buttons don't repeat their styling.
// `children` is the special prop holding whatever you nest inside the tag.
function IconButton({
  label,
  onClick,
  className,
  children,
}: {
  label: string
  onClick: () => void
  className?: string
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex size-9 items-center justify-center rounded-full transition active:scale-90 ${className ?? ''}`}
    >
      <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
        {children}
      </svg>
    </button>
  )
}
