import { useEffect, useState } from 'react'
import type { Note, NoteDraft } from './types'
import {
  hasSeenWelcome,
  loadNotes,
  markWelcomeSeen,
  saveNotes,
} from './lib/storage'
import Flower from './components/Flower'
import NoteCard from './components/NoteCard'
import NoteEditor from './components/NoteEditor'
import SearchField from './components/SearchField'
import Welcome from './components/Welcome'

/**
 * What the editor is currently doing. `null` means it's closed.
 *
 * This is a "union type": the value is one shape or the other, never both.
 * We could have used two separate pieces of state (an `isOpen` boolean and an
 * `editingId`), but then nothing would stop them drifting out of sync —
 * open with no id, or an id with the editor closed. Here those states simply
 * can't be written down, so they can't happen.
 */
type EditorState = { mode: 'new' } | { mode: 'edit'; note: Note }

export default function App() {
  // Note we pass `loadNotes` itself, not `loadNotes()`. React calls it once,
  // on the very first render, and ignores it forever after. Writing
  // `useState(loadNotes())` would re-read localStorage on every single
  // render and throw the result away — same result, wasted work.
  const [notes, setNotes] = useState<Note[]>(loadNotes)
  const [editor, setEditor] = useState<EditorState | null>(null)
  const [hasStorageError, setHasStorageError] = useState(false)
  const [query, setQuery] = useState('')
  // Another lazy initializer: read the flag once, on the first render only.
  const [isWelcoming, setIsWelcoming] = useState(() => !hasSeenWelcome())

  function handleEnter() {
    markWelcomeSeen()
    setIsWelcoming(false)
  }

  // useEffect runs *after* React has painted. The array at the end lists what
  // it depends on: run this again whenever `notes` changes, and not otherwise.
  // So every create, edit and delete writes to disk, and nothing else does.
  useEffect(() => {
    setHasStorageError(!saveNotes(notes))
  }, [notes])

  function handleSave(draft: NoteDraft) {
    if (!editor) return
    const now = Date.now()

    if (editor.mode === 'new') {
      const newNote: Note = {
        id: makeId(),
        ...draft,
        pinned: false,
        createdAt: now,
        updatedAt: now,
      }
      // Never `notes.push(...)`. React only re-renders when it sees a *new*
      // array, so we build one: the new note, then everything already there.
      setNotes((current) => [newNote, ...current])
    } else {
      const { id } = editor.note
      // .map() walks the list and returns a new one. Every note comes through
      // untouched except the matching one, which is replaced by a copy with
      // the new text. { ...note } copies the fields we aren't changing.
      setNotes((current) =>
        current.map((note) =>
          note.id === id ? { ...note, ...draft, updatedAt: now } : note,
        ),
      )
    }

    setEditor(null)
  }

  function handleTogglePin(id: string) {
    setNotes((current) =>
      current.map((note) =>
        note.id === id ? { ...note, pinned: !note.pinned } : note,
      ),
    )
    // Deliberately no `updatedAt` here. Pinning is about where a note sits,
    // not what it says — bumping the timestamp would be a small lie, and
    // would also shuffle the note's position in the list.
  }

  function handleDelete() {
    if (editor?.mode !== 'edit') return
    const { id } = editor.note
    // .filter() keeps everything the test says true for — so "keep the notes
    // that aren't this one" is the whole of delete.
    setNotes((current) => current.filter((note) => note.id !== id))
    setEditor(null)
  }

  // Derived during render, not stored in state. The filtered list is just a
  // function of the notes and the query, so keeping a second copy in state
  // would only create a way for the two to disagree.
  const search = query.trim().toLowerCase()
  const visibleNotes =
    search === ''
      ? notes
      : notes.filter(
          (note) =>
            note.title.toLowerCase().includes(search) ||
            note.body.toLowerCase().includes(search),
        )

  // Pinned notes first, then most recently touched. [...] makes a copy,
  // because .sort() rearranges the array it's given — sorting `visibleNotes`
  // directly would mutate `notes` itself whenever the search box is empty.
  const orderedNotes = [...visibleNotes].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    return b.updatedAt - a.updatedAt
  })

  // JSX is just a value, so it can go in a variable. Three cases read far
  // better as an if/else here than as ternaries nested inside the markup.
  let content
  if (notes.length === 0) {
    content = <EmptyState />
  } else if (visibleNotes.length === 0) {
    content = <NoResults query={query.trim()} onClear={() => setQuery('')} />
  } else {
    content = (
      <div className="grid grid-cols-2 gap-4">
        {/* .map() turns an array of data into an array of elements.
            `key` lets React track which card is which across renders —
            without it, updates get attached to the wrong card. */}
        {orderedNotes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onSelect={() => setEditor({ mode: 'edit', note })}
            onTogglePin={() => handleTogglePin(note.id)}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col bg-paper text-forest">
      {/* Outside the padded container on purpose, so the navy reaches both
          edges of the screen. */}
      <TopBar />

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-8">
        <Header onAdd={() => setEditor({ mode: 'new' })} />

        {hasStorageError && (
          <p className="mt-5 rounded-xl bg-rose/10 px-4 py-3 text-[13px] leading-relaxed text-rose">
            Couldn&rsquo;t save to this device. Your notes are fine on screen,
            but they may not survive a refresh.
          </p>
        )}

        <main className="flex-1 pt-7 pb-10">
          {/* No point offering search on an empty shelf */}
          {notes.length > 0 && (
            <div className="mb-6">
              <SearchField value={query} onChange={setQuery} />
            </div>
          )}

          {content}
        </main>
      </div>

      {isWelcoming && <Welcome onEnter={handleEnter} />}

      {/* Render the editor only while it's open. `&&` is the usual way to say
          "show this or nothing" in JSX. */}
      {editor && (
        <NoteEditor
          // `key` forces React to build a fresh editor when you switch notes.
          // Without it, React would reuse the existing one — and since useState
          // ignores its initial value after the first render, you'd see the
          // previous note's text in the fields.
          key={editor.mode === 'edit' ? editor.note.id : 'new'}
          note={editor.mode === 'edit' ? editor.note : undefined}
          onSave={handleSave}
          onDelete={editor.mode === 'edit' ? handleDelete : undefined}
          onCancel={() => setEditor(null)}
        />
      )}
    </div>
  )
}

/**
 * A unique id for each note.
 *
 * `crypto.randomUUID()` would be the obvious choice, but browsers only expose
 * it on https and localhost. Testing on your phone over http://192.168.x.x
 * would crash. Timestamp + random text is plenty unique for one device.
 */
function makeId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function TopBar() {
  return (
    // The padding-top reserves room for the phone's status bar once the app
    // is installed and running fullscreen. In a normal browser tab that
    // env() value is simply 0, so nothing changes here.
    <div className="bg-navy pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex max-w-md items-center gap-2.5 px-5 py-3">
        <Flower className="size-8 shrink-0" />
        <p className="text-[13px] font-light text-mist">
          A tiny place for your big thoughts, love&hellip;
        </p>
      </div>
    </div>
  )
}

function Header({ onAdd }: { onAdd: () => void }) {
  return (
    // The title, its label and the rule sit in one column; the + button is a
    // sibling beside it. That's what makes the rule stop short of the button
    // instead of running under it — no hand-tuned width needed.
    <header className="flex items-start justify-between gap-4 pt-7">
      <div className="min-w-0 flex-1">
        {/* clamp(min, preferred, max) scales the title with the screen width
            but never past 3rem. One line instead of a pile of breakpoints,
            and it can't wrap on a narrow phone. */}
        <h1 className="font-display text-[clamp(2.4rem,11.5vw,3.25rem)] leading-none font-medium tracking-wide">
          MY NOTES
        </h1>

        <p className="mt-4 text-[13px] font-bold tracking-wide text-hush uppercase">
          Hey, you! What&rsquo;s on your mind?
        </p>

        <hr className="mt-4 border-t border-indigo" />
      </div>

      <button
        type="button"
        onClick={onAdd}
        aria-label="Add note"
        // mt-4 drops the button to sit level with the middle of the title
        className="mt-4 flex size-10 shrink-0 items-center justify-center rounded-full bg-navy text-white transition active:scale-90"
      >
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </header>
  )
}

// "You have no notes" and "your search matched nothing" are different
// situations and deserve different words. Showing the first one after a
// failed search would read as though the app had lost everything.
function NoResults({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center pt-12 text-center">
      <Flower className="size-12 opacity-40" />
      <h2 className="mt-5 font-display text-2xl">Nothing found</h2>
      <p className="mt-1.5 max-w-[16rem] text-sm leading-relaxed text-muted">
        No notes match &ldquo;{query}&rdquo;.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-5 rounded-full border border-navy px-5 py-2 text-[13px] font-semibold text-navy transition active:scale-95"
      >
        Clear search
      </button>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center pt-16 text-center">
      <Flower className="size-16 opacity-60" />
      <h2 className="mt-6 font-display text-3xl">Nothing here yet</h2>
      <p className="mt-2 max-w-[16rem] text-sm leading-relaxed text-muted">
        Tap the <span className="font-semibold text-navy">+</span> above to write
        your first thought down.
      </p>
    </div>
  )
}
