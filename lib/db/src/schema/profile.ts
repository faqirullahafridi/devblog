import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";

export type ProfileWorkExperience = {
  title: string;
  company: string;
  period: string;
  bullets: string[];
};

export type ProfileEducation = {
  degree: string;
  institution: string;
  period: string;
};

export type ProfileProject = {
  name: string;
  description: string;
};

export type ProfileSkillGroup = {
  category: string;
  items: string;
};

export type ProfileLanguage = {
  name: string;
  level: string;
};

export const developerProfileTable = pgTable("developer_profile", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  headline: text("headline"),
  phone: text("phone"),
  email: text("email"),
  location: text("location"),
  portfolioUrl: text("portfolio_url"),
  aboutMe: text("about_me"),
  workExperience: jsonb("work_experience").$type<ProfileWorkExperience[]>().notNull().default([]),
  education: jsonb("education").$type<ProfileEducation[]>().notNull().default([]),
  projects: jsonb("projects").$type<ProfileProject[]>().notNull().default([]),
  technicalSkills: jsonb("technical_skills").$type<ProfileSkillGroup[]>().notNull().default([]),
  languages: jsonb("languages").$type<ProfileLanguage[]>().notNull().default([]),
  status: text("status").notNull().default("published"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});
