import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import Category from "@/pages/category";
import PostPage from "@/pages/post";
import Search from "@/pages/search";

import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminPosts from "@/pages/admin/posts/index";
import AdminPostEditor from "@/pages/admin/posts/editor";
import AdminCategories from "@/pages/admin/categories";
import AdminAnalytics from "@/pages/admin/analytics";
import AdminSubscribers from "@/pages/admin/subscribers";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/category/:slug" component={Category} />
      <Route path="/post/:slug" component={PostPage} />
      <Route path="/search" component={Search} />

      {/* Admin Routes */}
      <Route path="/admin" component={() => <AdminDashboard />} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/posts" component={AdminPosts} />
      <Route path="/admin/posts/new" component={AdminPostEditor} />
      <Route path="/admin/posts/:id/edit" component={AdminPostEditor} />
      <Route path="/admin/categories" component={AdminCategories} />
      <Route path="/admin/analytics" component={AdminAnalytics} />
      <Route path="/admin/subscribers" component={AdminSubscribers} />

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
            <Router />
          </WouterRouter>
          <Toaster position="bottom-right" />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
