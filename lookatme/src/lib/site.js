/**
 * Site-wide configuration that depends on the deployment.
 *
 * `NEXT_PUBLIC_SITE_URL` (e.g. https://example.com) is needed for absolute
 * URLs in the sitemap and social previews. No production domain is
 * configured in this repository, so nothing is invented here: when the
 * variable is unset the sitemap and metadata fall back to localhost.
 */
const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");

export const siteUrlConfigured = Boolean(configured);
export const siteUrl = configured || "http://localhost:3000";
