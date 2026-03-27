import { withPayload } from "@payloadcms/next/withPayload"

import redirects from "./redirects.js"

const NEXT_PUBLIC_SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.__NEXT_PRIVATE_ORIGIN ||
    process.env.NEXT_PUBLIC_SERVER_URL ||
    "http://localhost:3000"

const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://example.com"

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    qualities: [80],
    remotePatterns: [
      ...[NEXT_PUBLIC_SERVER_URL, NEXT_PUBLIC_SUPABASE_URL].map((item) => {
        const url = new URL(item)

        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(":", ""),
        }
      }),
    ],
  },
  reactStrictMode: true,
  redirects,
  async headers() {
    return [
      {
        // Font files are stable (no hash in filename) — cache for 1 year.
        // On a font version bump, purge Cloudflare cache manually or change the filename.
        // CORS headers allow cross-domain consumption (e.g. ActBlue embeds).
        // Licensed under Florian Karsten Typefaces Enterprise EULA — unlimited domain self-hosting permitted.
        source: "/fonts/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "CDN-Cache-Control",
            value: "max-age=31536000, immutable",
          },
        ],
      },
      {
        // font-service.css references a stable font URL — cache for 1 year.
        // Purge Cloudflare cache if the @font-face declaration changes.
        source: "/font-service.css",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "CDN-Cache-Control",
            value: "max-age=31536000, immutable",
          },
        ],
      },
      {
        // Payload admin panel: never cache — always requires a fresh authenticated response.
        // CDN-Cache-Control is Vercel-specific and prevents edge caching in addition to the browser.
        source: "/admin/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-cache, no-store, must-revalidate",
          },
          {
            key: "CDN-Cache-Control",
            value: "no-store",
          },
        ],
      },
      {
        // API routes are dynamic and may be authenticated; bypass all caching layers.
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-cache, no-store, must-revalidate",
          },
          {
            key: "CDN-Cache-Control",
            value: "no-store",
          },
        ],
      },
      {
        // Public pages: cache aggressively at the CDN edge for anonymous visitors.
        // s-maxage=600 — CDN serves cached response for 10 minutes.
        // stale-while-revalidate=86400 — CDN may serve stale for up to 24h while revalidating in the background.
        // Only applies when both Payload cookies are absent; logged-in editors and draft-preview
        // sessions bypass this rule and always hit the origin with fresh responses.
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=600, stale-while-revalidate=86400",
          },
          {
            key: "CDN-Cache-Control",
            value: "max-age=600, stale-while-revalidate=86400",
          },
        ],
        missing: [
          {
            // Draft preview bypass cookie set by Payload's preview mode.
            type: "cookie",
            key: "__prerender_bypass",
          },
          {
            // Payload auth token — present when an editor is logged in.
            type: "cookie",
            key: "payload-token",
          },
        ],
      },
    ]
  },
  turbopack: {
    resolveExtensions: [".mdx", ".tsx", ".ts", ".jsx", ".js", ".mjs", ".json"],
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
