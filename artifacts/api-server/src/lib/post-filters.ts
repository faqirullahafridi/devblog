import { postsTable } from "@workspace/db";
import { and, eq, or, isNull, lte, sql } from "drizzle-orm";

/** Published posts visible to the public (respects scheduled publishAt). */
export function publishedVisibleCondition() {
  return and(
    eq(postsTable.status, "published"),
    or(isNull(postsTable.publishAt), lte(postsTable.publishAt, sql`now()`)),
  );
}
