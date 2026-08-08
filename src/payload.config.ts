import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

import { Properties } from './collections/Properties'
import { ProjectUnits } from './collections/ProjectUnits'
import { Projects } from './collections/Projects'
import { Companies } from './collections/Companies'
import { Areas } from './collections/Areas'
import { ListingRequests } from './collections/ListingRequests'
import { Enquiries } from './collections/Enquiries'
import { Articles } from './collections/Articles'
import { Users } from './collections/Users'
import { Media } from './collections/Media'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' — Atmos' },
  },

  collections: [
    Properties,
    ProjectUnits,
    Projects,
    Companies,
    Areas,
    Articles,
    ListingRequests,
    Enquiries,
    Users,
    Media,
  ],

  // Three locales defined, two shipped. Italian stays configured so no schema
  // change is needed when it launches. See docs/07-i18n.md.
  localization: {
    locales: [
      { code: 'sq', label: 'Shqip' },
      { code: 'en', label: 'English' },
      { code: 'it', label: 'Italiano' },
    ],
    defaultLocale: 'sq',
    fallback: true,
  },

  editor: lexicalEditor(),

  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL },
    push: false, // migrations only. Never let push run against Neon.
  }),

  plugins: [
    vercelBlobStorage({
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],

  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  sharp: (await import('sharp')).default,
})
