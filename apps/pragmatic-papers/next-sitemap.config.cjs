/* eslint-disable no-undef */
const SITE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  'https://example.com'

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: SITE_URL,
  generateRobotsTxt: true,
  exclude: ['/articles-sitemap.xml', '/pages-sitemap.xml', '/volumes-sitemap.xml', '/*', '/volumes/*', '/articles/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        disallow: '/admin/*',
      },
    ],
    additionalSitemaps: [`${SITE_URL}/pages-sitemap.xml`, `${SITE_URL}/articles-sitemap.xml`, `${SITE_URL}/volumes-sitemap.xml`],
  },
}
