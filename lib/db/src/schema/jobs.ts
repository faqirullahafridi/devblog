import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const jobCategoriesTable = pgTable("job_categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
});

export const jobsTable = pgTable("jobs", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements").notNull().default(""),
  location: text("location").notNull().default("Remote"),
  remote: boolean("remote").notNull().default(true),
  salaryRange: text("salary_range"),
  category: text("category").notNull(),
  applyUrl: text("apply_url").notNull(),
  source: text("source"),
  externalId: text("external_id"),
  region: text("region").notNull().default("global"),
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const jobBookmarksTable = pgTable("job_bookmarks", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id")
    .notNull()
    .references(() => jobsTable.id, { onDelete: "cascade" }),
  visitorId: text("visitor_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertJobSchema = createInsertSchema(jobsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertJobCategorySchema = createInsertSchema(jobCategoriesTable).omit({ id: true });

export type Job = typeof jobsTable.$inferSelect;
export type JobCategory = typeof jobCategoriesTable.$inferSelect;
export type JobBookmark = typeof jobBookmarksTable.$inferSelect;
