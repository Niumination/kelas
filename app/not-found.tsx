import Link from 'next/link'

export default function TidakDitemukan() {
  return (
    <div className="mx-auto max-w-md px-5 py-28 text-center">
      <div className="mono mb-4 text-6xl font-bold text-tepian">404</div>
      <h1 className="text-xl font-semibold">Halaman tidak ditemukan</h1>
      <p className="mt-2 text-sm text-redup">
        Mungkin materinya belum terbit, atau alamatnya salah ketik.
      </p>
      <Link
        href="/"
        className="mono mt-8 inline-block rounded-md border border-hijau/50 bg-hijau/15 px-6 py-2.5 text-sm font-semibold text-hijau hover:bg-hijau/25"
      >
        Kembali ke beranda
      </Link>
    </div>
  )
}
