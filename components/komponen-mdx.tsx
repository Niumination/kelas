import type { ReactNode } from 'react'

const GAYA = {
  info: { tepi: 'var(--color-biru)', ikon: 'i', latar: 'rgba(56,189,248,0.06)' },
  tips: { tepi: 'var(--color-hijau)', ikon: '✓', latar: 'rgba(74,222,128,0.06)' },
  peringatan: { tepi: 'var(--color-kuning)', ikon: '!', latar: 'rgba(251,191,36,0.06)' },
  bahaya: { tepi: 'var(--color-merah)', ikon: '×', latar: 'rgba(248,113,113,0.06)' },
} as const

export function Callout({
  tipe = 'info',
  judul,
  children,
}: {
  tipe?: keyof typeof GAYA
  judul?: string
  children: ReactNode
}) {
  const g = GAYA[tipe]
  return (
    <div
      className="my-6 rounded-lg border p-4"
      style={{ borderColor: g.tepi, background: g.latar }}
    >
      <div className="mb-1 flex items-center gap-2">
        <span
          className="mono flex h-5 w-5 items-center justify-center rounded text-xs font-bold"
          style={{ background: g.tepi, color: '#08090b' }}
        >
          {g.ikon}
        </span>
        {judul && <strong className="text-[0.95rem]">{judul}</strong>}
      </div>
      <div className="[&>p]:my-2 [&>p]:text-[0.95rem]">{children}</div>
    </div>
  )
}

export function Terminal({ perintah, children }: { perintah?: string; children?: ReactNode }) {
  return (
    <div className="my-6 overflow-hidden rounded-lg border border-tepian bg-[#0b0d11]">
      <div className="flex items-center gap-1.5 border-b border-tepian px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#f87171]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#fbbf24]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#4ade80]" />
        <span className="mono ml-2 text-[0.7rem] text-redup">terminal</span>
      </div>
      <div className="mono overflow-x-auto px-4 py-3 text-[0.85rem] leading-relaxed">
        {perintah && (
          <div>
            <span className="text-hijau">$ </span>
            <span className="text-teks">{perintah}</span>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

export function Tugas({ ke, children }: { ke?: number; children: ReactNode }) {
  return (
    <div className="my-6 rounded-lg border border-dashed border-hijau/40 bg-hijau/[0.03] p-4">
      <div className="mono mb-2 text-xs font-semibold tracking-wide text-hijau">
        TUGAS{ke ? ` ${ke}` : ''}
      </div>
      <div className="[&>p]:my-2 [&>ul]:my-2 [&>p]:text-[0.95rem]">{children}</div>
    </div>
  )
}

export function Langkah({ ke, judul, children }: { ke: number; judul: string; children: ReactNode }) {
  return (
    <div className="my-5 flex gap-4">
      <span className="mono flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-hijau/40 bg-hijau/10 text-sm font-bold text-hijau">
        {ke}
      </span>
      <div className="[&>p]:my-1">
        <strong className="block">{judul}</strong>
        <div className="text-[0.95rem] text-[#cfd5dd]">{children}</div>
      </div>
    </div>
  )
}

export function Preview({ judul, children }: { judul?: string; children: ReactNode }) {
  return (
    <div className="my-6 rounded-lg border border-tepian">
      {judul && (
        <div className="mono border-b border-tepian px-4 py-2 text-[0.7rem] uppercase tracking-wider text-redup">
          {judul}
        </div>
      )}
      <div className="p-4 text-[0.95rem] [&>p]:my-2">{children}</div>
    </div>
  )
}

export const komponenMdx = { Callout, Terminal, Tugas, Langkah, Preview }
