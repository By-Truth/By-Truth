/** Route-level loading state: a quiet skeleton matching the page hero. */
export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="bg-navy pt-36 pb-24 sm:pt-44">
      <span className="sr-only">Loading…</span>
      <div className="mx-auto w-full max-w-7xl animate-pulse px-5 sm:px-8 lg:px-12">
        <div className="h-3 w-32 bg-gold/30" />
        <div className="mt-8 h-12 w-3/4 max-w-2xl bg-white/10 sm:h-16" />
        <div className="mt-6 h-4 w-2/3 max-w-xl bg-white/10" />
        <div className="mt-3 h-4 w-1/2 max-w-md bg-white/10" />
      </div>
    </div>
  );
}
