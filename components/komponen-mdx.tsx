import type { ReactNode } from 'react'

const GAYA = {
  info: { tepi: 'var(--color-biru)', ikon: 'i', latar: 'rgba(82,123,144,0.08)' },
  tips: { tepi: 'var(--color-hijau)', ikon: '✓', latar: 'rgba(65,107,80,0.07)' },
  peringatan: { tepi: 'var(--color-kuning)', ikon: '!', latar: 'rgba(169,103,44,0.07)' },
  bahaya: { tepi: 'var(--color-merah)', ikon: '×', latar: 'rgba(165,75,66,0.07)' },
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
  const gaya = GAYA[tipe]
  return (
    <div className="my-6 rounded-xl border p-4 sm:p-5" style={{ borderColor: gaya.tepi, background: gaya.latar }}>
      <div className="mb-1 flex items-center gap-2.5">
        <span className="mono flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[0.68rem] font-bold" style={{ background: gaya.tepi, color: '#fffef9' }}>
          {gaya.ikon}
        </span>
        {judul && <strong className="text-[0.95rem]">{judul}</strong>}
      </div>
      <div className="[&>p]:my-2 [&>p]:text-[0.95rem]">{children}</div>
    </div>
  )
}

export function Terminal({ perintah, children }: { perintah?: string; children?: ReactNode }) {
  return (
    <div className="my-6 overflow-hidden rounded-xl border border-[#344b3d] bg-[#172b21] text-[#e2e9d9] shadow-[0_12px_30px_rgba(20,39,31,0.12)]">
      <div className="flex items-center gap-1.5 border-b border-[#344b3d] px-3.5 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#cb7765]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#d2b66a]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#84a276]" />
        <span className="mono ml-2 text-[0.67rem] text-[#a9b8a7]">terminal</span>
      </div>
      <div className="mono overflow-x-auto px-4 py-3 text-[0.84rem] leading-relaxed sm:px-5">
        {perintah && (
          <div>
            <span className="text-[#d9ed8e]">$ </span>
            <span className="text-[#f2f4ea]">{perintah}</span>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

export function Tugas({ ke, children }: { ke?: number; children: ReactNode }) {
  return (
    <div className="my-6 rounded-xl border border-dashed border-hijau/35 bg-hijau/5 p-4 sm:p-5">
      <div className="mono mb-2 text-[0.68rem] font-bold tracking-[0.12em] text-hijau-gelap">TUGAS{ke ? ` ${ke}` : ''}</div>
      <div className="[&>p]:my-2 [&>ul]:my-2 [&>p]:text-[0.95rem]">{children}</div>
    </div>
  )
}

export function Langkah({ ke, judul, children }: { ke: number; judul: string; children: ReactNode }) {
  return (
    <div className="my-5 flex gap-4">
      <span className="mono flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-hijau/30 bg-hijau/10 text-sm font-bold text-hijau-gelap">{ke}</span>
      <div className="[&>p]:my-1">
        <strong className="block">{judul}</strong>
        <div className="text-[0.95rem] text-[#47564c]">{children}</div>
      </div>
    </div>
  )
}

export function Preview({ judul, children }: { judul?: string; children: ReactNode }) {
  return (
    <div className="my-6 overflow-hidden rounded-xl border border-tepian bg-panel">
      {judul && <div className="mono border-b border-tepian bg-panel-2/60 px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.12em] text-redup">{judul}</div>}
      <div className="p-4 text-[0.95rem] [&>p]:my-2 sm:p-5">{children}</div>
    </div>
  )
}

export const komponenMdx = { Callout, Terminal, Tugas, Langkah, Preview }
