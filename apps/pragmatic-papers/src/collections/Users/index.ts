import { adminOrSelf } from "@/access/adminOrSelf"
import { admin, adminFieldLevel } from "@/access/admins"
import { staff } from "@/access/staff"
import { revalidateUser } from "@/collections/Users/hooks/revalidateUser"
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
    admin: staff,
    create: admin,
    delete: admin,
    read: adminOrSelf,
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
        condition: ({ data }) => Boolean(data?.id),
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
        condition: ({ data }) => Boolean(data?.id),
      },
    },
    slugField({
      useAsSlug: "name",
      overrides: (field) => {
        field.admin = {
          condition: ({ data }) => Boolean(data?.id),
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
        condition: ({ data }) => Boolean(data?.id),
        position: "sidebar",
      },
    },
    menu({
      name: "socials",
      label: "Socials",
      maxRows: 6,
      admin: {
        condition: ({ data }) => Boolean(data?.id),
        position: "sidebar",
      },
    }),
    {
      name: "role",
      type: "select",
      saveToJWT: true,
      defaultValue: "member",
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
          label: "Member",
          value: "member",
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateUser],
  },
  timestamps: true,
}
