export default function Memuat() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:py-14 lg:px-8" role="status" aria-live="polite" aria-label="Memuat halaman">
      <span className="sr-only">Memuat halaman…</span>
      <div className="h-4 w-32 animate-pulse rounded bg-tepian/70" />
      <div className="mt-5 rounded-[1.5rem] border border-tepian bg-panel p-6 sm:p-10">
        <div className="h-3 w-40 animate-pulse rounded bg-tepian/70" />
        <div className="mt-5 h-12 max-w-xl animate-pulse rounded-xl bg-panel-2 sm:h-16" />
        <div className="mt-4 h-4 max-w-2xl animate-pulse rounded bg-panel-2" />
        <div className="mt-2 h-4 max-w-lg animate-pulse rounded bg-panel-2" />
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((item) => <div key={item} className="h-24 animate-pulse rounded-xl border border-tepian bg-panel-2/60" />)}
        </div>
      </div>
      <div className="mt-6 grid gap-3 lg:grid-cols-[0.7fr_1.3fr]">
        <div className="h-40 animate-pulse rounded-2xl bg-panel-2/70" />
        <div className="h-64 animate-pulse rounded-2xl bg-panel-2/70" />
      </div>
    </div>
  )
}
