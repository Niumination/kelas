import type { Metadata, Viewport } from 'next'
import './globals.css'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

const URL_SITUS =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://kelas.niumination.web.id')

export const viewport: Viewport = {
  themeColor: '#f4f2ea',
  colorScheme: 'light',
}

export const metadata: Metadata = {
  metadataBase: new URL(URL_SITUS),
  title: {
    default: 'Kelas Niumination — Bangun AI agent di mesinmu sendiri',
    template: '%s · Kelas Niumination',
  },
  description:
    'Belajar membangun AI agent dari model lokal sampai sistem siap produksi. Fondasi gratis, materi berbahasa Indonesia, docs-driven, dan tanpa video wajib.',
  keywords: ['kelas AI', 'AI agent', 'self-host', 'Ollama', 'Indonesia', 'Niumination', 'LLM lokal'],
  authors: [{ name: 'Afrizal Munthe (Niumination)' }],
  openGraph: {
    title: 'Kelas Niumination — Bangun AI agent di mesinmu sendiri',
    description:
      'Fondasi gratis, produksi berbayar. Pelajari cara membangun AI agent yang berjalan di mesinmu sendiri.',
    url: URL_SITUS,
    siteName: 'Kelas Niumination',
    type: 'website',
    locale: 'id_ID',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kelas Niumination — AI Agent Self-Host',
    description: 'Belajar membangun AI agent dari model lokal hingga sistem siap produksi.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
