#!/usr/bin/env node
import { config } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  syncResendTemplates,
  RESEND_TEMPLATE_ALIASES,
} from "../../../api-lib/resend-templates.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
config({ path: resolve(root, ".env") });

async function main() {
  if (!process.env.RESEND_API_KEY?.trim()) {
    console.error("RESEND_API_KEY is not set in .env");
    process.exit(1);
  }

  console.log("Syncing Resend templates...");
  const results = await syncResendTemplates();
  for (const row of results) {
    console.log(`  ${row.action.padEnd(8)} ${row.alias} (${row.id})`);
  }
  console.log("\nDone. Add to .env:");
  console.log("  RESEND_USE_TEMPLATES=1");
  console.log(`  RESEND_TEMPLATE_TRANSACTIONAL=${RESEND_TEMPLATE_ALIASES.transactional}`);
  console.log(`  RESEND_TEMPLATE_OTP=${RESEND_TEMPLATE_ALIASES.otp}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
