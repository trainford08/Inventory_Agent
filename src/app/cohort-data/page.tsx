import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/server/db";

export const dynamic = "force-dynamic";

const cohortInclude = {
  org: true,
  champion: true,
  members: { orderBy: { name: "asc" } },
  codebase: { include: { repos: { orderBy: { name: "asc" } } } },
  workflows: { orderBy: { name: "asc" } },
  jtbds: { orderBy: { jtbdCode: "asc" } },
  customizations: { orderBy: { category: "asc" } },
  risks: { orderBy: [{ confidence: "desc" }, { title: "asc" }] },
  ownership: true,
  adoProjects: { orderBy: { name: "asc" } },
  serviceConnections: { orderBy: { name: "asc" } },
  releaseDefinitions: { orderBy: { name: "asc" } },
  extensions: { orderBy: { name: "asc" } },
  latestFindings: { select: { findings: { select: { id: true } } } },
} satisfies Prisma.TeamInclude;

export default async function CohortDataPage() {
  const teams = await prisma.team.findMany({
    orderBy: [{ cohort: "asc" }],
    include: cohortInclude,
  });

  return (
    <div className="mx-auto max-w-[1100px] px-8 py-10">
      <header className="mb-10 border-b border-border pb-6">
        <div className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
          Migration Hub · Raw cohort data
        </div>
        <h1 className="mb-3 text-[34px] font-bold leading-[1.1] tracking-[-0.025em] text-ink">
          Everything the demo knows about the six teams
        </h1>
        <p className="max-w-[64ch] text-[15px] leading-[1.6] text-ink-soft">
          This page is a live dump of the database. Every field the product
          surfaces — and every field it doesn&rsquo;t — is in here. Useful for
          understanding what a &ldquo;team profile&rdquo; actually contains once
          the agents have finished discovery.
        </p>
        <nav className="mt-5 flex flex-wrap gap-2">
          {teams.map((t) => (
            <a
              key={t.id}
              href={`#${t.slug}`}
              className="rounded-md border border-border bg-bg-elevated px-3 py-1 text-[12px] font-medium text-ink-soft hover:bg-bg-subtle"
            >
              {t.name}
            </a>
          ))}
        </nav>
      </header>

      {teams.map((t) => (
        <TeamBlock key={t.id} team={t} />
      ))}
    </div>
  );
}

type Team = Prisma.TeamGetPayload<{ include: typeof cohortInclude }>;

function TeamBlock({ team }: { team: Team }) {
  const findingCount = team.latestFindings?.findings.length ?? 0;
  return (
    <section
      id={team.slug}
      className="mb-14 border-b border-border pb-12 last:border-b-0"
    >
      <div className="mb-5">
        <div className="mb-1 font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
          Cohort {team.cohort} · {team.slug}
        </div>
        <h2 className="text-[28px] font-bold leading-[1.15] tracking-[-0.02em] text-ink">
          {team.name}
        </h2>
        {team.tagline ? (
          <p className="mt-1 text-[15px] italic text-ink-muted">
            &ldquo;{team.tagline}&rdquo;
          </p>
        ) : null}
      </div>

      <Section title="Team identity">
        <KV k="Name" v={team.name} />
        <KV k="Slug" v={team.slug} />
        <KV k="Tagline" v={team.tagline} />
        <KV k="Description" v={team.description} multi />
        <KV k="Organization" v={team.org.name} />
        <KV k="ADO org slug" v={team.org.adoOrgSlug} />
        <KV k="Cohort" v={team.cohort} />
        <KV k="Wave" v={team.wave} />
        <KV k="Tier" v={team.tier} />
        <KV k="Security classification" v={team.securityClassification} />
      </Section>

      <Section title="Migration state">
        <KV k="Migration state" v={team.migrationState} />
        <KV k="Health status" v={team.healthStatus} />
        <KV k="Engineer count" v={team.engineerCount} />
        <KV
          k="Effort estimate (low)"
          v={fmtWeeks(team.effortEstimateLowWeeks)}
        />
        <KV
          k="Effort estimate (high)"
          v={fmtWeeks(team.effortEstimateHighWeeks)}
        />
        <KV k="Effort confidence" v={team.effortConfidence} />
        <KV k="Effort progress" v={fmtWeeks(team.effortProgressWeeks)} />
        <KV k="Target cutover" v={fmtDate(team.targetCutoverAt)} />
        <KV k="Slack weeks" v={fmtWeeks(team.slackWeeks)} />
      </Section>

      <Section title="Activity counters">
        <KV k="Active work items" v={team.workItemsActive} />
        <KV k="Closed work items (90d)" v={team.workItemsClosed90d} />
        <KV k="Build artifacts" v={team.buildArtifactCount} />
        <KV k="Wiki pages" v={team.wikiPageCount} />
        <KV k="Agent findings (latest run)" v={findingCount} />
      </Section>

      <Section title={`Champion`}>
        <KV k="Name" v={team.champion?.name ?? null} />
        <KV k="Email" v={team.champion?.email ?? null} />
        <KV k="Role" v={team.champion?.role ?? null} />
      </Section>

      <Section title={`Team members (${team.members.length})`}>
        <Table
          headers={["Name", "Role", "Email"]}
          rows={team.members.map((m) => [m.name, m.role, m.email])}
        />
      </Section>

      {team.codebase ? (
        <Section title="Codebase">
          <KV k="Primary language" v={team.codebase.primaryLang} />
          <KV k="Uses LFS?" v={team.codebase.usesLfs ? "Yes" : "No"} />
          <KV k="Total size (GB)" v={team.codebase.totalSizeGb} />
          {team.codebase.repos.length > 0 ? (
            <div className="mt-3">
              <h4 className="mb-2 text-[13px] font-semibold text-ink">
                Repositories ({team.codebase.repos.length})
              </h4>
              <Table
                headers={[
                  "Name",
                  "Size GB",
                  "LOC",
                  "Contribs",
                  "Commits 90d",
                  "Wiki?",
                  "Last commit",
                  "Primary owner",
                ]}
                rows={team.codebase.repos.map((r) => [
                  r.name,
                  r.sizeGb,
                  r.loc,
                  r.contributorCount,
                  r.commits90d,
                  r.hasWiki ? "Yes" : "No",
                  fmtDate(r.lastCommitAt),
                  r.primaryOwner,
                ])}
              />
            </div>
          ) : null}
        </Section>
      ) : null}

      {team.workflows.length > 0 ? (
        <Section title={`Workflows / pipelines (${team.workflows.length})`}>
          <Table
            headers={[
              "Name",
              "Type",
              "Classic?",
              "Stages",
              "Runner",
              "Custom tasks",
            ]}
            rows={team.workflows.map((w) => [
              w.name,
              w.type,
              w.isClassic ? "Yes" : "No",
              w.stageCount,
              w.runnerType,
              w.customTasks.length > 0 ? w.customTasks.join(", ") : "—",
            ])}
          />
        </Section>
      ) : null}

      {team.releaseDefinitions.length > 0 ? (
        <Section
          title={`Release definitions (${team.releaseDefinitions.length})`}
        >
          <Table
            headers={[
              "Name",
              "Classic?",
              "Stages",
              "Manual gates?",
              "Gate types",
              "Deploy targets",
            ]}
            rows={team.releaseDefinitions.map((r) => [
              r.name,
              r.isClassic ? "Yes" : "No",
              r.stages,
              r.hasManualGates ? "Yes" : "No",
              r.gateTypes.length > 0 ? r.gateTypes.join(", ") : "—",
              r.deployTargets.length > 0 ? r.deployTargets.join(", ") : "—",
            ])}
          />
        </Section>
      ) : null}

      {team.jtbds.length > 0 ? (
        <Section title={`Jobs to be done (${team.jtbds.length})`}>
          <Table
            headers={[
              "Code",
              "Title",
              "Category",
              "Frequency",
              "Performed?",
              "Approach",
            ]}
            rows={team.jtbds.map((j) => [
              j.jtbdCode,
              j.title,
              j.category,
              j.frequency ?? "—",
              j.performed ? "Yes" : "No",
              j.migrationApproach ?? "—",
            ])}
          />
        </Section>
      ) : null}

      {team.customizations.length > 0 ? (
        <Section title={`Customizations (${team.customizations.length})`}>
          <Table
            headers={["Name", "Category", "Status", "Strategy"]}
            rows={team.customizations.map((c) => [
              c.name,
              c.category,
              c.status,
              c.strategy ?? "—",
            ])}
          />
        </Section>
      ) : null}

      {team.risks.length > 0 ? (
        <Section title={`Risks (${team.risks.length})`}>
          <Table
            headers={[
              "Title",
              "Category",
              "Confidence",
              "Status",
              "Detail",
              "Mitigation",
            ]}
            rows={team.risks.map((r) => [
              r.title,
              r.category,
              r.confidence,
              r.status,
              r.detail,
              r.mitigation ?? "—",
            ])}
          />
        </Section>
      ) : null}

      {team.ownership ? (
        <Section title="Ownership">
          <KV k="Primary owner" v={team.ownership.primaryOwnerEmail} />
          <KV k="On-call group" v={team.ownership.onCallGroup} />
          <KV k="Escalation contact" v={team.ownership.escalationContact} />
        </Section>
      ) : null}

      {team.adoProjects.length > 0 ? (
        <Section title={`ADO projects (${team.adoProjects.length})`}>
          <Table
            headers={["Name", "Visibility", "Repos", "Pipelines", "Boards"]}
            rows={team.adoProjects.map((p) => [
              p.name,
              p.visibility,
              p.repoCount,
              p.pipelineCount,
              p.boardCount,
            ])}
          />
        </Section>
      ) : null}

      {team.serviceConnections.length > 0 ? (
        <Section
          title={`Service connections (${team.serviceConnections.length})`}
        >
          <Table
            headers={[
              "Name",
              "Type",
              "Target",
              "Auth",
              "Credential stored?",
              "Used by",
            ]}
            rows={team.serviceConnections.map((sc) => [
              sc.name,
              sc.type,
              sc.targetService,
              sc.authMethod,
              sc.hasStoredCredential ? "Yes" : "No",
              sc.usedByCount,
            ])}
          />
        </Section>
      ) : null}

      {team.extensions.length > 0 ? (
        <Section title={`Extensions (${team.extensions.length})`}>
          <Table
            headers={[
              "Name",
              "Publisher",
              "Category",
              "GitHub equivalent?",
              "Notes",
            ]}
            rows={team.extensions.map((e) => [
              e.name,
              e.publisher,
              e.category,
              e.hasGitHubEquivalent ? "Yes" : "No",
              e.notes ?? "—",
            ])}
          />
        </Section>
      ) : null}
    </section>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6 rounded-md border border-border bg-bg-elevated px-5 py-4">
      <h3 className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
        {title}
      </h3>
      {children}
    </div>
  );
}

function KV({
  k,
  v,
  multi,
}: {
  k: string;
  v: string | number | boolean | null | undefined;
  multi?: boolean;
}) {
  const display =
    v === null || v === undefined || v === ""
      ? "—"
      : typeof v === "boolean"
        ? v
          ? "true"
          : "false"
        : String(v);
  return (
    <div
      className={`grid ${multi ? "grid-cols-1 gap-1" : "grid-cols-[220px_1fr] gap-3"} border-b border-border-subtle py-[6px] last:border-b-0`}
    >
      <div className="font-mono text-[11.5px] font-semibold text-ink-muted">
        {k}
      </div>
      <div
        className={`text-[13px] text-ink ${multi ? "leading-[1.55]" : ""} ${display === "—" ? "text-ink-faint" : ""}`}
      >
        {display}
      </div>
    </div>
  );
}

function Table({
  headers,
  rows,
}: {
  headers: string[];
  rows: Array<Array<string | number | null | undefined>>;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-0 text-[12.5px]">
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="whitespace-nowrap border-b border-border px-2 py-[6px] text-left font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-muted"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="align-top">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="border-b border-border-subtle px-2 py-[5px] text-ink-soft"
                >
                  {cell === null || cell === undefined || cell === "" ? (
                    <span className="text-ink-faint">—</span>
                  ) : (
                    String(cell)
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function fmtDate(d: Date | null | undefined): string | null {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function fmtWeeks(n: number | null | undefined): string | null {
  if (n === null || n === undefined) return null;
  return `${n} wk${n === 1 ? "" : "s"}`;
}
