/**
 * Builds consistently structured markdown articles with headings, sections, and takeaways.
 */
export function article({ lede, sections, takeaway, credit }) {
  const parts = [lede.trim()];

  for (const section of sections) {
    parts.push(`## ${section.title}`, "");

    if (section.paragraphs) {
      for (const p of section.paragraphs) {
        parts.push(p.trim(), "");
      }
    }

    if (section.bullets?.length) {
      parts.push(section.bullets.map((b) => `- ${b}`).join("\n"), "");
    }

    if (section.numbered?.length) {
      parts.push(
        section.numbered.map((b, i) => `${i + 1}. ${b}`).join("\n"),
        "",
      );
    }

    if (section.code) {
      parts.push(
        `\`\`\`${section.code.lang ?? ""}`,
        section.code.body.trim(),
        "```",
        "",
      );
    }

    if (section.table) {
      const { headers, rows } = section.table;
      parts.push(
        `| ${headers.join(" | ")} |`,
        `| ${headers.map(() => "---").join(" | ")} |`,
        ...rows.map((row) => `| ${row.join(" | ")} |`),
        "",
      );
    }

    if (section.quote) {
      parts.push(`> ${section.quote.trim()}`, "");
    }
  }

  parts.push("---", "", `> **Key takeaway:** ${takeaway.trim()}`, "");

  if (credit) {
    parts.push(`*${credit.trim()}*`);
  }

  return parts.join("\n").trim();
}
