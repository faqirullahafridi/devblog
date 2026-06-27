import type { LearnChapter } from "../types";
import { javascriptFundamentalsChapters } from "./javascript-fundamentals";
import { pythonBackendChapters } from "./python-backend";
import { webApisChapters } from "./web-apis";
import { frontendReactChapters } from "./frontend-react";
import { sqlDatabasesChapters } from "./sql-databases";
import { devopsGitChapters } from "./devops-git";
import { languagesPathChapters } from "./paths-languages";
import { frontendPythonPathChapters } from "./paths-frontend-python";
import { nodeDatabasePathChapters } from "./paths-node-databases";
import { devopsApisCsPathChapters } from "./paths-devops-apis-cs";

export const LEARN_CHAPTERS: LearnChapter[] = [
  ...javascriptFundamentalsChapters,
  ...pythonBackendChapters,
  ...webApisChapters,
  ...frontendReactChapters,
  ...sqlDatabasesChapters,
  ...devopsGitChapters,
  ...languagesPathChapters,
  ...frontendPythonPathChapters,
  ...nodeDatabasePathChapters,
  ...devopsApisCsPathChapters,
];

export function getLearnChapter(pathSlug: string, chapterSlug: string) {
  return LEARN_CHAPTERS.find((c) => c.pathSlug === pathSlug && c.slug === chapterSlug);
}

export function getChaptersForPath(pathSlug: string) {
  return LEARN_CHAPTERS.filter((c) => c.pathSlug === pathSlug);
}

export function getLearnChapterHref(pathSlug: string, chapterSlug: string) {
  return `/learn/${pathSlug}/${chapterSlug}`;
}

export const LEARN_CHAPTER_ROUTES = LEARN_CHAPTERS.map((c) =>
  getLearnChapterHref(c.pathSlug, c.slug),
);
