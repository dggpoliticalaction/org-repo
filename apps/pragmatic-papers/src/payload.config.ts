import { Articles } from '@/collections/Articles'
import { Categories } from '@/collections/Categories'
import { Media } from '@/collections/Media'
import { Pages } from '@/collections/Pages'
import { Users } from '@/collections/Users'
import { Volumes } from '@/collections/Volumes'
import { Webhooks } from '@/collections/Webhooks'
import { defaultLexical } from '@/fields/defaultLexical'
import { Footer } from '@/Footer/config'
import { Header } from '@/Header/config'
import { plugins } from '@/plugins'
import { getServerSideURL } from '@/utilities/getURL'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import path from 'path'
import { buildConfig, type PayloadRequest, type SharpDependency } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Database adapter selection based on environment
// Use SQLite for staging/preview (embedded database, no separate container needed)
// Use PostgreSQL for production (scalable, robust)
const databaseAdapter =
  process.env.DATABASE_ADAPTER === 'sqlite'
    ? sqliteAdapter({
        client: {
          url: process.env.DATABASE_URI || 'file:./pragmatic-papers.db',
        },
      })
    : postgresAdapter({
        pool: {
          connectionString: process.env.DATABASE_URI,
        },
      })

export default buildConfig({
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeLogin` statement on line 15.
      beforeLogin: ['@/components/BeforeLogin'],
      beforeDashboard: ['@/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: databaseAdapter,
  collections: [Pages, Articles, Volumes, Media, Categories, Users, Webhooks],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer],
  plugins: [...plugins],
  secret: process.env.PAYLOAD_SECRET,
  sharp: sharp as unknown as SharpDependency,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  endpoints: [
    {
      path: '/health',
      method: 'get',
      handler: async () => {
        return Response.json({
          status: 'ok',
          timestamp: new Date().toISOString(),
        })
      },
    },
  ],
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${process.env.CRON_SECRET}`
      },
    },
    tasks: [],
  },
})
