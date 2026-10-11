export function LencanaAkses({ akses }: { akses: 'gratis' | 'berbayar' }) {
  const gratis = akses === 'gratis'
  return (
    <span
      className={`mono inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.64rem] font-bold uppercase tracking-[0.08em] ${
        gratis
          ? 'border-hijau/20 bg-hijau/10 text-hijau-gelap'
          : 'border-kuning/20 bg-kuning/10 text-kuning'
      }`}
    >
      {gratis ? (
        <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" aria-hidden="true">
          <path d="m3.5 8 3 3 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" aria-hidden="true">
          <rect x="3.5" y="7" width="9" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M5.5 7V5.2a2.5 2.5 0 0 1 5 0V7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      )}
      {gratis ? 'gratis' : 'premium'}
    </span>
  )
}

export function Lencana({
  anak,
  warna = 'netral',
}: {
  anak: React.ReactNode
  warna?: 'netral' | 'hijau' | 'biru' | 'kuning'
}) {
  const warnaKelas = {
    netral: 'border-tepian bg-panel text-redup',
    hijau: 'border-hijau/20 bg-hijau/10 text-hijau-gelap',
    biru: 'border-biru/20 bg-biru/10 text-biru',
    kuning: 'border-kuning/20 bg-kuning/10 text-kuning',
  } as const

  return (
    <span className={`mono inline-flex items-center rounded-full border px-2.5 py-1 text-[0.65rem] leading-none ${warnaKelas[warna]}`}>
      {anak}
    </span>
  )
}
