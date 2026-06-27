import { pgTable, text, serial, timestamp, integer, boolean, jsonb, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export type ChallengeTestCase = {
  input: string;
  expected: string;
  hidden?: boolean;
};

export const challengesTable = pgTable("challenges", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull(),
  category: text("category").notNull(),
  starterCode: text("starter_code").notNull().default(""),
  solutionCode: text("solution_code"),
  testCases: jsonb("test_cases").$type<ChallengeTestCase[]>().notNull().default([]),
  points: integer("points").notNull().default(10),
  isDaily: boolean("is_daily").notNull().default(false),
  dailyDate: date("daily_date"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const challengeSubmissionsTable = pgTable("challenge_submissions", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id")
    .notNull()
    .references(() => challengesTable.id, { onDelete: "cascade" }),
  visitorId: text("visitor_id").notNull(),
  authorName: text("author_name").notNull().default("Anonymous"),
  code: text("code").notNull(),
  language: text("language").notNull().default("javascript"),
  passed: boolean("passed").notNull().default(false),
  score: integer("score").notNull().default(0),
  runtimeMs: integer("runtime_ms"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const challengeScoresTable = pgTable("challenge_scores", {
  id: serial("id").primaryKey(),
  visitorId: text("visitor_id").notNull().unique(),
  authorName: text("author_name").notNull().default("Anonymous"),
  totalPoints: integer("total_points").notNull().default(0),
  challengesSolved: integer("challenges_solved").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const challengeStreaksTable = pgTable("challenge_streaks", {
  id: serial("id").primaryKey(),
  visitorId: text("visitor_id").notNull().unique(),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastActivityDate: date("last_activity_date"),
});

export const insertChallengeSchema = createInsertSchema(challengesTable).omit({ id: true, createdAt: true });

export type Challenge = typeof challengesTable.$inferSelect;
export type ChallengeSubmission = typeof challengeSubmissionsTable.$inferSelect;
export type ChallengeScore = typeof challengeScoresTable.$inferSelect;
export type ChallengeStreak = typeof challengeStreaksTable.$inferSelect;
