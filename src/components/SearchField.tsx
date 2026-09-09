// Another controlled input, and another component that owns no state.
// App holds the query; this just displays it and reports changes back.
type SearchFieldProps = {
  value: string
  onChange: (value: string) => void
}

export default function SearchField({ value, onChange }: SearchFieldProps) {
  return (
    <div className="relative">
      <svg
        viewBox="0 0 24 24"
        className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-hush"
        aria-hidden="true"
      >
        <circle
          cx="11"
          cy="11"
          r="6.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M16 16l4.5 4.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      <input
        // Deliberately "text" rather than "search": iOS adds its own clear
        // button to search inputs, which would sit on top of ours.
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search your thoughts..."
        aria-label="Search notes"
        // text-base (16px) stops iOS Safari zooming in when you tap the field
        className="w-full appearance-none rounded-full border border-hush bg-transparent py-2.5 pr-10 pl-11 text-base text-forest outline-none transition-colors placeholder:text-hush focus:border-navy"
      />

      {/* Only worth showing once there's something to clear */}
      {value !== '' && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted transition active:scale-90"
        >
          <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  )
}
