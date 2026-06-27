import { pgTable, text, serial, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const communityUsersTable = pgTable("community_users", {
  id: serial("id").primaryKey(),
  visitorId: text("visitor_id").notNull().unique(),
  username: text("username").notNull(),
  reputation: integer("reputation").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const communityTagsTable = pgTable("community_tags", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
});

export const communityQuestionsTable = pgTable("community_questions", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  visitorId: text("visitor_id").notNull(),
  authorName: text("author_name").notNull(),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  views: integer("views").notNull().default(0),
  score: integer("score").notNull().default(0),
  acceptedAnswerId: integer("accepted_answer_id"),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const communityAnswersTable = pgTable("community_answers", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id")
    .notNull()
    .references(() => communityQuestionsTable.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  visitorId: text("visitor_id").notNull(),
  authorName: text("author_name").notNull(),
  score: integer("score").notNull().default(0),
  isAccepted: boolean("is_accepted").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const communityVotesTable = pgTable("community_votes", {
  id: serial("id").primaryKey(),
  targetType: text("target_type").notNull(),
  targetId: integer("target_id").notNull(),
  visitorId: text("visitor_id").notNull(),
  value: integer("value").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const communityReportsTable = pgTable("community_reports", {
  id: serial("id").primaryKey(),
  targetType: text("target_type").notNull(),
  targetId: integer("target_id").notNull(),
  reason: text("reason").notNull(),
  visitorId: text("visitor_id"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCommunityQuestionSchema = createInsertSchema(communityQuestionsTable).omit({
  id: true,
  views: true,
  score: true,
  createdAt: true,
  updatedAt: true,
});
export const insertCommunityAnswerSchema = createInsertSchema(communityAnswersTable).omit({
  id: true,
  score: true,
  createdAt: true,
});

export type CommunityUser = typeof communityUsersTable.$inferSelect;
export type CommunityQuestion = typeof communityQuestionsTable.$inferSelect;
export type CommunityAnswer = typeof communityAnswersTable.$inferSelect;
export type CommunityVote = typeof communityVotesTable.$inferSelect;
export type CommunityReport = typeof communityReportsTable.$inferSelect;
