import FloralMark from './FloralMark'

type WelcomeProps = {
  onEnter: () => void
}

export default function Welcome({ onEnter }: WelcomeProps) {
  return (
    <div className="fixed inset-0 z-50 animate-fade bg-paper">
      <div className="mx-auto flex h-dvh max-w-md flex-col px-10 pt-[env(safe-area-inset-top)]">
        {/* flex-1 + justify-center floats this block in whatever space is
            left once the button has taken its share at the bottom. */}
        <div className="flex flex-1 flex-col items-center justify-center">
          <FloralMark className="w-52 animate-rise" />

          <h1 className="mt-6 animate-rise font-display text-[clamp(2.75rem,14vw,3.75rem)] leading-none font-medium tracking-wide text-forest">
            DEAR MIND
          </h1>

          <p className="mt-5 max-w-[17rem] animate-rise text-center text-sm leading-relaxed text-muted">
            A little space for all the thoughts in your head.
          </p>
        </div>

        <button
          type="button"
          onClick={onEnter}
          className="mb-[calc(2.5rem+env(safe-area-inset-bottom))] w-full rounded-full bg-navy py-4 text-sm font-semibold text-white transition active:scale-[0.98]"
        >
          Let&rsquo;s get in..
        </button>
      </div>
    </div>
  )
}
