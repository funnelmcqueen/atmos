import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  // Static shells with dynamic holes. A page is prerendered up to the first
  // thing that genuinely depends on the request, and only that part streams in
  // at request time — which is what lets /projekte/[slug] be a static page with
  // a live, URL-driven unit table inside it.
  //
  // The trade is that every uncached data read must now be explicit: it either
  // sits behind `'use cache'` or inside a <Suspense> boundary, or the build
  // fails. That is the point — it makes "is this page static?" a question the
  // compiler answers instead of one you infer from the route table.
  cacheComponents: true,

  // The cache profile every public read uses, replacing the per-page
  // `export const revalidate = 3600` that cacheComponents disallows. Same one
  // hour revalidate window docs/09 asks for; `expire` stays long on purpose, so
  // if Neon is unreachable the site keeps serving the last good render instead
  // of failing — property listings do not go stale in a way that hurts.
  cacheLife: {
    content: { stale: 300, revalidate: 3600, expire: 31536000 },
  },

  experimental: {
    serverActions: {
      // The owner submission form accepts up to 15 photos (docs/05) and the
      // default body limit is 1 MB, which a couple of phone photos exceed. A
      // request over this limit is rejected before the action runs, so the
      // action cannot return a friendly error — which is why the form measures
      // the total on selection and blocks with a real message first.
      //
      // The proper fix is uploading straight to Vercel Blob and posting only
      // the ids; noted as a known limit in docs/progress.md.
      bodySizeLimit: '25mb',
    },
  },

  // PRE-LAUNCH: keep the whole site out of Google. Covers every route — pages,
  // /admin, API — regardless of per-page metadata, and overrides nothing at
  // launch. TO GO LIVE: delete this one `headers()` block; the per-page robots
  // rules in generateMetadata (docs/09) then take over.
  async headers() {
    return [{ source: '/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }]
  },
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
