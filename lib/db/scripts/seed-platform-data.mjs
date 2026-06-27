/**
 * Seed platform data: job categories, sample jobs, and coding challenges.
 *
 * Usage:
 *   pnpm --filter @workspace/db run seed:platform
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const JOB_CATEGORIES = [
  { slug: "frontend", name: "Frontend", description: "React, Vue, CSS, and UI engineering roles" },
  { slug: "backend", name: "Backend", description: "APIs, databases, and server-side development" },
  { slug: "full-stack", name: "Full Stack", description: "End-to-end product engineering" },
  { slug: "react", name: "React", description: "React-focused developer positions" },
  { slug: "nodejs", name: "Node.js", description: "JavaScript runtime and backend roles" },
  { slug: "python", name: "Python", description: "Django, Flask, and data engineering with Python" },
  { slug: "django", name: "Django", description: "Django web framework roles" },
  { slug: "devops", name: "DevOps", description: "CI/CD, cloud, and infrastructure" },
  { slug: "qa", name: "QA", description: "Quality assurance and test automation" },
  { slug: "remote", name: "Remote", description: "Fully remote developer jobs" },
];

const JOBS = [
  {
    slug: "senior-react-engineer-acme",
    title: "Senior React Engineer",
    company: "Acme Labs",
    description: "Build design-system-driven product UI with React 19, TypeScript, and Tailwind. Collaborate with design and backend teams on performance and accessibility.",
    requirements: "5+ years React\nTypeScript\nTesting (Vitest/RTL)\nREST or GraphQL APIs",
    location: "Remote (US/EU)",
    remote: true,
    salaryRange: "$140k–$175k",
    category: "react",
    applyUrl: "https://example.com/jobs/senior-react-engineer",
  },
  {
    slug: "nodejs-backend-developer",
    title: "Node.js Backend Developer",
    company: "Streamline IO",
    description: "Design and maintain Express services, PostgreSQL schemas, and background workers. Own API reliability and observability.",
    requirements: "Node.js / Express\nPostgreSQL\nRedis\nDocker",
    location: "Remote",
    remote: true,
    salaryRange: "$120k–$150k",
    category: "nodejs",
    applyUrl: "https://example.com/jobs/nodejs-backend",
  },
  {
    slug: "full-stack-developer-startup",
    title: "Full Stack Developer",
    company: "LaunchPad",
    description: "Ship features across React frontend and Node/Postgres backend in a small product team. Strong ownership from spec to deploy.",
    requirements: "React + Node\nSQL\nGit\nStartup experience a plus",
    location: "Hybrid — Austin, TX",
    remote: false,
    salaryRange: "$110k–$140k",
    category: "full-stack",
    applyUrl: "https://example.com/jobs/full-stack",
  },
  {
    slug: "python-data-engineer",
    title: "Python Data Engineer",
    company: "DataForge",
    description: "Build ETL pipelines, data models, and analytics APIs using Python, SQL, and cloud warehouses.",
    requirements: "Python\nSQL\nAirflow or similar\nAWS/GCP",
    location: "Remote",
    remote: true,
    salaryRange: "$130k–$160k",
    category: "python",
    applyUrl: "https://example.com/jobs/python-data-engineer",
  },
  {
    slug: "devops-engineer-platform",
    title: "DevOps Engineer",
    company: "CloudNest",
    description: "Maintain Kubernetes clusters, CI/CD pipelines, and infrastructure-as-code for a developer platform.",
    requirements: "Kubernetes\nTerraform\nGitHub Actions\nMonitoring",
    location: "Remote (Global)",
    remote: true,
    salaryRange: "$125k–$155k",
    category: "devops",
    applyUrl: "https://example.com/jobs/devops",
  },
];

const CHALLENGES = [
  {
    slug: "two-sum",
    title: "Two Sum",
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume each input has exactly one solution.

**Example:** \`nums = [2,7,11,15], target = 9\` → \`[0,1]\``,
    difficulty: "Easy",
    category: "Algorithms",
    starterCode: `function twoSum(nums, target) {
  // return [i, j]
}`,
    solutionCode: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (map.has(need)) return [map.get(need), i];
    map.set(nums[i], i);
  }
  return [];
}`,
    testCases: [
      { input: "[[2,7,11,15],9]", expected: "[0,1]" },
      { input: "[[3,2,4],6]", expected: "[1,2]" },
      { input: "[[3,3],6]", expected: "[0,1]", hidden: true },
    ],
    points: 10,
    isDaily: true,
  },
  {
    slug: "reverse-string",
    title: "Reverse String",
    description: "Write a function that reverses a string in-place style (return a new reversed string).",
    difficulty: "Easy",
    category: "JavaScript",
    starterCode: `function reverseString(str) {
  return str;
}`,
    solutionCode: `function reverseString(str) {
  return str.split("").reverse().join("");
}`,
    testCases: [
      { input: '["hello"]', expected: '"olleh"' },
      { input: '["devtool"]', expected: '"lootved"' },
    ],
    points: 5,
  },
  {
    slug: "fizzbuzz",
    title: "FizzBuzz",
    description: "Return an array of strings from 1 to n. Multiples of 3 → `Fizz`, 5 → `Buzz`, both → `FizzBuzz`.",
    difficulty: "Easy",
    category: "JavaScript",
    starterCode: `function fizzBuzz(n) {
  return [];
}`,
    solutionCode: `function fizzBuzz(n) {
  const out = [];
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) out.push("FizzBuzz");
    else if (i % 3 === 0) out.push("Fizz");
    else if (i % 5 === 0) out.push("Buzz");
    else out.push(String(i));
  }
  return out;
}`,
    testCases: [
      { input: "[5]", expected: '["1","2","Fizz","4","Buzz"]' },
      { input: "[15]", expected: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]', hidden: true },
    ],
    points: 10,
  },
  {
    slug: "valid-parentheses",
    title: "Valid Parentheses",
    description: "Given a string containing `()`, `{}`, and `[]`, determine if the input is valid.",
    difficulty: "Medium",
    category: "Data Structures",
    starterCode: `function isValid(s) {
  return false;
}`,
    solutionCode: `function isValid(s) {
  const stack = [];
  const map = { ")": "(", "]": "[", "}": "{" };
  for (const ch of s) {
    if (ch === "(" || ch === "[" || ch === "{") stack.push(ch);
    else {
      if (stack.pop() !== map[ch]) return false;
    }
  }
  return stack.length === 0;
}`,
    testCases: [
      { input: '["()"]', expected: "true" },
      { input: '["()[]{}"]', expected: "true" },
      { input: '["(]"]', expected: "false" },
    ],
    points: 15,
  },
];

async function upsertJobCategory(pool, cat) {
  await pool.query(
    `INSERT INTO job_categories (slug, name, description)
     VALUES ($1, $2, $3)
     ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description`,
    [cat.slug, cat.name, cat.description],
  );
}

async function upsertJob(pool, job) {
  const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  await pool.query(
    `INSERT INTO jobs (slug, title, company, description, requirements, location, remote, salary_range, category, apply_url, is_active, expires_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,true,$11)
     ON CONFLICT (slug) DO UPDATE SET
       title = EXCLUDED.title,
       company = EXCLUDED.company,
       description = EXCLUDED.description,
       requirements = EXCLUDED.requirements,
       location = EXCLUDED.location,
       remote = EXCLUDED.remote,
       salary_range = EXCLUDED.salary_range,
       category = EXCLUDED.category,
       apply_url = EXCLUDED.apply_url,
       is_active = true,
       expires_at = EXCLUDED.expires_at,
       updated_at = NOW()`,
    [
      job.slug,
      job.title,
      job.company,
      job.description,
      job.requirements,
      job.location,
      job.remote,
      job.salaryRange,
      job.category,
      job.applyUrl,
      expiresAt,
    ],
  );
}

async function upsertChallenge(pool, ch) {
  const dailyDate = ch.isDaily ? new Date().toISOString().split("T")[0] : null;
  await pool.query(
    `INSERT INTO challenges (slug, title, description, difficulty, category, starter_code, solution_code, test_cases, points, is_daily, daily_date)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     ON CONFLICT (slug) DO UPDATE SET
       title = EXCLUDED.title,
       description = EXCLUDED.description,
       difficulty = EXCLUDED.difficulty,
       category = EXCLUDED.category,
       starter_code = EXCLUDED.starter_code,
       solution_code = EXCLUDED.solution_code,
       test_cases = EXCLUDED.test_cases,
       points = EXCLUDED.points,
       is_daily = EXCLUDED.is_daily,
       daily_date = EXCLUDED.daily_date`,
    [
      ch.slug,
      ch.title,
      ch.description,
      ch.difficulty,
      ch.category,
      ch.starterCode,
      ch.solutionCode,
      JSON.stringify(ch.testCases),
      ch.points,
      ch.isDaily ?? false,
      dailyDate,
    ],
  );
}

async function main() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes("localhost") ? undefined : { rejectUnauthorized: false },
  });

  try {
    for (const cat of JOB_CATEGORIES) {
      await upsertJobCategory(pool, cat);
    }
    console.log(`Seeded ${JOB_CATEGORIES.length} job categories`);

    for (const job of JOBS) {
      await upsertJob(pool, job);
    }
    console.log(`Seeded ${JOBS.length} jobs`);

    for (const ch of CHALLENGES) {
      await upsertChallenge(pool, ch);
    }
    console.log(`Seeded ${CHALLENGES.length} challenges`);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
