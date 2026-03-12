import { adminOrSelf } from "@/access/adminOrSelf"
import { admin, adminFieldLevel } from "@/access/admins"
import { anyone } from "@/access/anyone"
import { authenticated } from "@/access/authenticated"
import { menu } from "@/fields/menu"
import {
  FixedToolbarFeature,
  HeadingFeature,
  IndentFeature,
  InlineToolbarFeature,
  lexicalEditor,
  OrderedListFeature,
  UnorderedListFeature,
} from "@payloadcms/richtext-lexical"
import { slugField, type CollectionConfig } from "payload"

export const Users: CollectionConfig = {
  slug: "users",
  access: {
    admin: authenticated,
    create: admin,
    delete: admin,
    read: anyone,
    update: adminOrSelf,
  },
  admin: {
    defaultColumns: ["name", "role", "email"],
    useAsTitle: "name",
  },
  auth: true,
  fields: [
    {
      name: "name",
      type: "text",
    },
    {
      name: "affiliation",
      type: "text",
      required: false,
      admin: {
        condition: ({ id }) => Boolean(id),
      },
    },
    {
      name: "biography",
      type: "richText",
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ["h1", "h2", "h3", "h4"] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
            OrderedListFeature(),
            UnorderedListFeature(),
            IndentFeature(),
          ]
        },
      }),
      required: false,
      admin: {
        condition: ({ id }) => Boolean(id),
      },
    },
    slugField({
      useAsSlug: "name",
      overrides: (field) => {
        field.admin = {
          condition: ({ id }) => Boolean(id),
          position: "sidebar",
        }
        return field
      },
    }),
    {
      name: "profileImage",
      type: "upload",
      relationTo: "media",
      required: false,
      admin: {
        condition: ({ id }) => Boolean(id),
        position: "sidebar",
      },
    },
    menu({
      name: "socials",
      label: "Socials",
      maxRows: 6,
      admin: {
        condition: ({ id }) => Boolean(id),
        position: "sidebar",
      },
    }),
    {
      name: "role",
      type: "select",
      saveToJWT: true,
      defaultValue: "user",
      access: {
        update: adminFieldLevel,
      },
      admin: {
        position: "sidebar",
      },
      options: [
        {
          label: "Admin",
          value: "admin",
        },
        {
          label: "Chief Editor",
          value: "chief-editor",
        },
        {
          label: "Editor",
          value: "editor",
        },
        {
          label: "Writer",
          value: "writer",
        },
        {
          label: "User",
          value: "user",
        },
      ],
    },
  ],
  timestamps: true,
}
