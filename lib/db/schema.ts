import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const partnerApplications = sqliteTable("partner_applications", {
  id: text("id").primaryKey(),
  createdAt: text("created_at").notNull(),
  organizationName: text("organization_name").notNull(),
  contactName: text("contact_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  instagram: text("instagram").notNull(),
  websiteMode: text("website_mode", { enum: ["has_site", "no_site"] }).notNull(),
  websiteUrl: text("website_url"),
  operatingSince: text("operating_since").notNull(),
  missionDescription: text("mission_description").notNull(),
  proofLinks: text("proof_links").notNull(),
  additionalNotes: text("additional_notes"),
  status: text("status", { enum: ["pending", "reviewed", "accepted", "rejected"] })
    .notNull()
    .default("pending"),
});

export const adminUsers = sqliteTable("admin_users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: text("created_at").notNull(),
});

export const contactRequests = sqliteTable("contact_requests", {
  id: text("id").primaryKey(),
  createdAt: text("created_at").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message").notNull(),
  status: text("status", { enum: ["pending", "reviewed", "closed"] })
    .notNull()
    .default("pending"),
});

export type PartnerApplication = typeof partnerApplications.$inferSelect;
export type NewPartnerApplication = typeof partnerApplications.$inferInsert;
export type AdminUser = typeof adminUsers.$inferSelect;
export type ContactRequest = typeof contactRequests.$inferSelect;
