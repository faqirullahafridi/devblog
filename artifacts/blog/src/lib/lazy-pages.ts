import { lazy, type ComponentType } from "react";

function page<T extends ComponentType<object>>(loader: () => Promise<{ default: T }>) {
  return lazy(loader);
}

/** Eagerly warm a route chunk (call on link hover/focus). */
const warmed = new Set<() => Promise<unknown>>();

export function preloadPage(loader: () => Promise<unknown>) {
  if (warmed.has(loader)) return;
  warmed.add(loader);
  void loader();
}

// ——— Loaders for prefetch ———
export const loaders = {
  home: () => import("@/pages/home"),
  search: () => import("@/pages/search"),
  post: () => import("@/pages/post"),
  category: () => import("@/pages/category"),
  ai: () => import("@/pages/ai/index"),
  aiChat: () => import("@/pages/ai/chat"),
  tools: () => import("@/pages/tools/index"),
  templates: () => import("@/pages/templates/index"),
  learn: () => import("@/pages/learn/index"),
  admin: () => import("@/pages/admin/dashboard"),
} as const;

const pathLoaders: Record<string, () => Promise<unknown>> = {
  "/": loaders.home,
  "/search": loaders.search,
  "/ai": loaders.ai,
  "/ai/chat": loaders.aiChat,
  "/tools": loaders.tools,
  "/templates": loaders.templates,
  "/learn": loaders.learn,
  "/admin": loaders.admin,
  "/admin/dashboard": loaders.admin,
};

export function preloadPath(path: string) {
  const base = path.split("?")[0].split("#")[0];
  const loader = pathLoaders[base];
  if (loader) preloadPage(loader);
}

// ——— Public ———
export const Home = page(loaders.home);
export const Search = page(() => import("@/pages/search"));
export const PostPage = page(() => import("@/pages/post"));
export const Category = page(() => import("@/pages/category"));
export const TagPage = page(() => import("@/pages/tag"));
export const About = page(() => import("@/pages/about"));
export const Developer = page(() => import("@/pages/developer"));
export const Privacy = page(() => import("@/pages/privacy"));
export const Terms = page(() => import("@/pages/terms"));
export const Contact = page(() => import("@/pages/contact"));
export const NewsletterConfirm = page(() => import("@/pages/newsletter-confirm"));
export const NewsletterUnsubscribe = page(() => import("@/pages/newsletter-unsubscribe"));

export const ToolsIndexPage = page(loaders.tools);
export const JsonFormatterPage = page(() => import("@/pages/tools/json-formatter"));
export const JwtDecoderPage = page(() => import("@/pages/tools/jwt-decoder"));
export const RegexTesterPage = page(() => import("@/pages/tools/regex-tester"));
export const EncodeDecodePage = page(() => import("@/pages/tools/encode-decode"));
export const TimestampPage = page(() => import("@/pages/tools/timestamp"));
export const UuidGeneratorPage = page(() => import("@/pages/tools/uuid-generator"));
export const HashGeneratorPage = page(() => import("@/pages/tools/hash-generator"));
export const MarkdownPreviewPage = page(() => import("@/pages/tools/markdown-preview"));
export const SqlFormatterPage = page(() => import("@/pages/tools/sql-formatter"));
export const ColorConverterPage = page(() => import("@/pages/tools/color-converter"));
export const CronParserPage = page(() => import("@/pages/tools/cron-parser"));
export const TextDiffPage = page(() => import("@/pages/tools/text-diff"));
export const JsonToTypescriptPage = page(() => import("@/pages/tools/json-to-typescript"));

export const RefsIndexPage = page(() => import("@/pages/refs/index"));
export const RefDetailPage = page(() => import("@/pages/refs/detail"));
export const SnippetsIndexPage = page(() => import("@/pages/snippets/index"));
export const SnippetDetailPage = page(() => import("@/pages/snippets/detail"));
export const LearnIndexPage = page(loaders.learn);
export const LearnDetailPage = page(() => import("@/pages/learn/detail"));
export const LearnChapterPage = page(() => import("@/pages/learn/chapter"));
export const InterviewIndexPage = page(() => import("@/pages/interview/index"));
export const InterviewDetailPage = page(() => import("@/pages/interview/detail"));
export const ResourcesPage = page(() => import("@/pages/resources/index"));
export const ApiSourcesPage = page(() => import("@/pages/api-sources/index"));
export const IdesIndexPage = page(() => import("@/pages/ides/index"));
export const IdeDetailPage = page(() => import("@/pages/ides/detail"));

export const TemplatesIndexPage = page(loaders.templates);
export const TemplatesTrendingPage = page(() => import("@/pages/templates/trending"));
export const TemplatesNewPage = page(() => import("@/pages/templates/new"));
export const TemplatesPopularPage = page(() => import("@/pages/templates/popular"));
export const TemplatesSearchPage = page(() => import("@/pages/templates/search"));
export const TemplatesCategoryPage = page(() => import("@/pages/templates/category"));
export const TemplateDetailPage = page(() => import("@/pages/templates/detail"));
export const TemplateDemoPage = page(() => import("@/pages/templates/demo"));

export const AiIndexPage = page(loaders.ai);
export const AiChatPage = page(loaders.aiChat);
export const AiDebugPage = page(() => import("@/pages/ai/debug"));
export const AiExplainPage = page(() => import("@/pages/ai/explain"));
export const AiGeneratePage = page(() => import("@/pages/ai/generate"));
export const AiConvertPage = page(() => import("@/pages/ai/convert"));
export const AiOptimizePage = page(() => import("@/pages/ai/optimize"));
export const AiSqlPage = page(() => import("@/pages/ai/sql"));
export const AiApiPage = page(() => import("@/pages/ai/api"));
export const AiErrorsPage = page(() => import("@/pages/ai/errors"));

export const PlaygroundIndexPage = page(() => import("@/pages/playground/index"));
export const PlaygroundHtmlPage = page(() => import("@/pages/playground/html-css-js"));
export const PlaygroundPythonPage = page(() => import("@/pages/playground/python"));
export const PlaygroundSqlPage = page(() => import("@/pages/playground/sql"));
export const PlaygroundDetailPage = page(() => import("@/pages/playground/detail"));
export const PlaygroundSharePage = page(() => import("@/pages/playground/share"));
export const RoadmapsIndexPage = page(() => import("@/pages/roadmaps/index"));
export const RoadmapGeneratorPage = page(() => import("@/pages/roadmaps/generator"));
export const RoadmapGeneratedPage = page(() => import("@/pages/roadmaps/generated"));
export const ChallengesIndexPage = page(() => import("@/pages/challenges/index"));
export const ChallengeDetailPage = page(() => import("@/pages/challenges/detail"));
export const ChallengeLeaderboardPage = page(() => import("@/pages/challenges/leaderboard"));
export const JobsIndexPage = page(() => import("@/pages/jobs/index"));
export const JobDetailPage = page(() => import("@/pages/jobs/detail"));
export const JobsCategoryPage = page(() => import("@/pages/jobs/category"));
export const CommunityIndexPage = page(() => import("@/pages/community/index"));
export const CommunityAskPage = page(() => import("@/pages/community/ask"));
export const CommunityQuestionPage = page(() => import("@/pages/community/question"));
export const CommunityTagPage = page(() => import("@/pages/community/tag"));
export const CommunityProfilePage = page(() => import("@/pages/community/profile"));
export const SignupPage = page(() => import("@/pages/signup"));
export const LoginPage = page(() => import("@/pages/login"));

// ——— Admin ———
export const AdminLogin = page(() => import("@/pages/admin/login"));
export const AdminDashboard = page(loaders.admin);
export const AdminPosts = page(() => import("@/pages/admin/posts/index"));
export const AdminPostEditor = page(() => import("@/pages/admin/posts/editor"));
export const AdminCategories = page(() => import("@/pages/admin/categories"));
export const AdminAnalytics = page(() => import("@/pages/admin/analytics"));
export const AdminPlatform = page(() => import("@/pages/admin/platform"));
export const AdminJobs = page(() => import("@/pages/admin/jobs/index"));
export const AdminJobEditor = page(() => import("@/pages/admin/jobs/editor"));
export const AdminChallenges = page(() => import("@/pages/admin/challenges/index"));
export const AdminChallengeEditor = page(() => import("@/pages/admin/challenges/editor"));
export const AdminSubscribers = page(() => import("@/pages/admin/subscribers"));
export const AdminComments = page(() => import("@/pages/admin/comments"));
export const AdminSettings = page(() => import("@/pages/admin/settings"));
export const AdminProfile = page(() => import("@/pages/admin/profile"));
export const ForgotPassword = page(() => import("@/pages/admin/forgot-password"));
