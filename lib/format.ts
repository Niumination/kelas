export function rupiah(n: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  })
    .format(n)
    .replace(/\s/g, ' ')
}

export function durasiMenit(menit: number): string {
  if (menit < 60) return `${menit} menit`
  const jam = Math.floor(menit / 60)
  const sisa = menit % 60
  return sisa ? `${jam} jam ${sisa} menit` : `${jam} jam`
}

/** Versi ringkas untuk daftar kurikulum: "45m", "1j 30m", "10j". */
export function durasiSingkat(menit: number): string {
  if (menit < 60) return `${menit}m`
  const jam = Math.floor(menit / 60)
  const sisa = menit % 60
  return sisa ? `${jam}j ${sisa}m` : `${jam}j`
}
