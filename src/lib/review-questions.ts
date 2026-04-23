export type ReviewQuestionKind = "single" | "multi" | "text";

export type ReviewOption = {
  value: string;
  label: string;
  description?: string;
};

export type ReviewQuestionSpec = {
  kind: ReviewQuestionKind;
  label?: string;
  helpText?: string;
  placeholder?: string;
  options?: ReviewOption[];
};

export const QUESTION_CATALOG: Record<string, ReviewQuestionSpec> = {
  "customizations.classic-yaml.approach": {
    kind: "single",
    label: "How should we handle the 3 unsupported task types?",
    helpText:
      "The classic pipeline references 3 ADO task types with no direct GitHub Actions equivalent. Pick the approach you'd commit to.",
    options: [
      {
        value: "rewrite-as-actions",
        label: "Rewrite as GitHub Actions equivalents",
        description:
          "Reimplement each task using a supported action or script.",
      },
      {
        value: "lift-and-shift",
        label: "Lift and shift — keep as scripts",
        description:
          "Wrap existing scripts in workflow_dispatch steps; preserve behavior.",
      },
      {
        value: "retire",
        label: "Retire — these workflows are being deprecated",
        description: "Skip migration; these pipelines won't run after cutover.",
      },
    ],
  },

  "workflows.charlie-core-build.customTasks": {
    kind: "multi",
    label: "Which custom tasks need manual porting?",
    helpText:
      "Check every task that requires a hand-written replacement. Unchecked tasks will be auto-mapped by the migration agent.",
    options: [
      {
        value: "powershell-signing",
        label: "PowerShell@2 — custom signing",
        description: "Invokes on-prem signing service.",
      },
      {
        value: "file-transform",
        label: "FileTransform@1",
        description: "Config substitution at deploy time.",
      },
      {
        value: "nuget-internal-feed",
        label: "NuGetCommand@2 — internal feed",
        description: "Pulls from a private Contoso NuGet feed.",
      },
    ],
  },

  "secrets.signingServiceToken": {
    kind: "text",
    label: "How should the signing service token be provisioned in GitHub?",
    helpText:
      "The on-prem signing service expects a service-account token. Describe the credential flow you'd like (e.g., OIDC federation, GitHub secret, HashiCorp Vault).",
    placeholder:
      "e.g., Use OIDC federation — signing service trusts GitHub tokens issued to the contoso/charlie-* repos…",
  },

  "customizations.signing.approach": {
    kind: "single",
    label: "Signing flow migration approach",
    helpText:
      "The signing task calls an on-prem service. How should that flow work from GitHub Actions?",
    options: [
      {
        value: "oidc-federation",
        label: "OIDC federation to signing service",
        description: "Signing service trusts GitHub-issued OIDC tokens.",
      },
      {
        value: "reusable-workflow",
        label: "Reusable workflow with stored secret",
        description: "Centralize credential in a shared workflow repo.",
      },
      {
        value: "self-hosted-runner",
        label: "Self-hosted runner inside the signing VLAN",
        description: "Runner has direct network access; no token exchange.",
      },
    ],
  },

  "secrets.rotationFrequency": {
    kind: "single",
    label: "Secret rotation cadence",
    helpText:
      "Azure Key Vault stores the team's secrets. How often are they rotated today?",
    options: [
      { value: "monthly", label: "Monthly" },
      { value: "quarterly", label: "Quarterly" },
      { value: "annually", label: "Annually" },
      { value: "never", label: "Never (manual rotation only)" },
    ],
  },

  "customizations.semver-tagger.approach": {
    kind: "single",
    label: "Semver tagger migration approach",
    helpText:
      "A custom semver tagger script runs from the release pipeline. How should it map to GitHub?",
    options: [
      {
        value: "rewrite-as-action",
        label: "Rewrite as a GitHub Action",
        description: "Canonical fit for this kind of custom step.",
      },
      {
        value: "reuse-script",
        label: "Invoke existing script from Actions",
        description: "Keep the script, call it from a workflow step.",
      },
      {
        value: "use-release-please",
        label: "Replace with release-please",
        description: "Adopt a community action instead.",
      },
    ],
  },

  "codebase.primaryLang": {
    kind: "single",
    label: "Confirm primary language",
    helpText:
      "The agent saw multiple languages and can't confidently pick a dominant one. Which should we list as primary?",
    options: [
      { value: "Swift", label: "Swift" },
      { value: "Kotlin", label: "Kotlin" },
      { value: "TypeScript", label: "TypeScript / JavaScript" },
      { value: "mixed", label: "Truly mixed — don't force a primary" },
    ],
  },

  "ownership.onCallGroup": {
    kind: "text",
    label: "On-call group",
    helpText:
      "No on-call group was captured. Which channel or rotation should we record?",
    placeholder: "e.g., #echo-oncall, PagerDuty: Echo Mobile",
  },

  "ownership.escalationContact": {
    kind: "text",
    label: "Escalation contact",
    helpText:
      "No escalation contact was captured. Who should we page for production issues?",
    placeholder: "e.g., karen.lee@contoso.com",
  },

  "customizations.release-gate.mechanism": {
    kind: "single",
    label: "Release gate mechanism",
    helpText:
      "A gating step was detected before release but the underlying service isn't identifiable. What is it?",
    options: [
      { value: "app-center", label: "Microsoft App Center" },
      { value: "internal-portal", label: "Internal release portal" },
      { value: "manual-approval", label: "Manual approval (no service)" },
      { value: "other", label: "Other — describe in notes" },
    ],
  },

  "secrets.signingKeyStorage": {
    kind: "text",
    label: "Signing key storage location",
    helpText:
      "The signing step runs but the key source is opaque. Where is the key stored today, and how should it work after migration?",
    placeholder:
      "e.g., Stored in Azure Key Vault; after migration we want GitHub environment secrets gated by protection rules.",
  },
};

export function getSpecForFieldPath(
  fieldPath: string,
): ReviewQuestionSpec | null {
  return QUESTION_CATALOG[fieldPath] ?? null;
}
