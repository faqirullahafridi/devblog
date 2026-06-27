export const CATEGORY_TEMPLATE_SPECS: Record<
  string,
  Array<{
    slug: string;
    title: string;
    description: string;
    stack: string[];
    tags: string[];
    trending?: boolean;
    popular?: boolean;
    isNew?: boolean;
  }>
> = {
  ai: [
{
      slug: "ai-saas-landing-page",
      title: "AI SaaS Landing Page",
      description:
        "Free AI SaaS landing page template with hero, feature grid, and pricing sections. Download responsive HTML, CSS, and JavaScript for launching machine-learning products fast.",
      stack: ["HTML", "CSS", "JavaScript", "Tailwind CSS"],
      tags: ["ai", "saas", "landing page", "free", "download", "html"],
      trending: true,
      popular: true,
    },
{
      slug: "react-ai-dashboard-template",
      title: "React AI Dashboard Template",
      description:
        "Modern React AI dashboard template with analytics cards, model metrics, and dark mode. Free download with TypeScript components for building AI admin panels.",
      stack: ["React", "TypeScript", "Tailwind CSS", "JavaScript"],
      tags: ["ai", "dashboard", "react", "typescript", "free", "admin"],
      trending: true,
      isNew: true,
    },
{
      slug: "ai-startup-website-html",
      title: "AI Startup Website HTML",
      description:
        "Clean AI startup website HTML template for pitching generative AI products. Bootstrap 5 layout with CTA blocks, testimonials, and SEO-friendly markup.",
      stack: ["HTML", "CSS", "Bootstrap 5", "JavaScript"],
      tags: ["ai", "startup", "html", "bootstrap", "landing page", "free"],
      popular: true,
      isNew: true,
    },
{
      slug: "ai-chatbot-landing-page",
      title: "AI Chatbot Landing Page",
      description:
        "Conversion-focused AI chatbot landing page template with demo section and FAQ accordion. Download free HTML and CSS for conversational AI product launches.",
      stack: ["HTML", "CSS", "JavaScript", "Tailwind CSS"],
      tags: ["ai", "chatbot", "landing page", "html", "free", "download"],
    },
{
      slug: "machine-learning-portfolio-html",
      title: "Machine Learning Portfolio HTML",
      description:
        "Showcase ML projects with this free machine learning portfolio HTML template. Includes project cards, skills timeline, and responsive grid for data scientists.",
      stack: ["HTML", "CSS", "JavaScript"],
      tags: ["ai", "machine learning", "portfolio", "html", "free", "data science"],
    },
{
      slug: "ai-agency-website-template",
      title: "AI Agency Website Template",
      description:
        "Professional AI agency website template for consultancies selling automation services. Vue-based sections with case studies and contact forms ready to download.",
      stack: ["Vue", "HTML", "CSS", "JavaScript"],
      tags: ["ai", "agency", "website", "vue", "free", "template"],
    },
{
      slug: "free-ai-landing-bootstrap",
      title: "Free AI Landing Bootstrap",
      description:
        "Bootstrap 5 free AI landing page with gradient hero, feature icons, and newsletter signup. Lightweight HTML download for quick AI tool marketing sites.",
      stack: ["HTML", "CSS", "Bootstrap 5", "JavaScript"],
      tags: ["ai", "bootstrap", "landing page", "free", "html", "download"],
    },
{
      slug: "typescript-ai-saas-template",
      title: "TypeScript AI SaaS Template",
      description:
        "TypeScript AI SaaS template with typed React components, pricing toggles, and integration logos. Free download for building scalable AI product landing pages.",
      stack: ["TypeScript", "React", "Tailwind CSS", "JavaScript"],
      tags: ["ai", "saas", "typescript", "react", "free", "template"],
    },
{
      slug: "vue-ai-dashboard-template",
      title: "Vue AI Dashboard Template",
      description:
        "Vue AI dashboard template with chart placeholders, usage stats, and sidebar navigation. Free HTML and Vue download for AI ops and monitoring dashboards.",
      stack: ["Vue", "TypeScript", "CSS", "JavaScript"],
      tags: ["ai", "dashboard", "vue", "typescript", "free", "admin"],
    },
  ],

  saas: [
{
      slug: "saas-pricing-landing-page",
      title: "SaaS Pricing Landing Page",
      description:
        "Free SaaS pricing landing page with monthly and annual toggle, feature comparison table, and CTA banners. Download responsive HTML, CSS, and JavaScript.",
      stack: ["HTML", "CSS", "JavaScript", "Tailwind CSS"],
      tags: ["saas", "pricing", "landing page", "free", "html", "download"],
      trending: true,
      popular: true,
    },
{
      slug: "react-saas-template",
      title: "React SaaS Template",
      description:
        "Full-featured React SaaS template with hero, integrations strip, and testimonial carousel. Free TypeScript download for subscription software websites.",
      stack: ["React", "TypeScript", "Tailwind CSS", "JavaScript"],
      tags: ["saas", "react", "typescript", "template", "free", "website"],
      trending: true,
      isNew: true,
    },
{
      slug: "bootstrap-saas-landing",
      title: "Bootstrap SaaS Landing",
      description:
        "Bootstrap 5 SaaS landing page template with navbar, pricing cards, and footer newsletter. Free HTML download optimized for B2B software launches.",
      stack: ["HTML", "CSS", "Bootstrap 5", "JavaScript"],
      tags: ["saas", "bootstrap", "landing page", "html", "free", "b2b"],
      popular: true,
      isNew: true,
    },
{
      slug: "saas-dashboard-html-template",
      title: "SaaS Dashboard HTML Template",
      description:
        "SaaS dashboard HTML template with sidebar, KPI widgets, and data tables. Free download for admin panels and customer success portals.",
      stack: ["HTML", "CSS", "JavaScript", "Bootstrap 5"],
      tags: ["saas", "dashboard", "html", "admin", "free", "download"],
    },
{
      slug: "vue-saas-starter-template",
      title: "Vue SaaS Starter Template",
      description:
        "Vue SaaS starter template with onboarding flow, feature highlights, and signup forms. Free download with clean Vue 3 components for SaaS MVPs.",
      stack: ["Vue", "TypeScript", "CSS", "JavaScript"],
      tags: ["saas", "vue", "starter", "template", "free", "mvp"],
    },
{
      slug: "typescript-saas-landing-page",
      title: "TypeScript SaaS Landing Page",
      description:
        "TypeScript SaaS landing page built with React and Tailwind CSS. Includes typed props, dark mode, and SEO meta sections—free download for dev teams.",
      stack: ["TypeScript", "React", "Tailwind CSS", "JavaScript"],
      tags: ["saas", "typescript", "landing page", "react", "free", "seo"],
    },
{
      slug: "free-saas-website-download",
      title: "Free SaaS Website Download",
      description:
        "Complete free SaaS website download with landing, pricing, and blog preview pages. Pure HTML and CSS with no framework lock-in for fast deployment.",
      stack: ["HTML", "CSS", "JavaScript"],
      tags: ["saas", "website", "free", "download", "html", "landing page"],
    },
{
      slug: "multi-tier-pricing-saas-html",
      title: "Multi-Tier Pricing SaaS HTML",
      description:
        "Multi-tier pricing SaaS HTML template with highlighted plan, feature matrix, and FAQ. Free Bootstrap download for subscription billing pages.",
      stack: ["HTML", "CSS", "Bootstrap 5", "JavaScript"],
      tags: ["saas", "pricing", "html", "bootstrap", "free", "subscription"],
    },
{
      slug: "saas-onboarding-landing-page",
      title: "SaaS Onboarding Landing Page",
      description:
        "SaaS onboarding landing page template with step wizard UI and progress indicators. Free React download for product-led growth and trial signups.",
      stack: ["React", "JavaScript", "Tailwind CSS", "CSS"],
      tags: ["saas", "onboarding", "landing page", "react", "free", "signup"],
    },
  ],

  portfolio: [
{
      slug: "developer-portfolio-template",
      title: "Developer Portfolio Template",
      description:
        "Free developer portfolio template with projects grid, GitHub links, and skills badges. Download responsive HTML and CSS for software engineer personal sites.",
      stack: ["HTML", "CSS", "JavaScript", "Tailwind CSS"],
      tags: ["portfolio", "developer", "template", "free", "html", "download"],
      trending: true,
      popular: true,
    },
{
      slug: "react-portfolio-website",
      title: "React Portfolio Website",
      description:
        "React portfolio website with animated hero, project cards, and contact form. Free TypeScript download for frontend developers and full-stack engineers.",
      stack: ["React", "TypeScript", "Tailwind CSS", "JavaScript"],
      tags: ["portfolio", "react", "typescript", "website", "free", "developer"],
      trending: true,
      isNew: true,
    },
{
      slug: "designer-portfolio-html",
      title: "Designer Portfolio HTML",
      description:
        "Minimal designer portfolio HTML template with gallery lightbox and case study layouts. Free download for UI/UX designers showcasing visual work.",
      stack: ["HTML", "CSS", "JavaScript"],
      tags: ["portfolio", "designer", "html", "gallery", "free", "ui ux"],
      popular: true,
      isNew: true,
    },
{
      slug: "creative-portfolio-bootstrap",
      title: "Creative Portfolio Bootstrap",
      description:
        "Creative portfolio Bootstrap 5 template with masonry grid and smooth scroll navigation. Free HTML download for photographers and illustrators.",
      stack: ["HTML", "CSS", "Bootstrap 5", "JavaScript"],
      tags: ["portfolio", "creative", "bootstrap", "html", "free", "photography"],
    },
{
      slug: "vue-developer-portfolio",
      title: "Vue Developer Portfolio",
      description:
        "Vue developer portfolio with component-based project sections and dark mode toggle. Free download with Vue 3 and TypeScript for modern dev portfolios.",
      stack: ["Vue", "TypeScript", "CSS", "JavaScript"],
      tags: ["portfolio", "vue", "developer", "typescript", "free", "template"],
    },
{
      slug: "typescript-portfolio-landing",
      title: "TypeScript Portfolio Landing",
      description:
        "TypeScript portfolio landing page with typed project data and SEO headings. React and Tailwind CSS free download for professional personal branding.",
      stack: ["TypeScript", "React", "Tailwind CSS", "JavaScript"],
      tags: ["portfolio", "typescript", "landing page", "react", "free", "seo"],
    },
{
      slug: "free-portfolio-download-html",
      title: "Free Portfolio Download HTML",
      description:
        "Free portfolio download HTML package with about, projects, and resume sections. Lightweight CSS with no build step required for quick publishing.",
      stack: ["HTML", "CSS", "JavaScript"],
      tags: ["portfolio", "free", "download", "html", "resume", "projects"],
    },
{
      slug: "minimal-portfolio-website",
      title: "Minimal Portfolio Website",
      description:
        "Minimal portfolio website template with typography-focused layout and single-page scroll. Free HTML and CSS download for clean developer showcases.",
      stack: ["HTML", "CSS", "JavaScript"],
      tags: ["portfolio", "minimal", "website", "html", "free", "one page"],
    },
{
      slug: "one-page-portfolio-template",
      title: "One Page Portfolio Template",
      description:
        "One page portfolio template with anchor navigation, timeline, and social links. Bootstrap free download ideal for freelancers and consultants.",
      stack: ["HTML", "CSS", "Bootstrap 5", "JavaScript"],
      tags: ["portfolio", "one page", "template", "bootstrap", "free", "freelancer"],
    },
  ],

  startup: [
{
      slug: "startup-landing-page-template",
      title: "Startup Landing Page Template",
      description:
        "Free startup landing page template with hero video placeholder, problem-solution blocks, and investor CTA. Download HTML, CSS, and JavaScript for pitch-ready sites.",
      stack: ["HTML", "CSS", "JavaScript", "Tailwind CSS"],
      tags: ["startup", "landing page", "template", "free", "html", "pitch"],
      trending: true,
      popular: true,
    },
{
      slug: "startup-pitch-deck-site",
      title: "Startup Pitch Deck Site",
      description:
        "Startup pitch deck site template mirroring slide sections—traction, team, and ask. Free React download for founders presenting to angels and VCs.",
      stack: ["React", "TypeScript", "Tailwind CSS", "JavaScript"],
      tags: ["startup", "pitch deck", "react", "typescript", "free", "founders"],
      trending: true,
      isNew: true,
    },
{
      slug: "mvps-landing-html",
      title: "MVP Landing HTML",
      description:
        "MVP landing HTML template for validating ideas fast with email capture and feature list. Free Bootstrap download for lean startup experiments.",
      stack: ["HTML", "CSS", "Bootstrap 5", "JavaScript"],
      tags: ["startup", "mvp", "landing page", "html", "bootstrap", "free"],
      popular: true,
      isNew: true,
    },
{
      slug: "react-startup-website",
      title: "React Startup Website",
      description:
        "React startup website with roadmap timeline, team cards, and press logos strip. Free TypeScript download for seed-stage company marketing sites.",
      stack: ["React", "TypeScript", "Tailwind CSS", "JavaScript"],
      tags: ["startup", "react", "website", "typescript", "free", "marketing"],
    },
{
      slug: "bootstrap-startup-landing",
      title: "Bootstrap Startup Landing",
      description:
        "Bootstrap startup landing page with countdown timer and early-access signup form. Free HTML download for product launch and beta campaigns.",
      stack: ["HTML", "CSS", "Bootstrap 5", "JavaScript"],
      tags: ["startup", "bootstrap", "landing page", "html", "free", "launch"],
    },
{
      slug: "vue-startup-template",
      title: "Vue Startup Template",
      description:
        "Vue startup template with animated counters and investor metrics section. Free Vue 3 download for growth-stage startup homepages.",
      stack: ["Vue", "TypeScript", "CSS", "JavaScript"],
      tags: ["startup", "vue", "template", "typescript", "free", "growth"],
    },
{
      slug: "typescript-startup-landing-page",
      title: "TypeScript Startup Landing Page",
      description:
        "TypeScript startup landing page with typed form validation and schema markup hints. React free download optimized for SEO and conversion.",
      stack: ["TypeScript", "React", "Tailwind CSS", "JavaScript"],
      tags: ["startup", "typescript", "landing page", "react", "free", "seo"],
    },
{
      slug: "free-startup-html-download",
      title: "Free Startup HTML Download",
      description:
        "Free startup HTML download with multi-section layout, FAQ, and footer sitemap. Pure CSS styling with no dependencies for rapid deployment.",
      stack: ["HTML", "CSS", "JavaScript"],
      tags: ["startup", "free", "download", "html", "faq", "landing page"],
    },
{
      slug: "saas-startup-bootstrap-template",
      title: "SaaS Startup Bootstrap Template",
      description:
        "SaaS startup Bootstrap template combining product screenshots and pricing teaser. Free download for B2B software companies raising pre-seed rounds.",
      stack: ["HTML", "CSS", "Bootstrap 5", "JavaScript"],
      tags: ["startup", "saas", "bootstrap", "template", "free", "b2b"],
    },
  ],

  agency: [
{
      slug: "digital-agency-template",
      title: "Digital Agency Template",
      description:
        "Free digital agency template with services grid, portfolio slider, and client logos. Download responsive HTML and CSS for web design studios.",
      stack: ["HTML", "CSS", "JavaScript", "Tailwind CSS"],
      tags: ["agency", "digital", "template", "free", "html", "web design"],
      trending: true,
      popular: true,
    },
{
      slug: "creative-agency-website",
      title: "Creative Agency Website",
      description:
        "Bold creative agency website with fullscreen hero and case study cards. Free React download with TypeScript for branding and design agencies.",
      stack: ["React", "TypeScript", "Tailwind CSS", "JavaScript"],
      tags: ["agency", "creative", "website", "react", "free", "branding"],
      trending: true,
      isNew: true,
    },
{
      slug: "marketing-agency-html",
      title: "Marketing Agency HTML",
      description:
        "Marketing agency HTML template with campaign stats, service packages, and blog preview. Free Bootstrap download for growth and PPC agencies.",
      stack: ["HTML", "CSS", "Bootstrap 5", "JavaScript"],
      tags: ["agency", "marketing", "html", "bootstrap", "free", "growth"],
      popular: true,
      isNew: true,
    },
{
      slug: "react-agency-landing-page",
      title: "React Agency Landing Page",
      description:
        "React agency landing page with testimonial carousel and team bios. Free TypeScript download for boutique creative and dev shops.",
      stack: ["React", "TypeScript", "Tailwind CSS", "JavaScript"],
      tags: ["agency", "react", "landing page", "typescript", "free", "creative"],
    },
{
      slug: "bootstrap-agency-template",
      title: "Bootstrap Agency Template",
      description:
        "Bootstrap agency template with pricing tables for retainer packages and project quotes. Free HTML download for consulting and studio firms.",
      stack: ["HTML", "CSS", "Bootstrap 5", "JavaScript"],
      tags: ["agency", "bootstrap", "template", "html", "free", "consulting"],
    },
{
      slug: "vue-creative-agency-website",
      title: "Vue Creative Agency Website",
      description:
        "Vue creative agency website with parallax sections and portfolio filter. Free Vue 3 download for animation and motion design studios.",
      stack: ["Vue", "TypeScript", "CSS", "JavaScript"],
      tags: ["agency", "vue", "creative", "website", "free", "portfolio"],
    },
{
      slug: "typescript-digital-agency-html",
      title: "TypeScript Digital Agency HTML",
      description:
        "TypeScript digital agency HTML starter with React components for services and contact forms. Free download for modern agency homepages.",
      stack: ["TypeScript", "React", "Tailwind CSS", "JavaScript"],
      tags: ["agency", "typescript", "digital", "react", "free", "contact form"],
    },
{
      slug: "free-agency-website-download",
      title: "Free Agency Website Download",
      description:
        "Complete free agency website download with about, services, work, and contact pages. Pure HTML and CSS optimized for local SEO.",
      stack: ["HTML", "CSS", "JavaScript"],
      tags: ["agency", "free", "download", "website", "html", "seo"],
    },
{
      slug: "portfolio-agency-landing-page",
      title: "Portfolio Agency Landing Page",
      description:
        "Portfolio agency landing page showcasing featured projects and awards. Free Bootstrap download for agencies pitching new client work.",
      stack: ["HTML", "CSS", "Bootstrap 5", "JavaScript"],
      tags: ["agency", "portfolio", "landing page", "bootstrap", "free", "projects"],
    },
  ],

  dashboard: [
{
      slug: "react-admin-dashboard",
      title: "React Admin Dashboard",
      description:
        "Free React admin dashboard with sidebar, data tables, and chart placeholders. TypeScript download for SaaS backends and internal tools.",
      stack: ["React", "TypeScript", "Tailwind CSS", "JavaScript"],
      tags: ["dashboard", "admin", "react", "typescript", "free", "saas"],
      trending: true,
      popular: true,
    },
{
      slug: "school-management-dashboard",
      title: "School Management Dashboard",
      description:
        "School management dashboard template with student roster, attendance widgets, and calendar. Free HTML download for education admin panels.",
      stack: ["HTML", "CSS", "Bootstrap 5", "JavaScript"],
      tags: ["dashboard", "school", "education", "admin", "html", "free"],
      trending: true,
      isNew: true,
    },
{
      slug: "analytics-dashboard-template",
      title: "Analytics Dashboard Template",
      description:
        "Analytics dashboard template with KPI cards, line chart areas, and filter bar. Free React download for business intelligence and reporting UIs.",
      stack: ["React", "TypeScript", "Tailwind CSS", "JavaScript"],
      tags: ["dashboard", "analytics", "template", "react", "free", "charts"],
      popular: true,
      isNew: true,
    },
{
      slug: "bootstrap-admin-dashboard-html",
      title: "Bootstrap Admin Dashboard HTML",
      description:
        "Bootstrap admin dashboard HTML with responsive sidebar collapse and notification dropdown. Free download for lightweight admin interfaces.",
      stack: ["HTML", "CSS", "Bootstrap 5", "JavaScript"],
      tags: ["dashboard", "admin", "bootstrap", "html", "free", "responsive"],
    },
{
      slug: "vue-analytics-dashboard",
      title: "Vue Analytics Dashboard",
      description:
        "Vue analytics dashboard with real-time stats cards and export buttons. Free Vue 3 and TypeScript download for ops and marketing teams.",
      stack: ["Vue", "TypeScript", "CSS", "JavaScript"],
      tags: ["dashboard", "analytics", "vue", "typescript", "free", "stats"],
    },
{
      slug: "typescript-admin-panel-template",
      title: "TypeScript Admin Panel Template",
      description:
        "TypeScript admin panel template with typed routes, user management table, and settings forms. React free download for enterprise dashboards.",
      stack: ["TypeScript", "React", "Tailwind CSS", "JavaScript"],
      tags: ["dashboard", "admin", "typescript", "react", "free", "enterprise"],
    },
{
      slug: "free-dashboard-download-html",
      title: "Free Dashboard Download HTML",
      description:
        "Free dashboard download HTML pack with login page, main dashboard, and profile settings. No framework required—pure CSS grid layout.",
      stack: ["HTML", "CSS", "JavaScript"],
      tags: ["dashboard", "free", "download", "html", "admin", "login"],
    },
{
      slug: "crm-dashboard-react-template",
      title: "CRM Dashboard React Template",
      description:
        "CRM dashboard React template with pipeline view, contact list, and activity feed. Free TypeScript download for sales and customer success tools.",
      stack: ["React", "TypeScript", "Tailwind CSS", "JavaScript"],
      tags: ["dashboard", "crm", "react", "sales", "free", "template"],
    },
{
      slug: "ecommerce-admin-dashboard",
      title: "Ecommerce Admin Dashboard",
      description:
        "Ecommerce admin dashboard with order table, inventory alerts, and revenue summary. Free Bootstrap download for online store backends.",
      stack: ["HTML", "CSS", "Bootstrap 5", "JavaScript"],
      tags: ["dashboard", "ecommerce", "admin", "bootstrap", "free", "orders"],
    },
  ],

  travel: [
{
      slug: "travel-agency-website",
      title: "Travel Agency Website",
      description:
        "Free travel agency website with destination cards, package pricing, and booking CTA. Download responsive HTML, CSS, and JavaScript for tour operators.",
      stack: ["HTML", "CSS", "JavaScript", "Tailwind CSS"],
      tags: ["travel", "agency", "website", "free", "html", "booking"],
      trending: true,
      popular: true,
    },
{
      slug: "hotel-booking-template",
      title: "Hotel Booking Template",
      description:
        "Hotel booking template with date picker UI, room gallery, and amenities list. Free React download for hospitality and lodging websites.",
      stack: ["React", "TypeScript", "Tailwind CSS", "JavaScript"],
      tags: ["travel", "hotel", "booking", "react", "free", "hospitality"],
      trending: true,
      isNew: true,
    },
{
      slug: "tour-operator-landing",
      title: "Tour Operator Landing",
      description:
        "Tour operator landing page with itinerary timeline and guide profiles. Free Bootstrap HTML download for adventure and cultural tour companies.",
      stack: ["HTML", "CSS", "Bootstrap 5", "JavaScript"],
      tags: ["travel", "tour", "landing page", "html", "bootstrap", "free"],
      popular: true,
      isNew: true,
    },
{
      slug: "react-travel-website-template",
      title: "React Travel Website Template",
      description:
        "React travel website template with search bar, featured destinations, and reviews section. Free TypeScript download for modern travel brands.",
      stack: ["React", "TypeScript", "Tailwind CSS", "JavaScript"],
      tags: ["travel", "react", "website", "typescript", "free", "destinations"],
    },
{
      slug: "bootstrap-travel-landing-page",
      title: "Bootstrap Travel Landing Page",
      description:
        "Bootstrap travel landing page with hero slideshow and popular routes grid. Free HTML download optimized for SEO travel keywords.",
      stack: ["HTML", "CSS", "Bootstrap 5", "JavaScript"],
      tags: ["travel", "bootstrap", "landing page", "html", "free", "seo"],
    },
{
      slug: "vue-hotel-booking-html",
      title: "Vue Hotel Booking HTML",
      description:
        "Vue hotel booking HTML template with room comparison table and map placeholder. Free Vue 3 download for boutique hotel chains.",
      stack: ["Vue", "TypeScript", "CSS", "JavaScript"],
      tags: ["travel", "hotel", "vue", "booking", "free", "rooms"],
    },
{
      slug: "typescript-travel-agency-template",
      title: "TypeScript Travel Agency Template",
      description:
        "TypeScript travel agency template with typed package data and filter components. React free download for custom travel portal frontends.",
      stack: ["TypeScript", "React", "Tailwind CSS", "JavaScript"],
      tags: ["travel", "typescript", "agency", "react", "free", "packages"],
    },
{
      slug: "free-travel-website-download",
      title: "Free Travel Website Download",
      description:
        "Free travel website download with blog, gallery, and contact pages included. Pure HTML and CSS for agencies needing a fast online presence.",
      stack: ["HTML", "CSS", "JavaScript"],
      tags: ["travel", "free", "download", "website", "html", "gallery"],
    },
{
      slug: "adventure-tourism-landing-page",
      title: "Adventure Tourism Landing Page",
      description:
        "Adventure tourism landing page with activity icons, safety badges, and group booking form. Free Bootstrap download for outdoor excursion brands.",
      stack: ["HTML", "CSS", "Bootstrap 5", "JavaScript"],
      tags: ["travel", "adventure", "tourism", "landing page", "free", "outdoor"],
    },
  ],

  business: [
{
      slug: "corporate-business-website",
      title: "Corporate Business Website",
      description:
        "Free corporate business website with leadership team, services overview, and news section. Download responsive HTML and CSS for enterprise firms.",
      stack: ["HTML", "CSS", "JavaScript", "Tailwind CSS"],
      tags: ["business", "corporate", "website", "free", "html", "enterprise"],
      trending: true,
      popular: true,
    },
{
      slug: "consulting-firm-template",
      title: "Consulting Firm Template",
      description:
        "Consulting firm template with case studies, methodology steps, and client testimonials. Free React TypeScript download for management consultancies.",
      stack: ["React", "TypeScript", "Tailwind CSS", "JavaScript"],
      tags: ["business", "consulting", "template", "react", "free", "case studies"],
      trending: true,
      isNew: true,
    },
{
      slug: "law-firm-html",
      title: "Law Firm HTML",
      description:
        "Professional law firm HTML template with practice areas, attorney bios, and consultation form. Free Bootstrap download for legal services websites.",
      stack: ["HTML", "CSS", "Bootstrap 5", "JavaScript"],
      tags: ["business", "law firm", "html", "bootstrap", "free", "legal"],
      popular: true,
      isNew: true,
    },
{
      slug: "react-business-website-template",
      title: "React Business Website Template",
      description:
        "React business website template with stats counters and partner logo wall. Free download for B2B companies and professional services firms.",
      stack: ["React", "TypeScript", "Tailwind CSS", "JavaScript"],
      tags: ["business", "react", "website", "b2b", "free", "template"],
    },
{
      slug: "bootstrap-corporate-landing",
      title: "Bootstrap Corporate Landing",
      description:
        "Bootstrap corporate landing page with investor relations link and sustainability section. Free HTML download for publicly traded companies.",
      stack: ["HTML", "CSS", "Bootstrap 5", "JavaScript"],
      tags: ["business", "corporate", "bootstrap", "landing page", "free", "html"],
    },
{
      slug: "vue-consulting-firm-html",
      title: "Vue Consulting Firm HTML",
      description:
        "Vue consulting firm HTML with service accordion and industry expertise tabs. Free Vue 3 download for strategy and advisory businesses.",
      stack: ["Vue", "TypeScript", "CSS", "JavaScript"],
      tags: ["business", "consulting", "vue", "html", "free", "advisory"],
    },
{
      slug: "typescript-business-website",
      title: "TypeScript Business Website",
      description:
        "TypeScript business website with structured data hints and accessible navigation. React free download for SEO-focused corporate sites.",
      stack: ["TypeScript", "React", "Tailwind CSS", "JavaScript"],
      tags: ["business", "typescript", "website", "react", "free", "seo"],
    },
{
      slug: "free-business-template-download",
      title: "Free Business Template Download",
      description:
        "Free business template download with about, services, team, and contact pages. Lightweight HTML and CSS with no build toolchain required.",
      stack: ["HTML", "CSS", "JavaScript"],
      tags: ["business", "free", "download", "template", "html", "contact"],
    },
{
      slug: "professional-services-landing",
      title: "Professional Services Landing",
      description:
        "Professional services landing page for accountants, architects, and engineers. Free Bootstrap download with credentials and certification badges.",
      stack: ["HTML", "CSS", "Bootstrap 5", "JavaScript"],
      tags: ["business", "professional", "services", "landing page", "free", "bootstrap"],
    },
  ],

  resume: [
{
      slug: "developer-resume-template",
      title: "Developer Resume Template",
      description:
        "Free developer resume template with skills matrix, project links, and employment timeline. Download printable HTML and CSS for software engineer CVs.",
      stack: ["HTML", "CSS", "JavaScript"],
      tags: ["resume", "developer", "template", "free", "html", "cv"],
      trending: true,
      popular: true,
    },
{
      slug: "cv-portfolio-html",
      title: "CV Portfolio HTML",
      description:
        "CV portfolio HTML combining resume sections with portfolio project cards. Free download for designers and developers applying to new roles.",
      stack: ["HTML", "CSS", "JavaScript", "Tailwind CSS"],
      tags: ["resume", "cv", "portfolio", "html", "free", "download"],
      trending: true,
      isNew: true,
    },
{
      slug: "one-page-resume-site",
      title: "One Page Resume Site",
      description:
        "One page resume site with anchor nav, education block, and downloadable PDF button. Free Bootstrap HTML for job seekers and freelancers.",
      stack: ["HTML", "CSS", "Bootstrap 5", "JavaScript"],
      tags: ["resume", "one page", "html", "bootstrap", "free", "job search"],
      popular: true,
      isNew: true,
    },
{
      slug: "react-resume-website-template",
      title: "React Resume Website Template",
      description:
        "React resume website template with dark mode and animated skill bars. Free TypeScript download for modern personal CV websites.",
      stack: ["React", "TypeScript", "Tailwind CSS", "JavaScript"],
      tags: ["resume", "react", "website", "typescript", "free", "skills"],
    },
{
      slug: "bootstrap-resume-landing-page",
      title: "Bootstrap Resume Landing Page",
      description:
        "Bootstrap resume landing page with contact form and social profile links. Free HTML download optimized for recruiter-friendly layouts.",
      stack: ["HTML", "CSS", "Bootstrap 5", "JavaScript"],
      tags: ["resume", "bootstrap", "landing page", "html", "free", "recruiter"],
    },
{
      slug: "vue-cv-portfolio-html",
      title: "Vue CV Portfolio HTML",
      description:
        "Vue CV portfolio HTML with tabbed experience and certifications sections. Free Vue 3 download for interactive online resumes.",
      stack: ["Vue", "TypeScript", "CSS", "JavaScript"],
      tags: ["resume", "cv", "vue", "portfolio", "free", "certifications"],
    },
{
      slug: "typescript-resume-template",
      title: "TypeScript Resume Template",
      description:
        "TypeScript resume template with typed resume data model and print stylesheet. React free download for developers building personal sites.",
      stack: ["TypeScript", "React", "Tailwind CSS", "JavaScript"],
      tags: ["resume", "typescript", "template", "react", "free", "print"],
    },
{
      slug: "free-resume-download-html",
      title: "Free Resume Download HTML",
      description:
        "Free resume download HTML with A4 print layout and minimal ink-friendly styling. Pure CSS with no JavaScript dependencies required.",
      stack: ["HTML", "CSS"],
      tags: ["resume", "free", "download", "html", "print", "a4"],
    },
{
      slug: "creative-resume-landing-page",
      title: "Creative Resume Landing Page",
      description:
        "Creative resume landing page with bold typography and color accent blocks. Free Tailwind CSS download for creative industry job applications.",
      stack: ["HTML", "CSS", "Tailwind CSS", "JavaScript"],
      tags: ["resume", "creative", "landing page", "tailwind", "free", "design"],
    },
  ],

  healthcare: [
{
      slug: "medical-clinic-website",
      title: "Medical Clinic Website",
      description:
        "Free medical clinic website with doctor profiles, services list, and appointment CTA. Download responsive HTML and CSS for private practices.",
      stack: ["HTML", "CSS", "JavaScript", "Tailwind CSS"],
      tags: ["healthcare", "medical", "clinic", "website", "free", "html"],
      trending: true,
      popular: true,
    },
{
      slug: "hospital-dashboard-template",
      title: "Hospital Dashboard Template",
      description:
        "Hospital dashboard template with patient queue, bed occupancy, and staff schedule widgets. Free React download for healthcare admin systems.",
      stack: ["React", "TypeScript", "Tailwind CSS", "JavaScript"],
      tags: ["healthcare", "hospital", "dashboard", "react", "free", "admin"],
      trending: true,
      isNew: true,
    },
{
      slug: "telehealth-landing",
      title: "Telehealth Landing",
      description:
        "Telehealth landing page with video consult CTA, insurance badges, and FAQ. Free Bootstrap HTML download for virtual care startups.",
      stack: ["HTML", "CSS", "Bootstrap 5", "JavaScript"],
      tags: ["healthcare", "telehealth", "landing page", "html", "bootstrap", "free"],
      popular: true,
      isNew: true,
    },
{
      slug: "react-healthcare-website",
      title: "React Healthcare Website",
      description:
        "React healthcare website with department cards, patient portal link, and emergency info banner. Free TypeScript download for hospital marketing.",
      stack: ["React", "TypeScript", "Tailwind CSS", "JavaScript"],
      tags: ["healthcare", "react", "website", "typescript", "free", "patient"],
    },
{
      slug: "bootstrap-medical-clinic-html",
      title: "Bootstrap Medical Clinic HTML",
      description:
        "Bootstrap medical clinic HTML with opening hours table and insurance provider logos. Free download for family medicine and urgent care clinics.",
      stack: ["HTML", "CSS", "Bootstrap 5", "JavaScript"],
      tags: ["healthcare", "medical", "bootstrap", "html", "free", "clinic"],
    },
{
      slug: "vue-hospital-landing-page",
      title: "Vue Hospital Landing Page",
      description:
        "Vue hospital landing page with specialty departments grid and find-a-doctor search UI. Free Vue 3 download for regional health networks.",
      stack: ["Vue", "TypeScript", "CSS", "JavaScript"],
      tags: ["healthcare", "hospital", "vue", "landing page", "free", "doctor"],
    },
{
      slug: "typescript-healthcare-template",
      title: "TypeScript Healthcare Template",
      description:
        "TypeScript healthcare template with accessible forms and HIPAA-aware layout patterns. React free download for health tech product sites.",
      stack: ["TypeScript", "React", "Tailwind CSS", "JavaScript"],
      tags: ["healthcare", "typescript", "template", "react", "free", "health tech"],
    },
{
      slug: "free-medical-website-download",
      title: "Free Medical Website Download",
      description:
        "Free medical website download with services, team, and patient resources pages. Pure HTML and CSS for clinics launching online presence quickly.",
      stack: ["HTML", "CSS", "JavaScript"],
      tags: ["healthcare", "medical", "free", "download", "website", "html"],
    },
{
      slug: "dental-clinic-website-template",
      title: "Dental Clinic Website Template",
      description:
        "Dental clinic website template with treatment pricing, before-after gallery, and booking form. Free Bootstrap download for dentists and orthodontists.",
      stack: ["HTML", "CSS", "Bootstrap 5", "JavaScript"],
      tags: ["healthcare", "dental", "clinic", "website", "free", "booking"],
    },
  ],

  restaurant: [
{
      slug: "restaurant-website-template",
      title: "Restaurant Website Template",
      description:
        "Free restaurant website template with menu preview, reservation form, and gallery. Download responsive HTML, CSS, and JavaScript for dining brands.",
      stack: ["HTML", "CSS", "JavaScript", "Tailwind CSS"],
      tags: ["restaurant", "website", "template", "free", "html", "menu"],
      trending: true,
      popular: true,
    },
{
      slug: "cafe-menu-landing",
      title: "Cafe Menu Landing",
      description:
        "Cafe menu landing page with categorized dishes, prices, and daily specials banner. Free Bootstrap HTML download for coffee shops and bistros.",
      stack: ["HTML", "CSS", "Bootstrap 5", "JavaScript"],
      tags: ["restaurant", "cafe", "menu", "landing page", "free", "html"],
      trending: true,
      isNew: true,
    },
{
      slug: "food-delivery-html",
      title: "Food Delivery HTML",
      description:
        "Food delivery HTML template with cart UI, cuisine filters, and order tracking section. Free download for delivery apps and cloud kitchen brands.",
      stack: ["HTML", "CSS", "JavaScript", "Bootstrap 5"],
      tags: ["restaurant", "food delivery", "html", "bootstrap", "free", "order"],
      popular: true,
      isNew: true,
    },
{
      slug: "react-restaurant-website",
      title: "React Restaurant Website",
      description:
        "React restaurant website with interactive menu tabs and reservation modal. Free TypeScript download for upscale dining and franchise locations.",
      stack: ["React", "TypeScript", "Tailwind CSS", "JavaScript"],
      tags: ["restaurant", "react", "website", "typescript", "free", "reservation"],
    },
{
      slug: "bootstrap-cafe-landing-page",
      title: "Bootstrap Cafe Landing Page",
      description:
        "Bootstrap cafe landing page with hero food photography and opening hours widget. Free HTML download optimized for local restaurant SEO.",
      stack: ["HTML", "CSS", "Bootstrap 5", "JavaScript"],
      tags: ["restaurant", "cafe", "bootstrap", "landing page", "free", "seo"],
    },
{
      slug: "vue-food-delivery-template",
      title: "Vue Food Delivery Template",
      description:
        "Vue food delivery template with restaurant cards and promo code banner. Free Vue 3 download for food ordering platform frontends.",
      stack: ["Vue", "TypeScript", "CSS", "JavaScript"],
      tags: ["restaurant", "food delivery", "vue", "template", "free", "ordering"],
    },
{
      slug: "typescript-restaurant-html",
      title: "TypeScript Restaurant HTML",
      description:
        "TypeScript restaurant HTML starter with typed menu items and allergen labels. React free download for modern restaurant web apps.",
      stack: ["TypeScript", "React", "Tailwind CSS", "JavaScript"],
      tags: ["restaurant", "typescript", "html", "react", "free", "menu"],
    },
{
      slug: "free-restaurant-website-download",
      title: "Free Restaurant Website Download",
      description:
        "Free restaurant website download with menu, about, gallery, and contact pages. Pure HTML and CSS—no framework needed for quick launch.",
      stack: ["HTML", "CSS", "JavaScript"],
      tags: ["restaurant", "free", "download", "website", "html", "gallery"],
    },
{
      slug: "fine-dining-landing-page",
      title: "Fine Dining Landing Page",
      description:
        "Fine dining landing page with wine list section, private events CTA, and chef story. Free Tailwind CSS download for premium restaurant brands.",
      stack: ["HTML", "CSS", "Tailwind CSS", "JavaScript"],
      tags: ["restaurant", "fine dining", "landing page", "tailwind", "free", "premium"],
    },
  ],

  "real-estate": [
{
      slug: "real-estate-website",
      title: "Real Estate Website",
      description:
        "Free real estate website with property search bar, featured listings grid, and agent profiles. Download responsive HTML and CSS for brokerages.",
      stack: ["HTML", "CSS", "JavaScript", "Tailwind CSS"],
      tags: ["real estate", "website", "property", "free", "html", "listings"],
      trending: true,
      popular: true,
    },
{
      slug: "property-listing-template",
      title: "Property Listing Template",
      description:
        "Property listing template with photo gallery, specs table, and mortgage calculator UI. Free React TypeScript download for MLS-style sites.",
      stack: ["React", "TypeScript", "Tailwind CSS", "JavaScript"],
      tags: ["real estate", "property", "listing", "react", "free", "mls"],
      trending: true,
      isNew: true,
    },
{
      slug: "realtor-landing-page",
      title: "Realtor Landing Page",
      description:
        "Realtor landing page with sold properties showcase and client testimonials. Free Bootstrap HTML download for independent real estate agents.",
      stack: ["HTML", "CSS", "Bootstrap 5", "JavaScript"],
      tags: ["real estate", "realtor", "landing page", "html", "bootstrap", "free"],
      popular: true,
      isNew: true,
    },
{
      slug: "react-real-estate-template",
      title: "React Real Estate Template",
      description:
        "React real estate template with map placeholder, filter sidebar, and listing cards. Free download for property portal and agency websites.",
      stack: ["React", "TypeScript", "Tailwind CSS", "JavaScript"],
      tags: ["real estate", "react", "template", "typescript", "free", "portal"],
    },
{
      slug: "bootstrap-property-listing-html",
      title: "Bootstrap Property Listing HTML",
      description:
        "Bootstrap property listing HTML with neighborhood info and school district badges. Free download for residential and commercial brokers.",
      stack: ["HTML", "CSS", "Bootstrap 5", "JavaScript"],
      tags: ["real estate", "property", "bootstrap", "html", "free", "broker"],
    },
{
      slug: "vue-realtor-website-template",
      title: "Vue Realtor Website Template",
      description:
        "Vue realtor website template with open house calendar and lead capture forms. Free Vue 3 download for agent personal branding sites.",
      stack: ["Vue", "TypeScript", "CSS", "JavaScript"],
      tags: ["real estate", "realtor", "vue", "website", "free", "leads"],
    },
{
      slug: "typescript-real-estate-landing",
      title: "TypeScript Real Estate Landing",
      description:
        "TypeScript real estate landing with typed listing data and SEO property schema hints. React free download for modern proptech startups.",
      stack: ["TypeScript", "React", "Tailwind CSS", "JavaScript"],
      tags: ["real estate", "typescript", "landing page", "react", "free", "proptech"],
    },
{
      slug: "free-real-estate-download-html",
      title: "Free Real Estate Download HTML",
      description:
        "Free real estate download HTML pack with home, listings, and contact pages. Lightweight CSS grid layout with no build step required.",
      stack: ["HTML", "CSS", "JavaScript"],
      tags: ["real estate", "free", "download", "html", "listings", "contact"],
    },
{
      slug: "luxury-property-website-template",
      title: "Luxury Property Website Template",
      description:
        "Luxury property website template with fullscreen imagery and concierge contact CTA. Free Tailwind CSS download for high-end real estate brands.",
      stack: ["HTML", "CSS", "Tailwind CSS", "JavaScript"],
      tags: ["real estate", "luxury", "property", "website", "free", "premium"],
    },
  ],
};
