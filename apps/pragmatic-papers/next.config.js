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
    // Disable AVIF to avoid Vary: Accept conflicts with Cloudflare's Free plan cache.
    // Cloudflare ignores Vary headers, so it would serve whichever format it cached first
    // (AVIF or WebP) to all browsers. Payload already converts uploads to WebP at rest,
    // so AVIF re-encoding adds overhead with no meaningful quality benefit.
    formats: ["image/webp"],
    // Safe to use a long TTL because updatedAt is appended to every image URL in
    // getMediaUrl(), providing natural cache busting whenever an image is replaced.
    minimumCacheTTL: 2592000, // 30 days
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
