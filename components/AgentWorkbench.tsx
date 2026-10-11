export function AgentWorkbench() {
  return (
    <div className="agent-visual mx-auto w-full max-w-[34rem]">
      <div className="agent-window">
        <div className="agent-window-bar">
          <div className="flex items-center gap-2">
            <span className="flex gap-1.5" aria-hidden="true">
              <span className="h-2 w-2 rounded-full bg-[#cb7765]" />
              <span className="h-2 w-2 rounded-full bg-[#d2b66a]" />
              <span className="h-2 w-2 rounded-full bg-[#84a276]" />
            </span>
            <span className="ml-1 text-[#68756b]">workbench / agent-lokal</span>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#6a855f]/25 bg-[#e8efdc] px-2 py-1 text-[0.55rem] font-bold tracking-[0.12em] text-[#45664b]">
            <span className="signal-dot h-1.5 w-1.5" /> SIAP
          </span>
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="agent-node-label">Alur kerja · 03 tahap</div>
              <div className="mt-1 font-semibold tracking-tight">Dari permintaan ke tindakan</div>
            </div>
            <span className="mono rounded-md bg-[#eeeee4] px-2 py-1 text-[0.58rem] text-[#6c786e]">LOCAL FIRST</span>
          </div>

          <div className="mt-5 grid grid-cols-[1fr_18px_1.2fr_18px_1fr] items-center gap-1.5" role="img" aria-label="Alur agent: permintaan pengguna diteruskan ke model lokal, lalu agent memanggil tool">
            <div className="agent-node min-w-0">
              <span className="agent-node-label">01 · input</span>
              <span className="agent-node-title">Permintaan</span>
              <span className="mt-1 truncate text-[0.62rem] text-[#778077]">"Ringkas catatan…"</span>
            </div>
            <svg viewBox="0 0 20 12" className="w-full text-[#71816e]" fill="none" aria-hidden="true">
              <path d="M1 6h15m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="agent-node agent-node-focus min-w-0">
              <span className="agent-node-label">02 · reasoning</span>
              <span className="agent-node-title">Model lokal</span>
              <span className="mt-1 truncate text-[0.62rem] text-[#667369]">rencana → keputusan</span>
            </div>
            <svg viewBox="0 0 20 12" className="w-full text-[#71816e]" fill="none" aria-hidden="true">
              <path d="M1 6h15m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="agent-node min-w-0">
              <span className="agent-node-label">03 · action</span>
              <span className="agent-node-title">Tool</span>
              <span className="mt-1 truncate text-[0.62rem] text-[#778077]">jalankan · periksa</span>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-[#dfe2d6] bg-white/75 p-3">
            <div className="flex items-center justify-between gap-3">
              <span className="agent-node-label">Contoh perintah</span>
              <span className="mono text-[0.55rem] text-[#7a837a]">TERMINAL</span>
            </div>
            <div className="mono mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.7rem] text-[#334b3a]">
              <span className="font-bold text-[#64844d]">$</span>
              <span>ollama run</span>
              <span className="rounded bg-[#edf0e6] px-1.5 py-0.5 text-[#647263]">&lt;model-lokal&gt;</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#dfe2d6] bg-[#edeee4] px-4 py-2.5 font-mono text-[0.58rem] text-[#778077] sm:px-5">
          <span>DATA · KENDALI DI TANGANMU</span>
          <span>MODEL → TOOL → JEJAK</span>
        </div>
      </div>

      <div className="float-note -bottom-4 -left-3 hidden sm:block">
        <span className="text-[#b8d98a]">01</span> · BACA, JALANKAN, PAHAMI
      </div>
      <div className="float-note -right-3 -top-4 hidden sm:block">
        <span className="text-[#b8d98a]">NO VIDEO</span> · DOCS-DRIVEN
      </div>
    </div>
  )
}
