export function LencanaAkses({ akses }: { akses: 'gratis' | 'berbayar' }) {
  const gratis = akses === 'gratis'
  return (
    <span
      className="mono inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wide"
      style={
        gratis
          ? { background: 'rgba(74,222,128,0.12)', color: 'var(--color-hijau)' }
          : { background: 'rgba(251,191,36,0.12)', color: 'var(--color-kuning)' }
      }
    >
      {gratis ? 'gratis' : '🔒 berbayar'}
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
  const peta = {
    netral: { bg: 'rgba(152,161,172,0.12)', fg: 'var(--color-redup)' },
    hijau: { bg: 'rgba(74,222,128,0.12)', fg: 'var(--color-hijau)' },
    biru: { bg: 'rgba(56,189,248,0.12)', fg: 'var(--color-biru)' },
    kuning: { bg: 'rgba(251,191,36,0.12)', fg: 'var(--color-kuning)' },
  } as const
  const w = peta[warna]
  return (
    <span
      className="mono inline-flex items-center rounded px-2 py-0.5 text-[0.7rem]"
      style={{ background: w.bg, color: w.fg }}
    >
      {anak}
    </span>
  )
}
