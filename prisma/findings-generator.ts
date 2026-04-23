import type { Prisma } from "../src/generated/prisma/client";

type RepoShape = Prisma.RepoCreateWithoutCodebaseInput;
type WorkflowShape = Prisma.WorkflowCreateWithoutTeamInput;
type JtbdShape = Prisma.JtbdEntryCreateWithoutTeamInput;
type CustomShape = Prisma.CustomizationCreateWithoutTeamInput;
type RiskShape = Prisma.RiskCreateWithoutTeamInput;
type MemberShape = Prisma.TeamMemberCreateWithoutTeamInput;
type ProjectShape = Prisma.AdoProjectCreateWithoutTeamInput;
type ConnectionShape = Prisma.ServiceConnectionCreateWithoutTeamInput;
type ReleaseShape = Prisma.ReleaseDefinitionCreateWithoutTeamInput;
type ExtensionShape = Prisma.ExtensionCreateWithoutTeamInput;

export type SeedEvidence = {
  kind:
    | "FILE"
    | "FOLDER"
    | "URL"
    | "API_RESPONSE"
    | "CONFIG"
    | "LOG"
    | "SNIPPET";
  path: string;
  snippet?: string | null;
  metadata?: string | null;
  sourceUrl?: string | null;
};

export type SeedFinding = {
  category: string;
  fieldPath: string;
  fieldLabel: string;
  value: string | null;
  source: "ADO_API" | "INFERRED" | "NEEDS_INPUT";
  confidence: "LOW" | "MEDIUM" | "HIGH";
  triedNote?: string | null;
  evidence?: SeedEvidence[];
};

type TeamShape = {
  repos: RepoShape[];
  workflows: WorkflowShape[];
  jtbds: JtbdShape[];
  customizations: CustomShape[];
  risks: RiskShape[];
  members: MemberShape[];
  adoProjects: ProjectShape[];
  serviceConnections: ConnectionShape[];
  releaseDefinitions: ReleaseShape[];
  extensions: ExtensionShape[];
  ownership: Prisma.OwnershipCreateWithoutTeamInput;
  codebase: {
    primaryLang: string | null;
    usesLfs: boolean;
    totalSizeGb: number | null;
  };
  counters: {
    workItemsActive: number | null;
    workItemsClosed90d: number | null;
    buildArtifactCount: number | null;
    wikiPageCount: number | null;
  };
};

export function generateBackgroundFindings(team: TeamShape): SeedFinding[] {
  const out: SeedFinding[] = [];

  // Codebase-level
  if (team.codebase.primaryLang) {
    out.push({
      category: "Code & repos",
      fieldPath: "codebase.primaryLang",
      fieldLabel: "Primary language",
      value: team.codebase.primaryLang,
      source: "INFERRED",
      confidence: "HIGH",
    });
  }
  if (team.codebase.totalSizeGb !== null) {
    out.push({
      category: "Code & repos",
      fieldPath: "codebase.totalSizeGb",
      fieldLabel: "Total codebase size",
      value: `${team.codebase.totalSizeGb} GB`,
      source: "ADO_API",
      confidence: "HIGH",
    });
  }
  out.push({
    category: "Code & repos",
    fieldPath: "codebase.usesLfs",
    fieldLabel: "Uses Git LFS",
    value: team.codebase.usesLfs ? "true" : "false",
    source: "ADO_API",
    confidence: "HIGH",
  });
  out.push({
    category: "Code & repos",
    fieldPath: "codebase.repoCount",
    fieldLabel: "Repository count",
    value: String(team.repos.length),
    source: "ADO_API",
    confidence: "HIGH",
  });

  // Per-repo findings — each attribute shown on the review page is seeded
  // as a finding so accept/edit/flag actions have something to update.
  for (const r of team.repos) {
    out.push({
      category: "Code & repos",
      fieldPath: `repos.${r.name}.name`,
      fieldLabel: "Repository name",
      value: r.name,
      source: "ADO_API",
      confidence: "HIGH",
    });
    out.push({
      category: "Code & repos",
      fieldPath: `repos.${r.name}.primaryOwner`,
      fieldLabel: "Primary owner",
      value: r.primaryOwner ?? "unknown",
      source: r.primaryOwner ? "ADO_API" : "INFERRED",
      confidence: r.primaryOwner ? "HIGH" : "LOW",
    });
    out.push({
      category: "Code & repos",
      fieldPath: `repos.${r.name}.visibility`,
      fieldLabel: "Visibility",
      value: r.isArchived ? "archived" : "private",
      source: "ADO_API",
      confidence: "HIGH",
    });
    out.push({
      category: "Code & repos",
      fieldPath: `repos.${r.name}.hasLfs`,
      fieldLabel: "Uses Git LFS?",
      value: r.hasLfs
        ? r.lfsSizeGb !== undefined && r.lfsSizeGb !== null
          ? `true · ${r.lfsSizeGb} GB of LFS objects`
          : "true"
        : "false",
      source: "ADO_API",
      confidence: "HIGH",
    });
    out.push({
      category: "Code & repos",
      fieldPath: `repos.${r.name}.hasSubmodules`,
      fieldLabel: "Has submodules?",
      value: r.hasSubmodules ? "true" : "false",
      source: "ADO_API",
      confidence: "HIGH",
    });
    out.push({
      category: "Code & repos",
      fieldPath: `repos.${r.name}.contributorCount`,
      fieldLabel: "Who else commits here regularly?",
      value:
        r.contributorCount !== undefined && r.contributorCount !== null
          ? `${r.contributorCount} contributor${r.contributorCount === 1 ? "" : "s"} in the last 90 days · ${r.commits90d ?? 0} commit${(r.commits90d ?? 0) === 1 ? "" : "s"}`
          : "unknown — agent could not infer contributor list",
      source: "INFERRED",
      confidence:
        r.contributorCount !== undefined && r.contributorCount !== null
          ? "MEDIUM"
          : "LOW",
    });
    out.push({
      category: "Code & repos",
      fieldPath: `repos.${r.name}.defaultBranch`,
      fieldLabel: "Default branch",
      value: r.defaultBranch,
      source: "ADO_API",
      confidence: "HIGH",
    });
    if (r.sizeGb !== undefined && r.sizeGb !== null) {
      out.push({
        category: "Code & repos",
        fieldPath: `repos.${r.name}.sizeGb`,
        fieldLabel: `${r.name} size`,
        value: `${r.sizeGb} GB`,
        source: "ADO_API",
        confidence: "HIGH",
      });
    }
    if (r.loc !== undefined && r.loc !== null) {
      out.push({
        category: "Code & repos",
        fieldPath: `repos.${r.name}.loc`,
        fieldLabel: `${r.name} lines of code`,
        value: `${r.loc.toLocaleString()} LOC`,
        source: "INFERRED",
        confidence: "HIGH",
      });
    }
    if (r.contributorCount !== undefined && r.contributorCount !== null) {
      out.push({
        category: "Code & repos",
        fieldPath: `repos.${r.name}.contributors`,
        fieldLabel: `${r.name} contributors`,
        value: `${r.contributorCount} (90d)`,
        source: "INFERRED",
        confidence: "HIGH",
      });
    }
    if (r.commits90d !== undefined && r.commits90d !== null) {
      out.push({
        category: "Code & repos",
        fieldPath: `repos.${r.name}.commits90d`,
        fieldLabel: `${r.name} commits (90d)`,
        value: String(r.commits90d),
        source: "ADO_API",
        confidence: "HIGH",
      });
    }
    out.push({
      category: "Code & repos",
      fieldPath: `repos.${r.name}.branchProtected`,
      fieldLabel: "Active branch-protection rules?",
      value: r.branchProtected
        ? "yes · default branch protected"
        : "no protections set",
      source: "ADO_API",
      confidence: "HIGH",
    });
    if (r.hasSubmodules) {
      out.push({
        category: "Code & repos",
        fieldPath: `repos.${r.name}.hasSubmodules`,
        fieldLabel: `${r.name} has submodules`,
        value: "true",
        source: "ADO_API",
        confidence: "HIGH",
      });
    }
    if (r.hasLfs) {
      out.push({
        category: "Code & repos",
        fieldPath: `repos.${r.name}.hasLfs`,
        fieldLabel: `${r.name} uses Git LFS`,
        value:
          r.lfsSizeGb !== undefined && r.lfsSizeGb !== null
            ? `${r.lfsSizeGb} GB LFS`
            : "true",
        source: "ADO_API",
        confidence: "HIGH",
      });
    }
    if (r.hasWiki) {
      out.push({
        category: "Code & repos",
        fieldPath: `repos.${r.name}.wikiPageCount`,
        fieldLabel: `${r.name} wiki pages`,
        value:
          r.wikiPageCount !== undefined && r.wikiPageCount !== null
            ? String(r.wikiPageCount)
            : "unknown",
        source: "ADO_API",
        confidence:
          r.wikiPageCount === null || r.wikiPageCount === undefined
            ? "MEDIUM"
            : "HIGH",
      });
    }
    if (r.isArchived) {
      out.push({
        category: "Code & repos",
        fieldPath: `repos.${r.name}.isArchived`,
        fieldLabel: `${r.name} archived`,
        value: "true",
        source: "ADO_API",
        confidence: "HIGH",
      });
    }
    if (r.primaryOwner) {
      out.push({
        category: "Ownership",
        fieldPath: `repos.${r.name}.primaryOwner`,
        fieldLabel: `${r.name} primary owner`,
        value: r.primaryOwner,
        source: "INFERRED",
        confidence: "HIGH",
      });
    }
  }

  // ADO projects
  out.push({
    category: "Organization",
    fieldPath: "adoProjects.count",
    fieldLabel: "ADO project count",
    value: String(team.adoProjects.length),
    source: "ADO_API",
    confidence: "HIGH",
  });
  for (const p of team.adoProjects) {
    out.push({
      category: "Organization",
      fieldPath: `adoProjects.${p.name}`,
      fieldLabel: `Project ${p.name}`,
      value: `${p.repoCount} repos · ${p.pipelineCount} pipelines`,
      source: "ADO_API",
      confidence: "HIGH",
    });
  }

  // Pipelines
  out.push({
    category: "Pipelines",
    fieldPath: "workflows.count",
    fieldLabel: "Pipeline count",
    value: String(team.workflows.length),
    source: "ADO_API",
    confidence: "HIGH",
  });
  for (const w of team.workflows) {
    out.push({
      category: "Pipelines",
      fieldPath: `workflows.${w.name}.type`,
      fieldLabel: `${w.name} type`,
      value: `${w.type} (${w.isClassic ? "classic" : "yaml"})`,
      source: "ADO_API",
      confidence: "HIGH",
    });
    if (w.stageCount !== undefined && w.stageCount > 1) {
      out.push({
        category: "Pipelines",
        fieldPath: `workflows.${w.name}.stageCount`,
        fieldLabel: `${w.name} stages`,
        value: String(w.stageCount),
        source: "ADO_API",
        confidence: "HIGH",
      });
    }
    if (w.runnerType) {
      out.push({
        category: "Pipelines",
        fieldPath: `workflows.${w.name}.runnerType`,
        fieldLabel: `${w.name} runner`,
        value: w.runnerType,
        source: "ADO_API",
        confidence: "HIGH",
      });
    }
    if (w.agentPool) {
      out.push({
        category: "Pipelines",
        fieldPath: `workflows.${w.name}.agentPool`,
        fieldLabel: `${w.name} agent pool`,
        value: w.agentPool,
        source: "ADO_API",
        confidence: "HIGH",
      });
    }
    if (w.averageDurationMin !== undefined && w.averageDurationMin !== null) {
      out.push({
        category: "Pipelines",
        fieldPath: `workflows.${w.name}.duration`,
        fieldLabel: `${w.name} avg duration`,
        value: `${w.averageDurationMin} min`,
        source: "INFERRED",
        confidence: "HIGH",
      });
    }
  }

  // Release definitions
  if (team.releaseDefinitions.length > 0) {
    out.push({
      category: "Pipelines",
      fieldPath: "releaseDefinitions.count",
      fieldLabel: "Classic release definitions",
      value: String(team.releaseDefinitions.length),
      source: "ADO_API",
      confidence: "HIGH",
    });
    for (const r of team.releaseDefinitions) {
      const targets = Array.isArray(r.deployTargets)
        ? r.deployTargets.length
        : 0;
      out.push({
        category: "Pipelines",
        fieldPath: `releaseDefinitions.${r.name}.stages`,
        fieldLabel: `${r.name} stages`,
        value: `${r.stages} stages · ${targets} targets`,
        source: "ADO_API",
        confidence: "HIGH",
      });
    }
  }

  // Service connections
  if (team.serviceConnections.length > 0) {
    out.push({
      category: "Auth & security",
      fieldPath: "serviceConnections.count",
      fieldLabel: "Service connection count",
      value: String(team.serviceConnections.length),
      source: "ADO_API",
      confidence: "HIGH",
    });
    for (const c of team.serviceConnections) {
      out.push({
        category: "Auth & security",
        fieldPath: `serviceConnections.${c.name}.type`,
        fieldLabel: `${c.name} connection type`,
        value: `${c.type} · ${c.authMethod}`,
        source: "ADO_API",
        confidence: "HIGH",
      });
    }
  }

  // Extensions
  if (team.extensions.length > 0) {
    out.push({
      category: "Organization",
      fieldPath: "extensions.count",
      fieldLabel: "Installed extensions",
      value: String(team.extensions.length),
      source: "ADO_API",
      confidence: "HIGH",
    });
    for (const e of team.extensions) {
      out.push({
        category: "Organization",
        fieldPath: `extensions.${e.name}`,
        fieldLabel: `Extension ${e.name}`,
        value: `${e.publisher} · ${e.category}`,
        source: "ADO_API",
        confidence: "HIGH",
      });
    }
  }

  // JTBDs
  out.push({
    category: "JTBDs",
    fieldPath: "jtbds.count",
    fieldLabel: "Developer JTBDs performed",
    value: String(team.jtbds.length),
    source: "INFERRED",
    confidence: "HIGH",
  });
  for (const j of team.jtbds) {
    if (j.migrationApproach) {
      out.push({
        category: "JTBDs",
        fieldPath: `jtbds.${j.jtbdCode}.approach`,
        fieldLabel: `${j.title} approach`,
        value: j.migrationApproach,
        source: "INFERRED",
        confidence: "HIGH",
      });
    }
  }

  // Members
  out.push({
    category: "Ownership",
    fieldPath: "members.count",
    fieldLabel: "Team members",
    value: String(team.members.length),
    source: "ADO_API",
    confidence: "HIGH",
  });

  // Ownership
  if (team.ownership.primaryOwnerEmail) {
    out.push({
      category: "Ownership",
      fieldPath: "ownership.primary",
      fieldLabel: "Primary owner",
      value: team.ownership.primaryOwnerEmail,
      source: "INFERRED",
      confidence: "HIGH",
    });
  }
  if (team.ownership.onCallGroup) {
    out.push({
      category: "Ownership",
      fieldPath: "ownership.onCallGroup",
      fieldLabel: "On-call group",
      value: team.ownership.onCallGroup,
      source: "ADO_API",
      confidence: "HIGH",
    });
  }

  // Counters
  if (team.counters.workItemsActive !== null) {
    out.push({
      category: "Work items",
      fieldPath: "workItems.active",
      fieldLabel: "Active work items",
      value: String(team.counters.workItemsActive),
      source: "ADO_API",
      confidence: "HIGH",
    });
  }
  if (team.counters.workItemsClosed90d !== null) {
    out.push({
      category: "Work items",
      fieldPath: "workItems.closed90d",
      fieldLabel: "Closed work items (90d)",
      value: String(team.counters.workItemsClosed90d),
      source: "ADO_API",
      confidence: "HIGH",
    });
  }
  if (team.counters.buildArtifactCount !== null) {
    out.push({
      category: "Pipelines",
      fieldPath: "buildArtifacts.count",
      fieldLabel: "Build artifacts",
      value: String(team.counters.buildArtifactCount),
      source: "ADO_API",
      confidence: "HIGH",
    });
  }

  return out;
}

/**
 * For any anomaly (confidence=LOW) that doesn't already carry curated evidence,
 * synthesize a single baseline evidence row from the finding's fieldPath + value.
 * Keeps the UI honest — every anomaly shows at least "here's what the agent
 * pointed at" — without requiring hand-written evidence for every team.
 */
export function withDefaultEvidence(findings: SeedFinding[]): SeedFinding[] {
  return findings.map((f) => {
    if (f.confidence !== "LOW") return f;
    if (f.evidence && f.evidence.length > 0) return f;
    return {
      ...f,
      evidence: [
        {
          kind: "SNIPPET",
          path: f.fieldPath,
          snippet: f.value ?? null,
          metadata:
            "Baseline evidence — agent coordinate + value · no richer capture",
          sourceUrl: null,
        },
      ],
    };
  });
}

export function countFindings(findings: SeedFinding[]) {
  return {
    autoPopulatedCount: findings.filter(
      (f) =>
        (f.source === "ADO_API" || f.source === "INFERRED") &&
        f.confidence !== "LOW",
    ).length,
    needsInputCount: findings.filter((f) => f.source === "NEEDS_INPUT").length,
    anomalyCount: findings.filter((f) => f.confidence === "LOW").length,
  };
}
