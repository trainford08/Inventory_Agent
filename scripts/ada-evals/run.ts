/**
 * Ada eval harness.
 *
 *   1. Make sure the dev server is running on http://localhost:3000.
 *   2. From the repo root:    npx tsx scripts/ada-evals/run.ts
 *      (or:                    npm run eval:ada — see package.json)
 *
 * Reads scripts/ada-evals/cases.json, fires each case at /api/ada,
 * captures the streamed text + tool calls, scores each case against
 * its expectations, and writes a markdown report alongside the cases.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const CASES_PATH = join(HERE, "cases.json");
const RESULTS_DIR = join(HERE, "results");
const ENDPOINT = process.env.ADA_ENDPOINT ?? "http://localhost:3000/api/ada";

type Case = {
  id: string;
  category: string;
  question: string;
  teamSlug?: string;
  fieldId?: string;
  fieldLabel?: string;
  expectedToolsAny?: string[];
  expectedToolsAll?: string[];
  mustContain?: string[];
  /** "any" (default for refusal-type cases) or "all" */
  mustContainMode?: "any" | "all";
  mustNotContain?: string[];
  maxChars?: number;
};

type Result = {
  case: Case;
  answer: string;
  toolsCalled: string[];
  ok: boolean;
  failures: string[];
  durationMs: number;
};

async function callAda(c: Case): Promise<{
  text: string;
  tools: string[];
  durationMs: number;
}> {
  const body = {
    teamSlug: c.teamSlug ?? null,
    fieldId: c.fieldId ?? null,
    fieldLabel: c.fieldLabel ?? null,
    fieldValue: null,
    messages: [
      {
        id: `m-${c.id}`,
        role: "user",
        parts: [{ type: "text", text: c.question }],
      },
    ],
  };
  const t0 = Date.now();
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok || !res.body) {
    throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  const tools = new Set<string>();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (!json || json === "[DONE]") continue;
      try {
        const obj = JSON.parse(json) as Record<string, unknown>;
        const type = obj.type as string | undefined;
        if (type === "text-delta" && typeof obj.delta === "string") {
          text += obj.delta;
        } else if (typeof type === "string" && type.startsWith("tool-input")) {
          const name = (obj.toolName ?? obj.name) as string | undefined;
          if (name) tools.add(name);
        } else if (
          typeof type === "string" &&
          (type === "tool-call" || type.startsWith("tool-output"))
        ) {
          const name = (obj.toolName ?? obj.name) as string | undefined;
          if (name) tools.add(name);
        }
      } catch {
        /* ignore non-JSON lines */
      }
    }
  }
  return { text, tools: [...tools], durationMs: Date.now() - t0 };
}

function score(c: Case, answer: string, tools: string[]): string[] {
  const failures: string[] = [];
  const a = answer.toLowerCase();
  if (c.expectedToolsAny && c.expectedToolsAny.length > 0) {
    const hit = c.expectedToolsAny.some((t) => tools.includes(t));
    if (!hit)
      failures.push(
        `expected one of [${c.expectedToolsAny.join(", ")}], got [${tools.join(", ") || "none"}]`,
      );
  }
  if (c.expectedToolsAll) {
    for (const t of c.expectedToolsAll)
      if (!tools.includes(t)) failures.push(`missing tool: ${t}`);
  }
  if (c.mustContain && c.mustContain.length) {
    const mode = c.mustContainMode ?? "all";
    if (mode === "all") {
      for (const s of c.mustContain)
        if (!a.includes(s.toLowerCase()))
          failures.push(`missing required substring: "${s}"`);
    } else {
      const hit = c.mustContain.some((s) => a.includes(s.toLowerCase()));
      if (!hit)
        failures.push(
          `none of [${c.mustContain.join(", ")}] present (any-of mode)`,
        );
    }
  }
  if (c.mustNotContain) {
    for (const s of c.mustNotContain)
      if (a.includes(s.toLowerCase()))
        failures.push(`forbidden substring present: "${s}"`);
  }
  if (c.maxChars && answer.length > c.maxChars) {
    failures.push(`answer too long: ${answer.length} > ${c.maxChars}`);
  }
  return failures;
}

function fmtReport(results: Result[]): string {
  const total = results.length;
  const passed = results.filter((r) => r.ok).length;
  const byCat = new Map<string, { pass: number; total: number }>();
  for (const r of results) {
    const cat = r.case.category;
    const cur = byCat.get(cat) ?? { pass: 0, total: 0 };
    cur.total++;
    if (r.ok) cur.pass++;
    byCat.set(cat, cur);
  }
  const lines: string[] = [];
  lines.push(`# Ada eval — ${new Date().toISOString()}`);
  lines.push("");
  lines.push(
    `**${passed}/${total} passed** (${Math.round((passed / total) * 100)}%)`,
  );
  lines.push("");
  lines.push("## By category");
  for (const [cat, s] of byCat) {
    lines.push(
      `- **${cat}** — ${s.pass}/${s.total} (${Math.round((s.pass / s.total) * 100)}%)`,
    );
  }
  lines.push("");
  lines.push("## Cases");
  for (const r of results) {
    const status = r.ok ? "✅" : "❌";
    lines.push(`### ${status} ${r.case.id} _(${r.case.category})_`);
    lines.push("");
    lines.push(`**Q:** ${r.case.question}`);
    if (r.case.teamSlug) lines.push(`**Team:** ${r.case.teamSlug}`);
    lines.push(
      `**Tools:** ${r.toolsCalled.length ? r.toolsCalled.join(", ") : "_none_"} · **${r.durationMs}ms**`,
    );
    if (r.failures.length) {
      lines.push("**Failures:**");
      for (const f of r.failures) lines.push(`- ${f}`);
    }
    lines.push("");
    lines.push("**Answer:**");
    lines.push("```");
    lines.push(r.answer || "_(empty)_");
    lines.push("```");
    lines.push("");
  }
  return lines.join("\n");
}

async function main() {
  const cases = JSON.parse(readFileSync(CASES_PATH, "utf8")) as Case[];
  console.log(`Running ${cases.length} cases against ${ENDPOINT}…`);
  const results: Result[] = [];
  for (const c of cases) {
    process.stdout.write(`  ${c.id} … `);
    try {
      const { text, tools, durationMs } = await callAda(c);
      const failures = score(c, text, tools);
      const ok = failures.length === 0;
      results.push({
        case: c,
        answer: text,
        toolsCalled: tools,
        ok,
        failures,
        durationMs,
      });
      console.log(ok ? `✅ (${durationMs}ms)` : `❌ ${failures.join("; ")}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      results.push({
        case: c,
        answer: "",
        toolsCalled: [],
        ok: false,
        failures: [`error: ${msg}`],
        durationMs: 0,
      });
      console.log(`❌ ERROR: ${msg}`);
    }
  }
  mkdirSync(RESULTS_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outPath = join(RESULTS_DIR, `eval-${stamp}.md`);
  writeFileSync(outPath, fmtReport(results), "utf8");
  const passed = results.filter((r) => r.ok).length;
  console.log(`\n${passed}/${results.length} passed → ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
