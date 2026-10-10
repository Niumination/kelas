import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { komponenMdx } from './komponen-mdx'

/** Merender materi .mdx. Tabel (GFM) dan komponen custom didukung. */
export function MdxIsi({ sumber }: { sumber: string }) {
  return (
    <div className="isi">
      <MDXRemote
        source={sumber}
        components={komponenMdx}
        options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
      />
    </div>
  )
}
