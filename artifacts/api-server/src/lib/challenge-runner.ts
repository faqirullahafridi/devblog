import type { ChallengeTestCase } from "@workspace/db";

export type RunResult = {
  passed: boolean;
  results: Array<{ input: string; expected: string; actual: string; ok: boolean }>;
  error?: string;
  runtimeMs: number;
};

/** Safe-ish JS challenge runner for algorithm-style challenges. */
export function runJavaScriptChallenge(code: string, testCases: ChallengeTestCase[]): RunResult {
  const start = Date.now();
  const visible = testCases.filter((t) => !t.hidden);
  const results: RunResult["results"] = [];

  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function(
      `"use strict";\n${code}\nif (typeof solution !== 'function') throw new Error('Define a function named solution');\nreturn solution;`,
    )();

    if (typeof fn !== "function") {
      return { passed: false, results: [], error: "Code must define a function named `solution`", runtimeMs: Date.now() - start };
    }

    for (const tc of visible.length ? visible : testCases) {
      let input: unknown;
      try {
        input = JSON.parse(tc.input);
      } catch {
        input = tc.input;
      }
      let expected: unknown;
      try {
        expected = JSON.parse(tc.expected);
      } catch {
        expected = tc.expected;
      }

      const args = Array.isArray(input) ? input : [input];
      const actual = fn(...args);
      const ok = JSON.stringify(actual) === JSON.stringify(expected);
      results.push({
        input: tc.input,
        expected: tc.expected,
        actual: JSON.stringify(actual),
        ok,
      });
    }

    return {
      passed: results.every((r) => r.ok),
      results,
      runtimeMs: Date.now() - start,
    };
  } catch (err) {
    return {
      passed: false,
      results,
      error: err instanceof Error ? err.message : String(err),
      runtimeMs: Date.now() - start,
    };
  }
}

export function runSqlChallenge(_code: string, _testCases: ChallengeTestCase[]): RunResult {
  return {
    passed: false,
    results: [],
    error: "SQL challenges are validated in the browser playground with sql.js",
    runtimeMs: 0,
  };
}
