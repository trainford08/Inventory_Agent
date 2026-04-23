/**
 * Small catalog of "(i) info" tooltip copy keyed by fieldPath prefix.
 * Matching is first-hit wins, most specific first.
 */
const CATALOG: Array<{ prefix: string; info: string }> = [
  {
    prefix: "codebase.usesLfs",
    info: "Git LFS lets a repo track large binaries without bloating Git history. Matters because GEI migrates LFS pointers but NOT the LFS object bytes — those need a separate push post-cutover.",
  },
  {
    prefix: "codebase.totalSizeGb",
    info: "Total repo size across all repos. Monorepos above 40 GB may exceed GitHub Enterprise Importer's managed-migration ceiling.",
  },
  {
    prefix: "codebase.primaryLang",
    info: "Primary language detected from file-extension mix. Used by the migration planner to recommend a GitHub Actions starter workflow.",
  },
  {
    prefix: "codebase.repoCount",
    info: "Number of git repositories found under the team's ADO project. Repositories migrate one-at-a-time; GEI caps concurrency at 5.",
  },
  {
    prefix: "repos.",
    info: "Per-repository metadata the agent read directly from the ADO REST API. Most fields should be correct; accept to confirm.",
  },
  {
    prefix: "adoProjects.",
    info: "An ADO 'project' is a container for repos, pipelines, boards, and feeds. The GitHub equivalent is splitting across org + repos + Projects + Packages.",
  },
  {
    prefix: "workflows.",
    info: "Azure Pipelines YAML or classic build/release definitions. YAML converts ~80% via GitHub Actions Importer; classic pipelines must first be converted to YAML inside ADO.",
  },
  {
    prefix: "releaseDefinitions.",
    info: "Classic release definitions. No automated migrator exists — they need to be rewritten as GitHub Actions workflows or kept in ADO during a hybrid window.",
  },
  {
    prefix: "organization.",
    info: "ADO organization-level configuration. Some org-level settings (policies, extension entitlements) do not migrate.",
  },
];

export function getFieldInfo(fieldPath: string): string | null {
  const hit = CATALOG.find((entry) => fieldPath.startsWith(entry.prefix));
  return hit?.info ?? null;
}
