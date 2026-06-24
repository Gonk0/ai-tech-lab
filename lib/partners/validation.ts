import { z } from "zod";
import { checkWebsiteUrl } from "./constants";

function normalizeInstagram(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  const handle = trimmed.replace(/^@/, "");
  return `https://instagram.com/${handle}`;
}

function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

const contactFields = {
  organizationName: z
    .string()
    .trim()
    .min(2, "Organization name is required")
    .max(120),
  contactName: z.string().trim().min(2, "Contact name is required").max(80),
  email: z.string().trim().email("Enter a valid email address").max(120),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  instagram: z
    .string()
    .trim()
    .min(2, "Instagram is required")
    .max(120)
    .transform(normalizeInstagram),
  operatingSince: z
    .string()
    .trim()
    .min(2, "Tell us how long you have been active")
    .max(80),
  missionDescription: z
    .string()
    .trim()
    .min(40, "Describe your mission and community work in more detail")
    .max(2000),
  proofLinks: z
    .array(z.string().trim().min(1))
    .min(1, "Add at least one proof link")
    .max(8)
    .transform((links) => links.map(normalizeUrl)),
  additionalNotes: z.string().trim().max(1500).optional().or(z.literal("")),
  confirmsTrackRecord: z.literal(true, {
    message: "Confirm that you can share proof of your work",
  }),
  acceptsTerms: z.literal(true, {
    message: "Accept the partnership conditions to continue",
  }),
};

const hasSiteSchema = z.object({
  ...contactFields,
  websiteMode: z.literal("has_site"),
  websiteUrl: z
    .string()
    .trim()
    .min(1, "Website URL is required")
    .transform(normalizeUrl)
    .superRefine((url, ctx) => {
      const result = checkWebsiteUrl(url);
      if (!result.ok) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: result.reason });
      }
    }),
  confirmsCustomSite: z.literal(true, {
    message: "Confirm your site is not built on WordPress or a page-builder platform",
  }),
});

const noSiteSchema = z.object({
  ...contactFields,
  websiteMode: z.literal("no_site"),
  wantsNewWebsite: z.literal(true, {
    message: "Confirm that you want a website built from scratch",
  }),
});

export const partnerApplicationSchema = z.discriminatedUnion("websiteMode", [
  hasSiteSchema,
  noSiteSchema,
]);

export type PartnerApplicationInput = z.infer<typeof partnerApplicationSchema>;

export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!formatted[key]) {
      formatted[key] = issue.message;
    }
  }

  return formatted;
}
