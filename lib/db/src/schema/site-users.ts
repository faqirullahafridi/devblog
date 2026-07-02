import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";

export const siteUsersTable = pgTable("site_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type SiteUser = typeof siteUsersTable.$inferSelect;
