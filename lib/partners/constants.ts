const BLOCKED_HOST_PATTERNS = [
  /(^|\.)wordpress\.com$/i,
  /(^|\.)wp\.com$/i,
  /(^|\.)wixsite\.com$/i,
  /(^|\.)wix\.com$/i,
  /(^|\.)squarespace\.com$/i,
  /(^|\.)webflow\.io$/i,
  /(^|\.)weebly\.com$/i,
  /(^|\.)jimdo\.com$/i,
  /(^|\.)godaddysites\.com$/i,
  /(^|\.)myshopify\.com$/i,
  /(^|\.)shopify\.com$/i,
  /(^|\.)blogger\.com$/i,
  /(^|\.)blogspot\.com$/i,
  /(^|\.)tumblr\.com$/i,
  /(^|\.)cargo\.site$/i,
  /(^|\.)format\.com$/i,
  /(^|\.)strikingly\.com$/i,
  /(^|\.)ucoz\./i,
  /(^|\.)yola\.com$/i,
  /(^|\.)site123\.com$/i,
  /(^|\.)webnode\./i,
  /(^|\.)homestead\.com$/i,
  /(^|\.)duda\.co$/i,
  /(^|\.)leadpages\.net$/i,
  /(^|\.)unbouncepages\.com$/i,
  /(^|\.)carrd\.co$/i,
  /(^|\.)notion\.site$/i,
  /(^|\.)framer\.website$/i,
  /(^|\.)framer\.media$/i,
  /(^|\.)hubspot\.com$/i,
  /(^|\.)ghost\.io$/i,
  /(^|\.)substack\.com$/i,
  /(^|\.)medium\.com$/i,
  /(^|\.)linktr\.ee$/i,
  /(^|\.)mystrikingly\.com$/i,
  /(^|\.)webflow\.com$/i,
  /(^|\.)tilda\.cc$/i,
  /(^|\.)tilda\.ws$/i,
  /(^|\.)simplesite\.com$/i,
  /(^|\.)onepage\.me$/i,
  /(^|\.)mozello\.com$/i,
  /(^|\.)webstarts\.com$/i,
];

const BLOCKED_PATH_PATTERNS = [
  /\/wp-content\//i,
  /\/wp-includes\//i,
  /\/wp-admin\//i,
  /\/wp-json\//i,
];

const BLOCKED_HOST_KEYWORDS = [
  "wordpress",
  "wix",
  "squarespace",
  "webflow",
  "weebly",
  "jimdo",
  "shopify",
];

export type WebsiteCheckResult =
  | { ok: true }
  | { ok: false; reason: string };

export function checkWebsiteUrl(rawUrl: string): WebsiteCheckResult {
  let parsed: URL;

  try {
    parsed = new URL(rawUrl);
  } catch {
    return { ok: false, reason: "Enter a valid website URL including https://" };
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return { ok: false, reason: "Website URL must start with http:// or https://" };
  }

  const host = parsed.hostname.toLowerCase();
  const full = parsed.href.toLowerCase();

  for (const pattern of BLOCKED_HOST_PATTERNS) {
    if (pattern.test(host)) {
      return {
        ok: false,
        reason:
          "Template and page-builder platforms are not eligible. We rebuild on a modern custom stack instead.",
      };
    }
  }

  for (const pattern of BLOCKED_PATH_PATTERNS) {
    if (pattern.test(full)) {
      return {
        ok: false,
        reason:
          "WordPress and similar CMS builders are not eligible for this program.",
      };
    }
  }

  for (const keyword of BLOCKED_HOST_KEYWORDS) {
    if (host.includes(keyword)) {
      return {
        ok: false,
        reason:
          "Sites built on WordPress, Wix, Squarespace, Webflow or similar builders cannot be accepted.",
      };
    }
  }

  return { ok: true };
}

export const BLOCKED_PLATFORMS_LABEL =
  "WordPress, Wix, Squarespace, Webflow, Shopify, Weebly, Jimdo, Carrd, Notion sites, and similar paid template or drag-and-drop builders";

export const MODERN_STACK = [
  "Next.js (App Router)",
  "React 19",
  "TypeScript",
  "Tailwind CSS v4",
  "Framer Motion",
  "Edge-ready deployment on Vercel",
] as const;
