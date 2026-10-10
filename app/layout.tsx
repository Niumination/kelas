import type { Metadata } from 'next'
import './globals.css'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'Kelas Niumination — AI Agent Self-Host',
    template: '%s · Kelas Niumination',
  },
  description:
    'Kelas gratis dan berbayar berbahasa Indonesia untuk membangun sistem AI yang berjalan di mesinmu sendiri: Ollama, tool calling, multi-agent, guardrails, sampai deploy produksi.',
  keywords: ['kelas AI', 'AI agent', 'self-host', 'Ollama', 'Indonesia', 'Niumination', 'LLM lokal'],
  authors: [{ name: 'Afrizal Munthe (Niumination)' }],
  openGraph: {
    title: 'Kelas Niumination — AI Agent Self-Host',
    description:
      'Fondasi gratis, produksi berbayar. Bangun agent AI yang jalan di mesinmu sendiri, tanpa kirim data ke mana-mana.',
    type: 'website',
    locale: 'id_ID',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
