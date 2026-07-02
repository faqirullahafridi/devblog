import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { RouteAnalytics } from "@/components/route-analytics";
import { ScrollToTop } from "@/components/scroll-to-top";
import { SeoDocumentReload } from "@/components/seo-document-reload";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import Category from "@/pages/category";
import PostPage from "@/pages/post";
import Search from "@/pages/search";
import About from "@/pages/about";
import TagPage from "@/pages/tag";
import Developer from "@/pages/developer";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import Contact from "@/pages/contact";
import NewsletterConfirm from "@/pages/newsletter-confirm";
import NewsletterUnsubscribe from "@/pages/newsletter-unsubscribe";
import ToolsIndexPage from "@/pages/tools/index";
import JsonFormatterPage from "@/pages/tools/json-formatter";
import JwtDecoderPage from "@/pages/tools/jwt-decoder";
import RegexTesterPage from "@/pages/tools/regex-tester";
import EncodeDecodePage from "@/pages/tools/encode-decode";
import TimestampPage from "@/pages/tools/timestamp";
import UuidGeneratorPage from "@/pages/tools/uuid-generator";
import HashGeneratorPage from "@/pages/tools/hash-generator";
import MarkdownPreviewPage from "@/pages/tools/markdown-preview";
import SqlFormatterPage from "@/pages/tools/sql-formatter";
import ColorConverterPage from "@/pages/tools/color-converter";
import CronParserPage from "@/pages/tools/cron-parser";
import TextDiffPage from "@/pages/tools/text-diff";
import JsonToTypescriptPage from "@/pages/tools/json-to-typescript";
import RefsIndexPage from "@/pages/refs/index";
import RefDetailPage from "@/pages/refs/detail";
import SnippetsIndexPage from "@/pages/snippets/index";
import SnippetDetailPage from "@/pages/snippets/detail";
import LearnIndexPage from "@/pages/learn/index";
import LearnDetailPage from "@/pages/learn/detail";
import LearnChapterPage from "@/pages/learn/chapter";
import InterviewIndexPage from "@/pages/interview/index";
import InterviewDetailPage from "@/pages/interview/detail";
import ResourcesPage from "@/pages/resources/index";
import ApiSourcesPage from "@/pages/api-sources/index";
import IdesIndexPage from "@/pages/ides/index";
import IdeDetailPage from "@/pages/ides/detail";
import TemplatesIndexPage from "@/pages/templates/index";
import TemplatesTrendingPage from "@/pages/templates/trending";
import TemplatesNewPage from "@/pages/templates/new";
import TemplatesPopularPage from "@/pages/templates/popular";
import TemplatesSearchPage from "@/pages/templates/search";
import TemplatesCategoryPage from "@/pages/templates/category";
import TemplateDetailPage from "@/pages/templates/detail";
import TemplateDemoPage from "@/pages/templates/demo";

import AiIndexPage from "@/pages/ai/index";
import AiChatPage from "@/pages/ai/chat";
import AiDebugPage from "@/pages/ai/debug";
import AiExplainPage from "@/pages/ai/explain";
import AiGeneratePage from "@/pages/ai/generate";
import AiConvertPage from "@/pages/ai/convert";
import AiOptimizePage from "@/pages/ai/optimize";
import AiSqlPage from "@/pages/ai/sql";
import AiApiPage from "@/pages/ai/api";
import AiErrorsPage from "@/pages/ai/errors";
import PlaygroundIndexPage from "@/pages/playground/index";
import PlaygroundHtmlPage from "@/pages/playground/html-css-js";
import PlaygroundPythonPage from "@/pages/playground/python";
import PlaygroundSqlPage from "@/pages/playground/sql";
import PlaygroundDetailPage from "@/pages/playground/detail";
import PlaygroundSharePage from "@/pages/playground/share";
import RoadmapsIndexPage from "@/pages/roadmaps/index";
import RoadmapGeneratorPage from "@/pages/roadmaps/generator";
import RoadmapGeneratedPage from "@/pages/roadmaps/generated";
import ChallengesIndexPage from "@/pages/challenges/index";
import ChallengeDetailPage from "@/pages/challenges/detail";
import ChallengeLeaderboardPage from "@/pages/challenges/leaderboard";
import JobsIndexPage from "@/pages/jobs/index";
import JobDetailPage from "@/pages/jobs/detail";
import JobsCategoryPage from "@/pages/jobs/category";
import CommunityIndexPage from "@/pages/community/index";
import CommunityAskPage from "@/pages/community/ask";
import CommunityQuestionPage from "@/pages/community/question";
import CommunityTagPage from "@/pages/community/tag";
import CommunityProfilePage from "@/pages/community/profile";
import SignupPage from "@/pages/signup";
import LoginPage from "@/pages/login";
import AdminPlatform from "@/pages/admin/platform";
import AdminJobs from "@/pages/admin/jobs/index";
import AdminJobEditor from "@/pages/admin/jobs/editor";
import AdminChallenges from "@/pages/admin/challenges/index";
import AdminChallengeEditor from "@/pages/admin/challenges/editor";

import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminPosts from "@/pages/admin/posts/index";
import AdminPostEditor from "@/pages/admin/posts/editor";
import AdminCategories from "@/pages/admin/categories";
import AdminAnalytics from "@/pages/admin/analytics";
import AdminSubscribers from "@/pages/admin/subscribers";
import AdminComments from "@/pages/admin/comments";
import AdminSettings from "@/pages/admin/settings";
import AdminProfile from "@/pages/admin/profile";
import ForgotPassword from "@/pages/admin/forgot-password";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/category/:slug" component={Category} />
      <Route path="/tag/:slug" component={TagPage} />
      <Route path="/post/:slug" component={PostPage} />
      <Route path="/search" component={Search} />
      <Route path="/about" component={About} />
      <Route path="/developer" component={Developer} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/contact" component={Contact} />
      <Route path="/newsletter/confirm" component={NewsletterConfirm} />
      <Route path="/newsletter/unsubscribe" component={NewsletterUnsubscribe} />
      <Route path="/tools" component={ToolsIndexPage} />
      <Route path="/tools/json-formatter" component={JsonFormatterPage} />
      <Route path="/tools/jwt-decoder" component={JwtDecoderPage} />
      <Route path="/tools/regex-tester" component={RegexTesterPage} />
      <Route path="/tools/encode-decode" component={EncodeDecodePage} />
      <Route path="/tools/timestamp" component={TimestampPage} />
      <Route path="/tools/uuid-generator" component={UuidGeneratorPage} />
      <Route path="/tools/hash-generator" component={HashGeneratorPage} />
      <Route path="/tools/markdown-preview" component={MarkdownPreviewPage} />
      <Route path="/tools/sql-formatter" component={SqlFormatterPage} />
      <Route path="/tools/color-converter" component={ColorConverterPage} />
      <Route path="/tools/cron-parser" component={CronParserPage} />
      <Route path="/tools/text-diff" component={TextDiffPage} />
      <Route path="/tools/json-to-typescript" component={JsonToTypescriptPage} />
      <Route path="/refs" component={RefsIndexPage} />
      <Route path="/refs/:slug" component={RefDetailPage} />
      <Route path="/snippets" component={SnippetsIndexPage} />
      <Route path="/snippets/:slug" component={SnippetDetailPage} />
      <Route path="/learn" component={LearnIndexPage} />
      <Route path="/learn/:pathSlug/:chapterSlug" component={LearnChapterPage} />
      <Route path="/learn/:slug" component={LearnDetailPage} />
      <Route path="/interview" component={InterviewIndexPage} />
      <Route path="/interview/:slug" component={InterviewDetailPage} />
      <Route path="/resources" component={ResourcesPage} />
      <Route path="/api-sources" component={ApiSourcesPage} />
      <Route path="/ides" component={IdesIndexPage} />
      <Route path="/ides/:slug" component={IdeDetailPage} />
      <Route path="/templates" component={TemplatesIndexPage} />
      <Route path="/templates/trending" component={TemplatesTrendingPage} />
      <Route path="/templates/new" component={TemplatesNewPage} />
      <Route path="/templates/popular" component={TemplatesPopularPage} />
      <Route path="/templates/search" component={TemplatesSearchPage} />
      <Route path="/templates/category/:slug" component={TemplatesCategoryPage} />
      <Route path="/templates/demo/:slug" component={TemplateDemoPage} />
      <Route path="/templates/:slug" component={TemplateDetailPage} />

      <Route path="/ai" component={AiIndexPage} />
      <Route path="/ai/chat" component={AiChatPage} />
      <Route path="/ai/debug" component={AiDebugPage} />
      <Route path="/ai/explain" component={AiExplainPage} />
      <Route path="/ai/generate" component={AiGeneratePage} />
      <Route path="/ai/convert" component={AiConvertPage} />
      <Route path="/ai/optimize" component={AiOptimizePage} />
      <Route path="/ai/sql" component={AiSqlPage} />
      <Route path="/ai/api" component={AiApiPage} />
      <Route path="/ai/errors" component={AiErrorsPage} />
      <Route path="/playground" component={PlaygroundIndexPage} />
      <Route path="/playground/html-css-js" component={PlaygroundHtmlPage} />
      <Route path="/playground/python" component={PlaygroundPythonPage} />
      <Route path="/playground/sql" component={PlaygroundSqlPage} />
      <Route path="/playground/share/:token" component={PlaygroundSharePage} />
      <Route path="/playground/:slug" component={PlaygroundDetailPage} />
      <Route path="/roadmaps" component={RoadmapsIndexPage} />
      <Route path="/roadmaps/generator" component={RoadmapGeneratorPage} />
      <Route path="/roadmaps/generated/:id" component={RoadmapGeneratedPage} />
      <Route path="/challenges" component={ChallengesIndexPage} />
      <Route path="/challenges/leaderboard" component={ChallengeLeaderboardPage} />
      <Route path="/challenges/:slug" component={ChallengeDetailPage} />
      <Route path="/jobs" component={JobsIndexPage} />
      <Route path="/jobs/category/:category" component={JobsCategoryPage} />
      <Route path="/jobs/:slug" component={JobDetailPage} />
      <Route path="/community" component={CommunityIndexPage} />
      <Route path="/community/ask" component={CommunityAskPage} />
      <Route path="/community/question/:id" component={CommunityQuestionPage} />
      <Route path="/community/tag/:slug" component={CommunityTagPage} />
      <Route path="/community/profile/:username" component={CommunityProfilePage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/login" component={LoginPage} />

      {/* SEO documents — full reload so Vite/API serves XML, not the SPA 404 */}
      <Route path="/feed.xml" component={SeoDocumentReload} />
      <Route path="/sitemap.xml" component={SeoDocumentReload} />
      <Route path="/robots.txt" component={SeoDocumentReload} />

      {/* Admin Routes */}
      <Route path="/admin" component={() => <AdminDashboard />} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/forgot-password" component={ForgotPassword} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/posts" component={AdminPosts} />
      <Route path="/admin/posts/new" component={AdminPostEditor} />
      <Route path="/admin/posts/:id/edit" component={AdminPostEditor} />
      <Route path="/admin/categories" component={AdminCategories} />
      <Route path="/admin/analytics" component={AdminAnalytics} />
      <Route path="/admin/platform" component={AdminPlatform} />
      <Route path="/admin/jobs" component={AdminJobs} />
      <Route path="/admin/jobs/new" component={AdminJobEditor} />
      <Route path="/admin/jobs/:id/edit" component={AdminJobEditor} />
      <Route path="/admin/challenges" component={AdminChallenges} />
      <Route path="/admin/challenges/new" component={AdminChallengeEditor} />
      <Route path="/admin/challenges/:id/edit" component={AdminChallengeEditor} />
      <Route path="/admin/subscribers" component={AdminSubscribers} />
      <Route path="/admin/comments" component={AdminComments} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/admin/profile" component={AdminProfile} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
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
