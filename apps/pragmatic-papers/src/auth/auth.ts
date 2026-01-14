import { ac, admin, chiefEditor, editor, user, writer } from '@/auth/permissions'
import { db } from '@/db'
import * as schema from '@/payload-generated-schema'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin as adminPlugin } from 'better-auth/plugins'

export const auth = betterAuth({
  // baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema,
    usePlural: false, // Should be false when having custom table name mapping as outlined below
  }),
  advanced: {
    database: {
      generateId: false, // Should be false since we'll let Payload generate the ids
    },
  },
  emailAndPassword: {
    enabled: true,
  },

  /* 
  If needed, you can map the core schemas to the drizzle schema table names. When doing this, make sure to 
  set usePlural to false to avoid errors like users table being searched as userss. You only ever need to
  manually map when you use a different slug for the 4 core collections. For example your Users collections slug
  is students, so you should set the user modelName to students.
  */
  user: {
    modelName: 'users',
  },
  account: {
    modelName: 'user_accounts',
    accountLinking: {
      allowDifferentEmails: true,
      enabled: true,
    },
  },
  verification: {
    modelName: 'user_verifications',
  },
  session: {
    modelName: 'user_sessions',
  },
  socialProviders: {
    discord: {
      clientId: process.env.OAUTH_DISCORD_CLIENT_ID,
      clientSecret: process.env.OAUTH_DISCORD_CLIENT_SECRET,
    },
  },
  plugins: [
    adminPlugin({
      ac,
      roles: {
        admin,
        chiefEditor,
        editor,
        writer,
        user,
      },
    }),
  ],
})
