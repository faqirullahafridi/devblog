import { Suspense } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { RouteAnalytics } from "@/components/route-analytics";
import { ScrollToTop } from "@/components/scroll-to-top";
import { SeoDocumentReload } from "@/components/seo-document-reload";
import { PageLoader } from "@/components/page-loader";
import NotFound from "@/pages/not-found";
import * as P from "@/lib/lazy-pages";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 3 * 60_000,
      gcTime: 10 * 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={P.Home} />
        <Route path="/category/:slug" component={P.Category} />
        <Route path="/tag/:slug" component={P.TagPage} />
        <Route path="/post/:slug" component={P.PostPage} />
        <Route path="/search" component={P.Search} />
        <Route path="/about" component={P.About} />
        <Route path="/developer" component={P.Developer} />
        <Route path="/privacy" component={P.Privacy} />
        <Route path="/terms" component={P.Terms} />
        <Route path="/contact" component={P.Contact} />
        <Route path="/newsletter/confirm" component={P.NewsletterConfirm} />
        <Route path="/newsletter/unsubscribe" component={P.NewsletterUnsubscribe} />
        <Route path="/tools" component={P.ToolsIndexPage} />
        <Route path="/tools/json-formatter" component={P.JsonFormatterPage} />
        <Route path="/tools/jwt-decoder" component={P.JwtDecoderPage} />
        <Route path="/tools/regex-tester" component={P.RegexTesterPage} />
        <Route path="/tools/encode-decode" component={P.EncodeDecodePage} />
        <Route path="/tools/timestamp" component={P.TimestampPage} />
        <Route path="/tools/uuid-generator" component={P.UuidGeneratorPage} />
        <Route path="/tools/hash-generator" component={P.HashGeneratorPage} />
        <Route path="/tools/markdown-preview" component={P.MarkdownPreviewPage} />
        <Route path="/tools/sql-formatter" component={P.SqlFormatterPage} />
        <Route path="/tools/color-converter" component={P.ColorConverterPage} />
        <Route path="/tools/cron-parser" component={P.CronParserPage} />
        <Route path="/tools/text-diff" component={P.TextDiffPage} />
        <Route path="/tools/json-to-typescript" component={P.JsonToTypescriptPage} />
        <Route path="/refs" component={P.RefsIndexPage} />
        <Route path="/refs/:slug" component={P.RefDetailPage} />
        <Route path="/snippets" component={P.SnippetsIndexPage} />
        <Route path="/snippets/:slug" component={P.SnippetDetailPage} />
        <Route path="/learn" component={P.LearnIndexPage} />
        <Route path="/learn/:pathSlug/:chapterSlug" component={P.LearnChapterPage} />
        <Route path="/learn/:slug" component={P.LearnDetailPage} />
        <Route path="/interview" component={P.InterviewIndexPage} />
        <Route path="/interview/:slug" component={P.InterviewDetailPage} />
        <Route path="/resources" component={P.ResourcesPage} />
        <Route path="/api-sources" component={P.ApiSourcesPage} />
        <Route path="/ides" component={P.IdesIndexPage} />
        <Route path="/ides/:slug" component={P.IdeDetailPage} />
        <Route path="/templates" component={P.TemplatesIndexPage} />
        <Route path="/templates/trending" component={P.TemplatesTrendingPage} />
        <Route path="/templates/new" component={P.TemplatesNewPage} />
        <Route path="/templates/popular" component={P.TemplatesPopularPage} />
        <Route path="/templates/search" component={P.TemplatesSearchPage} />
        <Route path="/templates/category/:slug" component={P.TemplatesCategoryPage} />
        <Route path="/templates/demo/:slug" component={P.TemplateDemoPage} />
        <Route path="/templates/:slug" component={P.TemplateDetailPage} />
        <Route path="/ai" component={P.AiIndexPage} />
        <Route path="/ai/chat" component={P.AiChatPage} />
        <Route path="/ai/debug" component={P.AiDebugPage} />
        <Route path="/ai/explain" component={P.AiExplainPage} />
        <Route path="/ai/generate" component={P.AiGeneratePage} />
        <Route path="/ai/convert" component={P.AiConvertPage} />
        <Route path="/ai/optimize" component={P.AiOptimizePage} />
        <Route path="/ai/sql" component={P.AiSqlPage} />
        <Route path="/ai/api" component={P.AiApiPage} />
        <Route path="/ai/errors" component={P.AiErrorsPage} />
        <Route path="/playground" component={P.PlaygroundIndexPage} />
        <Route path="/playground/html-css-js" component={P.PlaygroundHtmlPage} />
        <Route path="/playground/python" component={P.PlaygroundPythonPage} />
        <Route path="/playground/sql" component={P.PlaygroundSqlPage} />
        <Route path="/playground/share/:token" component={P.PlaygroundSharePage} />
        <Route path="/playground/:slug" component={P.PlaygroundDetailPage} />
        <Route path="/roadmaps" component={P.RoadmapsIndexPage} />
        <Route path="/roadmaps/generator" component={P.RoadmapGeneratorPage} />
        <Route path="/roadmaps/generated/:id" component={P.RoadmapGeneratedPage} />
        <Route path="/challenges" component={P.ChallengesIndexPage} />
        <Route path="/challenges/leaderboard" component={P.ChallengeLeaderboardPage} />
        <Route path="/challenges/:slug" component={P.ChallengeDetailPage} />
        <Route path="/jobs" component={P.JobsIndexPage} />
        <Route path="/jobs/category/:category" component={P.JobsCategoryPage} />
        <Route path="/jobs/:slug" component={P.JobDetailPage} />
        <Route path="/community" component={P.CommunityIndexPage} />
        <Route path="/community/ask" component={P.CommunityAskPage} />
        <Route path="/community/question/:id" component={P.CommunityQuestionPage} />
        <Route path="/community/tag/:slug" component={P.CommunityTagPage} />
        <Route path="/community/profile/:username" component={P.CommunityProfilePage} />
        <Route path="/signup" component={P.SignupPage} />
        <Route path="/login" component={P.LoginPage} />
        <Route path="/feed.xml" component={SeoDocumentReload} />
        <Route path="/sitemap.xml" component={SeoDocumentReload} />
        <Route path="/robots.txt" component={SeoDocumentReload} />
        <Route path="/admin" component={P.AdminDashboard} />
        <Route path="/admin/login" component={P.AdminLogin} />
        <Route path="/admin/forgot-password" component={P.ForgotPassword} />
        <Route path="/admin/dashboard" component={P.AdminDashboard} />
        <Route path="/admin/posts" component={P.AdminPosts} />
        <Route path="/admin/posts/new" component={P.AdminPostEditor} />
        <Route path="/admin/posts/:id/edit" component={P.AdminPostEditor} />
        <Route path="/admin/categories" component={P.AdminCategories} />
        <Route path="/admin/analytics" component={P.AdminAnalytics} />
        <Route path="/admin/platform" component={P.AdminPlatform} />
        <Route path="/admin/jobs" component={P.AdminJobs} />
        <Route path="/admin/jobs/new" component={P.AdminJobEditor} />
        <Route path="/admin/jobs/:id/edit" component={P.AdminJobEditor} />
        <Route path="/admin/challenges" component={P.AdminChallenges} />
        <Route path="/admin/challenges/new" component={P.AdminChallengeEditor} />
        <Route path="/admin/challenges/:id/edit" component={P.AdminChallengeEditor} />
        <Route path="/admin/subscribers" component={P.AdminSubscribers} />
        <Route path="/admin/comments" component={P.AdminComments} />
        <Route path="/admin/settings" component={P.AdminSettings} />
        <Route path="/admin/profile" component={P.AdminProfile} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider delayDuration={300}>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <ScrollToTop />
            <RouteAnalytics />
            <Router />
          </WouterRouter>
          <Toaster position="bottom-right" />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
