import { pgTable, text, serial, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export type RoadmapStep = {
  key: string;
  title: string;
  description: string;
  learnHref?: string;
  blogSlugs?: string[];
  interviewTopic?: string;
  estimatedWeeks: number;
};

export type RoadmapPayload = {
  goal: string;
  currentLevel: string;
  title: string;
  summary: string;
  totalWeeks: number;
  steps: RoadmapStep[];
  resources: Array<{ title: string; href: string; type: string }>;
};

export const roadmapsTable = pgTable("roadmaps", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  visitorId: text("visitor_id").notNull(),
  currentLevel: text("current_level").notNull(),
  goal: text("goal").notNull(),
  title: text("title").notNull(),
  payload: jsonb("payload").$type<RoadmapPayload>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const roadmapProgressTable = pgTable("roadmap_progress", {
  id: serial("id").primaryKey(),
  roadmapId: integer("roadmap_id")
    .notNull()
    .references(() => roadmapsTable.id, { onDelete: "cascade" }),
  itemKey: text("item_key").notNull(),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const insertRoadmapSchema = createInsertSchema(roadmapsTable).omit({ id: true, createdAt: true });

export type Roadmap = typeof roadmapsTable.$inferSelect;
export type RoadmapProgress = typeof roadmapProgressTable.$inferSelect;
