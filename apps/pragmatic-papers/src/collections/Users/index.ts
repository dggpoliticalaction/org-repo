import type {
  AuthStrategyFunctionArgs,
  AuthStrategyResult,
  CollectionConfig,
  PayloadRequest,
} from 'payload'
import { adminOrSelf } from '@/access/adminOrSelf'
import { admin, adminFieldLevel } from '@/access/admins'
// import { writerFieldLevel } from '@/access/writer'
import {
  FixedToolbarFeature,
  HeadingFeature,
  IndentFeature,
  InlineToolbarFeature,
  lexicalEditor,
  OrderedListFeature,
  UnorderedListFeature,
} from '@payloadcms/richtext-lexical'
import { authenticated } from '../../access/authenticated'
import { auth } from '@/auth/auth'
import { writerFieldLevel } from '@/access/writer'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: writerFieldLevel,
    // admin: async ({ req }) => {
    //   const { success } = await auth.api.userHasPermission({
    //     // Only available when you setup the admin plugin
    //     body: {
    //       permissions: {
    //         adminDashboard: ['read'],
    //       },
    //       userId: req.user?.id.toString(),
    //     },
    //   })

    //   // console.log('success', success)
    //   // console.log('req.user', req.user)

    //   const isAllowed = typeof success === 'boolean' ? success : false

    //   return isAllowed
    // },
    create: admin,
    delete: admin,
    read: authenticated,
    update: adminOrSelf,
  },
  admin: {
    defaultColumns: ['name', 'role', 'email'],
    useAsTitle: 'name',
  },
  auth: {
    disableLocalStrategy: true, // We should disable this since we use Better Auth now
    strategies: [
      {
        name: 'better-auth',
        authenticate: async ({
          headers,
          payload,
        }: AuthStrategyFunctionArgs): Promise<AuthStrategyResult> => {
          try {
            const userSession = await auth.api.getSession({ headers })

            if (!userSession || !userSession.user) return { user: null }

            const userData = await payload.findByID({
              collection: 'users',
              id: userSession?.user?.id,
            })

            return {
              user: {
                ...userData,
                collection: 'users',
              },
            }
          } catch (err) {
            payload.logger.error(err)
            return { user: null }
          }
        },
      },
    ],
  },
  endpoints: [
    {
      path: '/logout',
      method: 'post',
      handler: async (req: PayloadRequest): Promise<Response> => {
        await auth.api.signOut({
          headers: req.headers,
        })
        return Response.json(
          {
            message: 'Token revoked successfully',
          },
          {
            status: 200,
            headers: req.headers,
          },
        )
      },
    },
  ],
  fields: [
    {
      name: 'name',
      type: 'text',
      index: true,
    },
    {
      name: 'email',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'emailVerified',
      type: 'checkbox',
      required: true,
    },
    {
      name: 'image',
      type: 'text',
    },
    {
      name: 'biography',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
            OrderedListFeature(),
            UnorderedListFeature(),
            IndentFeature(),
          ]
        },
      }),
      required: false,
    },
    {
      name: 'role',
      type: 'select',
      // saveToJWT: true,
      required: true,
      defaultValue: 'user',
      admin: {
        description: "The user's role. Defaults to 'user'.",
      },
      access: {
        update: adminFieldLevel,
      },
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'Chief Editor',
          value: 'chief-editor',
        },
        {
          label: 'Editor',
          value: 'editor',
        },
        {
          label: 'Writer',
          value: 'writer',
        },
        {
          label: 'User',
          value: 'user',
        },
      ],
    },
    {
      name: 'banned',
      type: 'checkbox',
      required: true,
      defaultValue: false,
      admin: {
        description: 'Indicates whether the user is banned.',
      },
    },
    {
      name: 'banReason',
      type: 'text',
      admin: {
        description: "The reason for the user's ban.",
      },
    },
    {
      name: 'banExpires',
      type: 'date',
      admin: {
        description: "The date when the user's ban will expire.",
      },
    },
  ],
  timestamps: true,
}
