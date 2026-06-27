import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import { article } from "./blog-article-builder.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const content = article({
  lede: `Django was the first Python web framework I shipped to production. Not because it was trendy — because a client already had a Django admin from a previous contractor and we had six weeks to extend it. If you are starting from zero in 2026, the same reasons still apply: batteries included, clear conventions, and a path from tutorial project to real deployment without assembling fifteen micro-libraries first.`,
  sections: [
    {
      title: "What Django gives you on day one",
      paragraphs: [
        `Django is a **full-stack web framework** for Python. You get URL routing, an ORM, migrations, form handling, user authentication, and an admin panel — not as optional plugins, but as part of the default toolkit. That opinionated stack trades flexibility for speed when you are building CRUD-heavy apps: internal tools, content sites, membership portals, and JSON APIs via Django REST Framework.`,
        `The architecture is **MVT** (Model–View–Template). Models describe database tables. Views contain request/response logic. Templates render HTML. If you have used MVC in other frameworks, MVT maps closely — the "controller" role is split between the URL dispatcher and the view.`,
      ],
      bullets: [
        "Admin panel for non-technical users to manage content",
        "Built-in protection against common web attacks (CSRF, SQL injection via ORM, XSS helpers in templates)",
        "Mature ecosystem: DRF, Celery, django-allauth, Wagtail",
      ],
    },
    {
      title: "Install Python and create a virtual environment",
      paragraphs: [
        `Use Python 3.11 or 3.12 from [python.org](https://www.python.org) or your system package manager. Always work inside a virtual environment so project dependencies do not pollute global Python.`,
      ],
      code: {
        lang: "bash",
        body: `python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\\Scripts\\activate
pip install --upgrade pip
pip install django`,
      },
    },
    {
      title: "Start a project and run the dev server",
      paragraphs: [
        `Django separates a **project** (settings, root URLs) from **apps** (features). One project can contain many apps — \`blog\`, \`accounts\`, \`billing\`.`,
      ],
      code: {
        lang: "bash",
        body: `django-admin startproject mysite
cd mysite
python manage.py startapp blog
python manage.py runserver`,
      },
      paragraphs: [
        `Open [http://127.0.0.1:8000/](http://127.0.0.1:8000/) — you should see the default Django welcome page. Add \`blog\` to \`INSTALLED_APPS\` in \`mysite/settings.py\` before writing models.`,
      ],
    },
    {
      title: "Models, migrations, and the admin",
      paragraphs: [
        `Define a model in \`blog/models.py\`, then create and apply migrations. The admin panel lets you manage rows without writing custom UI first.`,
      ],
      code: {
        lang: "python",
        body: `from django.db import models

class Post(models.Model):
    title = models.CharField(max_length=200)
    body = models.TextField()
    published_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title`,
      },
      numbered: [
        "Run `python manage.py makemigrations` then `python manage.py migrate`",
        "Register the model in `blog/admin.py`",
        "Create a superuser with `python manage.py createsuperuser`",
        "Visit `/admin/` and add a few posts",
      ],
    },
    {
      title: "Views, URLs, and templates",
      paragraphs: [
        `Wire a URL to a view that queries the database and renders a template. Keep business logic in views or services — templates should stay mostly presentational.`,
      ],
      code: {
        lang: "python",
        body: `# blog/views.py
from django.shortcuts import render
from .models import Post

def post_list(request):
    posts = Post.objects.order_by("-published_at")[:20]
    return render(request, "blog/list.html", {"posts": posts})`,
      },
    },
    {
      title: "Where to go next",
      paragraphs: [
        `Once the basics click, explore **class-based views**, **Django REST Framework** for JSON APIs, **environment-based settings** for secrets, and deployment on Fly.io, Railway, or a VPS with Gunicorn + Nginx. Read the official tutorial through once, then build something small you will actually use — a link archive, a team lunch poll, a personal CRM.`,
        `Our [Django learning path](/learn/django-web) walks through models, views, templates, admin, and a capstone blog if you want a structured sequence after this intro.`,
      ],
    },
  ],
  takeaway:
    "Django rewards developers who want conventions and a fast path from model to admin to deployed site. Install it in a venv, build one app end-to-end, and extend from there.",
  credit: "Photo: [Hitesh Choudhary](https://unsplash.com/photos/macbook-pro-on-brown-wooden-table-za6s_1OCpW8) on Unsplash",
});

async function main() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  const readingTime = Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
  const r = await pool.query(
    `UPDATE posts SET content = $1, reading_time = $2, featured_image = $3, updated_at = NOW()
     WHERE slug = 'complete-guide-django-beginners-2026'`,
    [
      content,
      readingTime,
      "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=1200&auto=format&fit=crop",
    ],
  );
  console.log("Updated rows:", r.rowCount, "reading_time:", readingTime);
  await pool.end();
}

main().catch(console.error);
