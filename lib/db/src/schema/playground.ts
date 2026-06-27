import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const playgroundsTable = pgTable("playgrounds", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  language: text("language").notNull(),
  isPublic: boolean("is_public").notNull().default(false),
  visitorId: text("visitor_id").notNull(),
  authorName: text("author_name").notNull().default("Anonymous"),
  forkedFromId: integer("forked_from_id"),
  views: integer("views").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const playgroundFilesTable = pgTable("playground_files", {
  id: serial("id").primaryKey(),
  playgroundId: integer("playground_id")
    .notNull()
    .references(() => playgroundsTable.id, { onDelete: "cascade" }),
  filename: text("filename").notNull(),
  content: text("content").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const playgroundSharesTable = pgTable("playground_shares", {
  id: serial("id").primaryKey(),
  playgroundId: integer("playground_id")
    .notNull()
    .references(() => playgroundsTable.id, { onDelete: "cascade" }),
  shareToken: text("share_token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPlaygroundSchema = createInsertSchema(playgroundsTable).omit({
  id: true,
  views: true,
  createdAt: true,
  updatedAt: true,
});

export type Playground = typeof playgroundsTable.$inferSelect;
export type PlaygroundFile = typeof playgroundFilesTable.$inferSelect;
export type PlaygroundShare = typeof playgroundSharesTable.$inferSelect;
