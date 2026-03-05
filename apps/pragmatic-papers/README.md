# Pragmatic Papers

The Pragmatic Papers website built with [Payload CMS](https://payloadcms.com) and [Next.js](https://nextjs.org).

## Features

- **Content Management**: Full-featured CMS with Payload CMS
- **Collections**: Pages, Posts, Categories, Users, and Media
- **Rich Content Blocks**: Archive, Banner, Call-to-Action, Code, Content, Form, Media, and Related Posts blocks
- **SEO**: Built-in SEO plugin support
- **Search**: Full-text search functionality
- **Form Builder**: Dynamic form creation and management
- **Redirects**: URL redirect management
- **Live Preview**: Preview content changes in real-time
- **Theme Support**: Light/dark theme switching
- **Responsive Design**: Mobile-first responsive layout
- **Type Safety**: Full TypeScript support

## Tech Stack

- **Framework**: Next.js 15
- **CMS**: Payload CMS 3.66
- **Database**: SQLite (via `@payloadcms/db-sqlite`)
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, shadcn/ui
- **Rich Text**: Lexical editor
- **Language**: TypeScript
- **Package Manager**: pnpm

## Prerequisites

- Node.js >= 22
- pnpm >= 10

## Installation

1. Clone the repository:

```bash
git clone https://github.com/dggpoliticalaction/org-repo.git
cd apps/pragmatic-papers
```

2. Install dependencies:

```bash
pnpm install
```

3. Create a `.env` file in the root directory by copying `.env.example`.

## Development

1. Start the development server:

```bash
pnpm dev
```

The application will be available at:

- Frontend: http://localhost:3000
- Admin Panel: http://localhost:3000/admin

2. Navigate to the Admin Panel and create your first user account.

3. Once logged into the admin panel, click the seed button on the dashboard home screen to populate the database with sample content, including posts, pages, and media.

   > **Note**: Seeding the database is destructive and will replace your current data. The seed script creates a demo user for demonstration purposes:
   >
   > - Email: `demo-author@example.com`
   > - Password: `password`

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint errors
- `pnpm generate:types` - Generate Payload TypeScript types
- `pnpm generate:importmap` - Generate Payload import map
- `pnpm check-types` - Type check without emitting files
- `pnpm payload` - Run Payload CLI commands

## Building for Production

1. Build the application:

```bash
pnpm build
```

2. Start the production server:

```bash
pnpm start
```

## Docker

> **Note**: For most development tasks, running Next.js locally with SQLite is sufficient and recommended. Docker is primarily useful for production deployments, team standardization, or when you need to test with different database configurations.

### When to Use Docker

Docker can be useful in the following scenarios:

- **Production deployments**: Containerizing your application for consistent deployment
- **Team standardization**: Ensuring all developers use the same environment
- **Testing different databases**: Switching between SQLite, PostgreSQL, or MongoDB
- **CI/CD pipelines**: Running tests in isolated environments

### Development with Docker Compose

The project includes a `docker-compose.yml` file, but it's currently configured for MongoDB. Since this project uses SQLite by default, you have to update your Payload config to use the MongoDB adapter.

### Production Docker

For production deployments, use the included `Dockerfile`:

```bash
# Build the image
docker build -t pragmatic-papers .

# Run the container
docker run -p 3000:3000 --env-file .env pragmatic-papers
```

### Local Development (Recommended)

For most development work, simply run:

```bash
pnpm dev
```

This uses SQLite (no separate database server needed) and provides:

- Faster startup times
- No Docker overhead
- Easier debugging
- Simpler environment setup

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── (frontend)/        # Public-facing pages
│   └── (payload)/         # Payload admin routes
├── blocks/                 # Content blocks (Archive, Banner, CTA, etc.)
├── collections/            # Payload collections (Pages, Posts, etc.)
├── components/             # React components
├── Footer/                 # Footer global configuration
├── Header/                 # Header global configuration
├── heros/                  # Hero section components
├── providers/              # React context providers
├── search/                 # Search functionality
├── utilities/              # Utility functions
└── payload.config.ts       # Payload CMS configuration
```

## Environment Variables

| Variable                 | Description                        | Required |
| ------------------------ | ---------------------------------- | -------- |
| `DATABASE_URI`           | SQLite database connection string  | Yes      |
| `PAYLOAD_SECRET`         | Secret key for Payload CMS         | Yes      |
| `NEXT_PUBLIC_SERVER_URL` | Public server URL                  | No       |
| `CRON_SECRET`            | Secret for cron job authentication | No       |
| `PREVIEW_SECRET`         | Secret for preview authentication  | No       |

## Collections

- **Pages**: Dynamic page content with flexible block layouts. All pages are draft-enabled and support layout building blocks.
- **Posts**: Blog posts with categories and related posts. Posts are draft-enabled and support layout building blocks for unique layouts.
- **Categories**: Post categorization with support for nested categories (e.g., "News > Technology").
- **Media**: Image and video media management with pre-configured sizes, focal point, and manual resizing.
- **Users**: User authentication and management with access to the admin panel and unpublished content.

## Globals

- **Header**: Global header configuration including navigation links and site-wide header settings.
- **Footer**: Global footer configuration including navigation links and site-wide footer settings.

## Access Control

Access control is configured to limit content access based on publishing status:

- **Users**: Can access the admin panel and create or edit content.
- **Posts**: Everyone can access published posts, but only authenticated users can create, update, or delete them.
- **Pages**: Everyone can access published pages, but only authenticated users can create, update, or delete them.

## Draft Preview

All posts and pages are draft-enabled, allowing you to preview content before publishing. When you create or edit content, it's saved as a draft and won't be visible on the website until published. The front-end automatically regenerates when published content changes.

## Live Preview

In addition to draft previews, live preview allows you to view your page in real-time as you edit content in the admin panel, with full support for SSR rendering.

## On-demand Revalidation

Hooks are configured on collections and globals so that when pages, posts, or header/footer content changes, they are automatically updated in the frontend via Next.js on-demand revalidation.

> **Note**: If an image has been changed (e.g., cropped), you will need to republish the page it's used on to revalidate the Next.js image cache.

## Jobs and Scheduled Publishing

The application supports scheduled publishing using Payload's jobs queue. Content can be scheduled to publish or unpublish at specific times. Tasks run on a cron schedule and can also be run as a separate instance if needed.

> **Note**: When deployed on Vercel, depending on the plan tier, you may be limited to daily cron only.

## Content Blocks

- **Archive**: Display collections of posts or pages
- **Banner**: Hero banners with customizable content
- **Call-to-Action**: CTA blocks with customizable buttons
- **Code**: Syntax-highlighted code blocks
- **Content**: Rich text content blocks
- **Form**: Dynamic form builder
- **Media**: Image and video blocks
- **Related Posts**: Display related post suggestions

## FAQ

### Why don't I see any content after running `pnpm dev` for the first time?

The database starts empty. After creating your first admin user, you need to seed the database with sample content. Navigate to the admin panel dashboard and click the seed button to populate the database with posts, pages, and media. This will give you sample content to work with.

### How do I add a new content block?

1. Create a new directory in `src/blocks/` with your block name
2. Create `Component.tsx` for the frontend rendering
3. Create `config.ts` for the Payload block configuration
4. Register your block in the appropriate collection:

   **For Pages (Layout Builder blocks):**

   - Import your block config in `src/collections/Pages/index.ts`
   - Add it to the `blocks` array in the `layout` field
   - Example: `blocks: [CallToAction, Content, MediaBlock, Archive, FormBlock]`

   **For Posts (Lexical Rich Text blocks):**

   - Import your block config in `src/collections/Posts/index.ts`
   - Add it to the `BlocksFeature` in the `lexicalEditor` configuration
   - Example: `BlocksFeature({ blocks: [Banner, Code, MediaBlock] })`

### How do I customize the admin panel?

You can customize the admin panel by modifying `src/payload.config.ts`. The `admin.components` section allows you to add custom components, and you can customize the admin UI through Payload's admin configuration options.

### What happens if I forget my admin password?

If you're using SQLite, you can reset the password by:

1. Accessing the database directly
2. Or creating a new admin user through the registration endpoint (if enabled)
3. Or deleting the database file and starting fresh (development only)

### How do I add custom fields to collections?

Edit the collection files in `src/collections/` (e.g., `src/collections/Posts/index.ts`). Add your fields to the `fields` array in the collection configuration, then regenerate types with `pnpm generate:types`.

### How do I add a new field type?

You can create reusable field configurations by creating a function that returns a field or array of fields. This is useful when you want to reuse the same field configuration across multiple collections.

**Example: Creating a reusable field function**

Create a new file in `src/fields/` (e.g., `src/fields/myCustomField.ts`):

```typescript
import type { Field } from 'payload'

type MyCustomFieldType = (options?: { required?: boolean; defaultValue?: string }) => Field

export const myCustomField: MyCustomFieldType = ({ required = false, defaultValue = '' } = {}) => {
  return {
    name: 'myField',
    type: 'text',
    required,
    defaultValue,
    admin: {
      description: 'A custom reusable field',
    },
  }
}
```

**Using the custom field:**

```typescript
import { myCustomField } from '@/fields/myCustomField'

export const Pages: CollectionConfig<'pages'> = {
  // ...
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    myCustomField({ required: true, defaultValue: 'Default value' }),
  ],
}
```

**For complex fields (like groups or arrays):**

See `src/fields/link.ts` for an example of a complex reusable field that returns a `GroupField` with conditional fields and custom logic.

**For fields with custom components:**

See `src/fields/slug/index.ts` for an example that includes a custom React component for the admin UI.

After creating custom fields, regenerate your TypeScript types:

```bash
pnpm generate:types
```

### Why are my images not updating after I change them?

If you've modified an image (cropped, resized, etc.), you need to republish the page or post that uses it to revalidate the Next.js image cache. This is a Next.js caching behavior.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for information on how to contribute to this project.
