import type { LearnChapter, ContentLevel } from "../types";

type ChapterOutline = {
  slug: string;
  title: string;
  description: string;
  level: ContentLevel;
  minutes: number;
  content: string;
};

export function buildPathChapters(pathSlug: string, chapters: ChapterOutline[]): LearnChapter[] {
  return chapters.map((c) => ({ pathSlug, ...c }));
}

export function introChapter(
  pathSlug: string,
  title: string,
  stack: string,
  goals: string[],
  setup: string,
): ChapterOutline {
  return {
    slug: "intro",
    title: `Introduction to ${title}`,
    description: `What ${title} is, why it matters, and how to set up your environment.`,
    level: "beginner",
    minutes: 12,
    content: `## Overview

${stack}

## What you will learn

${goals.map((g) => `- ${g}`).join("\n")}

## Setup

${setup}

## How to use this path

Work through lessons in order. Type every example yourself, break things on purpose, and build the capstone project at the end. Link out to our [snippets](/snippets) and [tools](/tools) when you need quick references.

## Practice

Complete setup, run a hello-world, and bookmark this path's index at \`/learn/${pathSlug}\`.`,
  };
}

export function capstoneChapter(pathSlug: string, title: string, steps: string[]): ChapterOutline {
  return {
    slug: "capstone-project",
    title: "Capstone Project",
    description: `Apply everything in a small real-world ${title} project.`,
    level: "advanced",
    minutes: 45,
    content: `## Capstone: ${title}

Put the lessons together in one project you can add to your portfolio.

${steps.map((s, i) => `### Step ${i + 1}\n\n${s}`).join("\n\n")}

## Next steps

- Review weak chapters
- Read related [references](/refs)
- Try [interview prep](/interview) for this stack
- Write a blog post explaining what you built`,
  };
}
