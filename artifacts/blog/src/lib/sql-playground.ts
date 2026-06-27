import sqlWasmUrl from "sql.js/dist/sql-wasm-browser.wasm?url";

type SqlJsStatic = {
  Database: new () => SqlDatabase;
};

type SqlDatabase = {
  run(sql: string): void;
  exec(sql: string): Array<{ columns: string[]; values: unknown[][] }>;
  close(): void;
};

let sqlModulePromise: Promise<SqlJsStatic> | null = null;

async function loadSqlJs(): Promise<SqlJsStatic> {
  if (!sqlModulePromise) {
    const initSqlJs = (await import("sql.js")).default;
    sqlModulePromise = initSqlJs({
      locateFile: (file) => (file.endsWith(".wasm") ? sqlWasmUrl : file),
    });
  }
  return sqlModulePromise;
}

function formatResults(results: Array<{ columns: string[]; values: unknown[][] }>): string {
  if (!results.length) return "(empty result)";

  return results
    .map(({ columns, values }) => {
      if (!values.length) return `${columns.join(" | ")}\n(no rows)`;
      const header = columns.join(" | ");
      const sep = columns.map((c) => "-".repeat(Math.max(c.length, 3))).join("-+-");
      const rows = values.map((row) => row.map((v) => String(v ?? "")).join(" | "));
      return [header, sep, ...rows].join("\n");
    })
    .join("\n\n");
}

export async function runSqlQuery(query: string): Promise<string> {
  const SQL = await loadSqlJs();
  const db = new SQL.Database();
  try {
    db.run(`
      CREATE TABLE users (id INTEGER, name TEXT, role TEXT);
      INSERT INTO users VALUES
        (1,'Alice','Engineer'),
        (2,'Bob','Designer'),
        (3,'Carol','PM'),
        (4,'Dan','DevOps'),
        (5,'Eve','QA');
      CREATE TABLE orders (id INTEGER, user_id INTEGER, amount REAL);
      INSERT INTO orders VALUES (1,1,99.5),(2,1,24.0),(3,2,150.0);
    `);
    return formatResults(db.exec(query));
  } finally {
    db.close();
  }
}
