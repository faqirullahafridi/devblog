export type ContentLevel = "beginner" | "intermediate" | "advanced";

export type LearnChapter = {
  pathSlug: string;
  slug: string;
  title: string;
  description: string;
  level: ContentLevel;
  minutes: number;
  content: string;
};
