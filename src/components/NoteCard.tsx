import type { Note } from '../types'
import { NOTE_COLORS } from '../lib/colors'
import { formatShortDate } from '../lib/date'

type NoteCardProps = {
  note: Note
  onSelect: () => void
  onTogglePin: () => void
}

export default function NoteCard({
  note,
  onSelect,
  onTogglePin,
}: NoteCardProps) {
  return (
    // :active matches ancestors of whatever you're pressing, so tapping the
    // card's button shrinks the whole card — not just the invisible button.
    <article
      className={`relative aspect-square rounded-2xl p-4 transition active:scale-[0.97] ${
        note.pinned ? 'ring-1 ring-indigo/25' : ''
      }`}
      // A gradient can't be a Tailwind colour class, so it goes through the
      // style attribute. The value comes from colors.ts — the note itself only
      // stores the name "sky", never the CSS.
      style={{ backgroundImage: NOTE_COLORS[note.color].gradient }}
    >
      <div className="flex h-full flex-col">
        <PencilIcon className="absolute top-3 right-3 size-5 text-navy" />

        {/* pr-7 keeps the text from sliding under the pencil */}
        <h3 className="pr-7 text-sm font-semibold text-indigo">
          {note.title || 'Untitled'}
        </h3>

        {/* line-clamp-4 shows four lines then trims with an ellipsis, so a
            long note can never blow the card's size out. */}
        <p className="mt-1.5 line-clamp-4 text-[13px] leading-snug text-navy/80">
          {note.body}
        </p>

        {/* mt-auto pushes the date to the bottom, whatever the text above does */}
        <time className="mt-auto pt-2 pr-8 text-[10px] font-medium tracking-wide text-navy/50">
          {formatShortDate(note.updatedAt)}
        </time>
      </div>

      {/* The tap target for opening the note. It covers the card and comes
          after the text in the DOM, so it sits on top. Doing it this way
          rather than wrapping everything in one <button> is what lets the pin
          be its own button — you can't nest a button inside a button. */}
      <button
        type="button"
        onClick={onSelect}
        aria-label={`Open ${note.title || 'untitled note'}`}
        className="absolute inset-0 rounded-2xl"
      />

      {/* z-10 lifts the pin above that full-card button so its tap wins */}
      <button
        type="button"
        onClick={onTogglePin}
        aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
        aria-pressed={note.pinned}
        className="absolute right-1.5 bottom-1.5 z-10 flex size-8 items-center justify-center rounded-full transition active:scale-90"
      >
        <PinIcon
          className={`size-4 ${note.pinned ? 'text-indigo' : 'text-navy/30'}`}
        />
      </button>
    </article>
  )
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z" fill="currentColor" />
    </svg>
  )
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M16 9V4h1a1 1 0 0 0 0-2H7a1 1 0 0 0 0 2h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z"
        fill="currentColor"
      />
    </svg>
  )
}
