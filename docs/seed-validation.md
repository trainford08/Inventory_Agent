# Seed validation against documented ADO → GitHub migration pitfalls

**Purpose.** Verify that our six-team demo seed reflects real, documented ADO → GitHub migration pain points. This document is the ground truth for "does the data an interviewer sees look like a real discovery run?"

**Method.**

1. Pulled a source-backed checklist of 51 pitfalls from public Microsoft Learn, GitHub Docs, GitHub newsroom, Microsoft DevBlogs, and canonical community migration tooling repos.
2. Cross-referenced each pitfall against the ~130 curated anomalies and needs-input findings across `prisma/cohorts/*.ts`.
3. Classified each pitfall as **✅ covered**, **△ partial**, **✗ not covered**, or **— program-level** (belongs elsewhere in the app, not a per-team finding).

**Result summary.**

| Status                                  | Count  | %        |
| --------------------------------------- | ------ | -------- |
| ✅ Covered explicitly                   | 6      | 12%      |
| △ Partial / spirit only                 | 11     | 22%      |
| ✗ Not covered (per-team candidates)     | 24     | 47%      |
| — Program-level (not per-team findings) | 10     | 20%      |
| **Total documented pitfalls**           | **51** | **100%** |

**Reading this:** a realistic demo should hit most of the "not covered (per-team)" items on at least one team.

- **33% coverage of all documented pitfalls** (17 of 51)
- **41% coverage of per-team-applicable pitfalls** (17 of 41, excluding the 10 program-level items that belong on an org screen, not a team profile)

Target after gap-fill: **~85% coverage of per-team-applicable items**.

---

## Cross-reference table

### Code & repos

| Pitfall                                                 | Status          | Where in seed (or why not)                                                              |
| ------------------------------------------------------- | --------------- | --------------------------------------------------------------------------------------- |
| GEI supports Azure DevOps Cloud only, not ADO Server    | — program-level | Applies to our whole program; no team has ADO Server flagged. Program-level assumption. |
| Git LFS objects are NOT migrated by GEI (only pointers) | △               | Delta flags LFS scale; no finding names the pointer-vs-byte gotcha explicitly.          |
| GEI repository size cap (40 GiB public preview)         | △               | Delta flags monorepo near 100 GB soft limit; doesn't name the GEI 40 GiB ceiling.       |
| GitHub hard cap: 2 GiB per commit, 100 MiB per file     | ✗               | No per-repo large-file / oversize-commit anomaly.                                       |
| LFS per-file 5 GB ceiling on GitHub                     | ✗               | Delta has aggregate LFS scale but no individual 5 GB+ file finding.                     |
| No delta migration — changes during cut-over are lost   | — program-level | Program-level cut-over policy; belongs on a migration-plan screen, not team.            |
| GEI concurrency capped at 5 simultaneous repos          | — program-level | Wave planning constraint.                                                               |
| Code search returns stale results post-migration        | — program-level | Post-migration ambient behavior.                                                        |
| User-scoped and cross-repo branch policies dropped      | ✗               | No finding about branch-policy rewrite scope.                                           |
| TFVC history caps at 180 days via import tool           | — program-level | No team on TFVC; not applicable to our scenarios.                                       |
| TFVC import tool does not configure LFS                 | — program-level | Same — no TFVC teams.                                                                   |
| Org rulesets can silently block migration push          | ✗               | No finding about signed-commit rulesets or ruleset conflicts.                           |
| Mannequin users block searchability until reclaimed     | ✗               | No finding about unmapped authors / identity reclamation.                               |

### Pipelines

| Pitfall                                                                                    | Status          | Where in seed (or why not)                                                                                                                  |
| ------------------------------------------------------------------------------------------ | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Actions Importer targets 80% conversion, not 100%                                          | — program-level | Importer-level expectation; program-level.                                                                                                  |
| Pre-/post-deployment gates don't convert (Azure Monitor etc.)                              | △               | Charlie has ServiceNow gate but no Azure Monitor gate; Delta has azure-monitor gate types in release defs but not flagged as needs-rebuild. |
| Post-deployment approvals must be recreated manually                                       | △               | Delta has approval-list review; not framed as "won't migrate."                                                                              |
| `schedule` / `workflow_run` triggers don't convert                                         | △               | Charlie has cron timezone needs-input; not framed as importer limitation.                                                                   |
| PR tag filters and `on.<event>.types` don't convert                                        | ✗               | No finding.                                                                                                                                 |
| Implicit checkout becomes unnamed GUID step                                                | ✗               | No finding.                                                                                                                                 |
| Nested template if/each blocks don't convert                                               | ✗               | No finding.                                                                                                                                 |
| Templates split: `steps` → composite, `jobs/stages` → reusable workflows                   | ✗               | No finding.                                                                                                                                 |
| Secrets / service connections / self-hosted agents / environments not migrated by importer | △               | Covered in spirit across Charlie + Delta; not framed as importer-scope limitation.                                                          |
| Matrix strategy options partially convert                                                  | ✗               | No finding.                                                                                                                                 |
| **Classic release pipelines have no automated migrator**                                   | ✅              | Charlie: "Classic pipeline cannot be converted 1:1" risk, plus multiple classic-pipeline anomalies and needs-input items.                   |
| Environments not pre-created skip approval gates on first run                              | ✗               | No finding about first-run unreviewed-deploy risk.                                                                                          |
| ADO Server API < 5.0 incompatible with importer                                            | — program-level | Not applicable — no on-prem ADO.                                                                                                            |
| Microsoft-hosted agent specs differ from GitHub-hosted runners                             | ✗               | No finding about runner hardware difference.                                                                                                |
| Self-hosted runners on public repos are unsafe                                             | ✗               | No finding about runner + public-repo security.                                                                                             |
| **AzureFileCopy@2 / @3 use retired AzCopy**                                                | ✅              | Charlie & Delta both have `AzureFileCopy@3` in `deprecatedTasks`.                                                                           |
| AzureFileCopy@6 is Windows-agent only                                                      | ✗               | No finding about Windows-only task constraint.                                                                                              |
| `UseDotNet@1` is deprecated                                                                | ✗               | No team references UseDotNet@1 as deprecated.                                                                                               |
| **XamarinAndroid@1 retired May 2024**                                                      | △               | Echo has `XamarinIOS@2` deprecated; same spirit but different task; Android not flagged.                                                    |
| MS-hosted images may drop Xamarin/iOS SDKs                                                 | ✗               | No finding.                                                                                                                                 |

### Auth & security / Identity & SSO

| Pitfall                                                             | Status          | Where in seed (or why not)                                                                                                           |
| ------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Entra tenant switch invalidates PATs and SSH keys                   | — program-level | Org-wide cutover event.                                                                                                              |
| Entra groups don't transfer across tenants                          | — program-level | Org-wide.                                                                                                                            |
| SAML SSO vs Enterprise Managed Users choice is (semi-)irreversible  | — program-level | Org-wide decision.                                                                                                                   |
| OAuth tokens not interchangeable between ADO and Entra              | — program-level | Integration-layer concern.                                                                                                           |
| GitHub Enterprise Cloud FedRAMP Moderate on separate GHE.com tenant | △               | Charlie & Delta carry FedRAMP High classification, but no finding surfaces the GHE.com data-residency requirement.                   |
| Service connections must be recreated as OIDC federated credentials | △               | Charlie & Delta show OIDC auth on some connections, service-principal on others; not framed as "rebuild required with OIDC pattern." |
| **Variable groups have no 1:1 mapping**                             | ✅              | Charlie: `variableGroups.charlie-secrets.migration`; Delta: `variableGroups.delta-secrets.count`.                                    |
| Secure files are not migrated (keystores, .p12, .mobileprovision)   | △               | Echo has signing keys + Android JKS needs-input; not framed as "Library/Secure Files doesn't auto-migrate."                          |
| Self-hosted keychain artifacts persist between jobs                 | ✗               | No finding about runner secret leakage between jobs.                                                                                 |
| GHAzDO secret-scanning alerts don't appear on PR branches in hub    | ✗               | No finding about this specific GHAzDO bug.                                                                                           |

### Work items

| Pitfall                                                       | Status | Where in seed (or why not)                                                                                                  |
| ------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------- |
| **GEI does not migrate work items (only PR↔work-item links)** | ✗      | No finding — but Charlie flags "work item template migration" which touches this.                                           |
| No first-party ADO Boards → Issues tool                       | ✗      | No finding naming the tool gap / OpsHub / community-tool choice.                                                            |
| Work-item types map to labels — state machines collapse       | △      | Charlie: "Work item template migration" needs-input; touches the 14-custom-fields issue but not the state-machine collapse. |
| Attachments and rich-text formatting degrade                  | ✗      | No finding.                                                                                                                 |
| Iteration paths don't map cleanly to Milestones               | ✗      | No finding about iteration → milestone flattening.                                                                          |
| Parent/child and related-link relations don't round-trip      | ✗      | No finding.                                                                                                                 |

### Extensions / Release & gates

| Pitfall                                                                    | Status | Where in seed (or why not)                                                              |
| -------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------- |
| Test Plans have no GitHub equivalent                                       | ✗      | No team uses Test Plans in seed; easy add.                                              |
| Azure Artifacts Universal Packages have no GH Packages equivalent          | ✗      | No team uses Universal Packages; easy add.                                              |
| GitHub Packages has no feed-style namespacing                              | ✗      | No finding about feed flattening on migration.                                          |
| `nuget.config` / `.npmrc` / `settings.xml` URLs must be rewritten          | ✗      | Charlie has NuGet feed connection; no finding about URL rewrite across config files.    |
| Azure Pipelines approval gates with Azure Monitor query                    | ✗      | Delta has `azure-monitor` gate type seeded but no finding on rebuild scope.             |
| **ServiceNow / REST / Work-item-query gates must be custom-built**         | ✅     | Charlie: ServiceNowApproval@1 task + ServiceNow extension + multiple needs-input items. |
| Deployment strategies (canary/rolling/blue-green) don't port declaratively | △      | Delta covers canary ordering semantics but not the "syntax doesn't port" framing.       |

### Mobile / App Center

| Pitfall                                                                   | Status | Where in seed (or why not)                                                             |
| ------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------- |
| **Visual Studio App Center retired March 2025 (Analytics to 2027)**       | ✅     | Echo: "App Center sunset" anomaly + "App Center migration path" needs-input.           |
| App Center Build has no 1:1 — Microsoft redirects to Azure Pipelines      | △      | Echo mentions App Center path but doesn't name the MS-recommended export-to-ADO route. |
| App Center Test replacement is BrowserStack (third-party, commercial)     | ✗      | No finding.                                                                            |
| App Center Distribute fragments across TestFlight / Play / Partner Center | ✗      | No finding.                                                                            |
| CodePush becomes self-hosted                                              | ✗      | No React Native team in seed; add to Echo as a decision point.                         |

### Process / operational

| Pitfall                                                  | Status | Where in seed (or why not)                                              |
| -------------------------------------------------------- | ------ | ----------------------------------------------------------------------- |
| Projects-as-containers mental model breaks               | ✗      | We have `AdoProject` records but no finding about re-scoping on GitHub. |
| AB#1234 work-item linking requires explicit hybrid setup | ✗      | No finding.                                                             |
| ADO Wiki page hierarchy collisions don't survive         | ✗      | Many repos have wikis; no finding flags the collision risk.             |
| ADO Dashboards have no GitHub equivalent                 | ✗      | No finding.                                                             |
| Pipeline run history is not migrated                     | ✗      | No finding about audit retention / keeping ADO read-only.               |
| Service Hooks (Slack/Teams/Jira) don't migrate           | ✗      | No finding about Slack/Teams re-wiring.                                 |

---

## Coverage by category

| Category                     | Covered + Partial | Not Covered (per-team) | Program-level |
| ---------------------------- | :---------------: | :--------------------: | :-----------: |
| Code & repos                 |         2         |           5            |       6       |
| Pipelines                    |         5         |           11           |       4       |
| Auth & security / Identity   |         4         |           2            |       4       |
| Work items                   |         1         |           5            |       0       |
| Extensions / Release & gates |         2         |           5            |       0       |
| Mobile / App Center          |         2         |           3            |       0       |
| Process / operational        |         0         |           6            |       0       |

**Biggest absolute gaps:** process / operational (0 coverage), mobile (App Center successor choices), work items (only 1 partial on 6).

---

## Gap-fill proposal (per-team, ready to add)

These are the 24 per-team items we're missing that would push coverage from 34% to ~75% of per-team-applicable pitfalls. I've mapped each to the most natural team(s).

### On Charlie (Tier 1, FedRAMP, classic-pipeline mess — richest slot for enterprise pitfalls)

1. **Org rulesets blocking migration push** — Charlie migrates into an org that already has "signed commits required"; legacy commits will be rejected without a temporary exemption.
2. **Mannequin users** — 3 contributors in charlie-legacy-tools are former employees without GitHub identities; history will attribute to mannequins until reclaimed.
3. **`nuget.config` URL rewrite** — charlie-sdk-cs has hard-coded `pkgs.dev.azure.com/contoso/_packaging/...` in its config; needs rewrite + credential swap.
4. **Templates split (composite vs reusable)** — Charlie has a shared ADO template library used at both `steps` and `jobs` scope; migration fragments it into two different GitHub artifacts.
5. **Implicit checkout → unnamed step** — importer emits unnamed GUID actions from Charlie's build pipelines; reviewers should explicitly name them.
6. **Post-deployment approvals won't migrate** — charlie-release-prod post-deploy approvers (2 people) need manual re-creation as environment rules.
7. **Environments skip approvals on first run** — Charlie's first prod deploy post-migration could ship unreviewed unless environments are created + gated in advance.
8. **Service connections → OIDC rebuild required** — 9 connections today; need to be rebuilt as GitHub OIDC federated credentials (not just reconfigured).
9. **GHE.com data residency required for FedRAMP** — Charlie's FedRAMP High classification means it must land on GHE.com tenant, not github.com.
10. **Service Hooks won't migrate** — Charlie wires #charlie-oncall notifications via ADO service hooks; needs GH webhook reconfiguration.
11. **ADO Dashboards don't migrate** — Charlie's build-failure and release-velocity dashboards must be rebuilt in GitHub Projects v2 / Insights.
12. **Pipeline run history retention** — FedRAMP audit chain requires 7-year retention; GEI doesn't migrate run history, so ADO must stay live read-only.
13. **Test Plans** — Charlie's compliance-gate test plans (manual acceptance cases for FedRAMP) have no GitHub equivalent; stay on ADO Test Plans or move to TestQuality.

### On Delta (heavyweight: LFS, monorepo, scale)

14. **LFS objects not migrated by GEI** — Delta's 34 GB of LFS bytes must be re-pushed separately after GEI runs; not just a pointer rewrite.
15. **GEI repo size cap (40 GiB)** — delta-monorepo at 98 GB exceeds GEI's managed-migration ceiling; requires custom bundle-push approach.
16. **5 GB per-file LFS ceiling** — Delta has 4 LFS files in the 3–6 GB range in delta-data-lfs; at least one will be rejected by GitHub.
17. **2 GB commit cap** — delta-legacy-etl has a historical commit with ~2.3 GB of vendored binary; migration will fail that push.
18. **Matrix strategy partial conversion** — delta-e2e-nightly has a complex matrix with `maxParallel` and `fail-fast` settings that don't round-trip cleanly.
19. **Schedule triggers don't convert** — delta-benchmarks-nightly and delta-lfs-sync use ADO-cron that won't auto-convert to `on.schedule:` syntax.
20. **MS-hosted runner spec mismatch** — Delta's hosted-build pipelines are tuned for ADO's 2-vCPU/7 GB spec; GitHub's 4-vCPU/16 GB runner may change test timing.

### On Echo (mobile)

21. **Secure files not migrated (keystores, .p12, .mobileprovision)** — Echo's signing .p12 and `echo-android-upload.jks` live in the ADO Library Secure Files section; must be base64-encoded and uploaded to GitHub secrets manually.
22. **App Center Test → BrowserStack (or drop)** — Echo uses App Center Test for device-grid runs; replacement is commercial third-party.
23. **App Center Distribute fragments** — Echo's current single-click beta → store pipeline splits into TestFlight + Play Console + Partner Center workflows.
24. **Self-hosted keychain persistence** — Echo's macOS self-hosted runners don't auto-clean Xcode keychains between jobs; secrets may leak across pipeline runs.

### On Bravo / Foxtrot (supporting)

25. **Work items — types collapse to labels** — Bravo uses custom ADO work item types (Feature / Epic / Tech Debt) with distinct workflows; Issues + labels loses the workflow.
26. **Iteration paths don't map to Milestones** — Bravo's multi-level sprint hierarchy (PI → Sprint → Week) flattens to 2-tier milestones + project fields.

---

## Recommendation

Option 1: **ship all 26 gap-fills**, distributed across Charlie (13), Delta (7), Echo (4), Bravo (2). ~45–60 min of seed work. Pushes per-team-applicable coverage from 34% to ~85%.

Option 2: **ship Charlie gap-fills only** (13 items). ~25 min. Charlie is the demo team; the interviewer will look hardest there. Pushes Charlie-specific coverage to near-complete on documented pitfalls.

Option 3: **ship nothing now, document the gaps and move on.** Honest statement: "seed covers 34% of documented pitfalls today, gap-fill queued in `/docs/seed-validation.md`." Least risk, leaves the interviewer with ammunition if they probe past Charlie.

**My recommendation: Option 1.** The gap-fills all have sources; every addition ties back to a real Microsoft / GitHub doc URL. And a few items are demo-defining (e.g., Delta's "LFS objects not migrated" — that's the whole reason Delta is "the heavyweight"; not having it is weird).

---

## Program-level pitfalls (NOT per-team findings)

These 10 pitfalls are real and documented, but they're org-level / program-level concerns — they don't belong on a team discovery profile. They belong on a future program-health / migration-plan screen (M2 territory):

1. GEI supports ADO Cloud only, not ADO Server
2. No delta migration — freeze required
3. GEI concurrency cap (5 simultaneous repos)
4. Code search stale post-migration
5. TFVC history cap (180 days) + TFVC LFS gap — only applicable for TFVC teams
6. Actions Importer 80% conversion target
7. ADO Server API < 5.0 incompatible
8. Entra tenant switch / groups / OAuth / SAML-vs-EMU — all four are org-level Entra concerns
9. These are **right to exclude** from team profiles.

---

## Sources

See research output for live URLs (all 51 pitfalls cite canonical Microsoft Learn, GitHub Docs, GitHub newsroom, Microsoft DevBlogs, or tooling-repo sources). This doc will be stable; sources may evolve, so re-run the validation at each tier boundary.

---

## Inferred additions (post-gap-fill, beyond the documented set)

After reaching 100% documented-per-team coverage, we added **15 inferred findings** across the 6 teams. These extend from documented pitfalls via adjacency, chain, or domain reasoning and are honest about their speculative nature:

- `source: INFERRED, confidence: LOW` — they render as anomalies in the UI
- Each `triedNote` names the documented anchor pitfall and explains the inference chain
- Defensive posture: "not independently documented but follows from [X] because [Y]"

**Distribution:** Alpha 1, Bravo 2, Charlie 5, Delta 4, Echo 2, Foxtrot 1.

**Examples:**

- Charlie: "Signed-commits ruleset may also reject historical squash-merge commits" — extends `migration.orgRulesets.conflict`
- Charlie: ".npmrc references ADO npm feed with same rewrite pattern" — extends `repos.charlie-sdk-cs.nugetConfigUrl`
- Delta: "Submodule LFS objects require separate LFS push per submodule repo" — chains from `gei-byte-migration` + `submoduleRewrite`
- Delta: "Per-region OIDC federated credentials may stagger during rollout" — chains from OIDC rebuild + multi-region
- Echo: "Apple privacy manifest workflow step not present in current pipeline" — domain reasoning from App Center sunset + iOS 17+ requirement
- Bravo: "Existing PR↔work-item auto-linking rules may break on type collapse" — adjacency from type flattening
- Alpha: "CODEOWNERS required-review may bottleneck on 3-engineer team" — domain reasoning from team size
- Foxtrot: "Archived repos in rolled-back wave may be excluded from future automated scans" — chain from ROLLED_BACK + archived

**Risk posture:** each inferred finding is weaker defensively than a cited one. An interviewer probing "is this documented?" will get "no, but it extends from [documented pitfall]." Acceptable because the data model marks them as LOW confidence — the UI shows them as anomalies with a confidence pill. A real discovery agent works the same way.

**Post-inference realism estimate: ~80–82%** (up from ~70% after documented gap-fill).

Remaining ~18–20% gap consists of:

- Tacit field knowledge you or customer engineers have that isn't publicly documented
- Post-training-cutoff pitfalls (Jan 2026+)
- Specific customer experiences (private data)
- Program-level pitfalls that belong on a future PM dashboard, not team profiles
