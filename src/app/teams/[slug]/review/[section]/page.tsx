import { notFound } from "next/navigation";
import { ChunkMain } from "@/components/review-chunk/ChunkMain";
import { ReviewShell } from "@/components/review-chunk/ReviewShell";
import { SECTION_BY_SLUG, type ReviewSectionSlug } from "@/lib/review-sections";
import { getCodeReposChunk } from "@/server/review-code-repos";

export const dynamic = "force-dynamic";

export default async function TeamReviewSectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; section: string }>;
  searchParams: Promise<{ sub?: string; repo?: string; ada?: string }>;
}) {
  const { slug, section: sectionSlug } = await params;
  const { sub, repo, ada: adaFieldId } = await searchParams;
  const section = SECTION_BY_SLUG.get(sectionSlug as ReviewSectionSlug);
  if (!section) notFound();

  // Section 01 (Code & repos) is wired to real data. 02–05 render the
  // shell with a placeholder main so the reviewer can still navigate.
  if (section.slug === "code-and-repos") {
    // eslint-disable-next-line react-hooks/purity -- server component renders once per request
    const nowMs = Date.now();
    const chunk = await getCodeReposChunk(slug, nowMs, sub, repo);
    if (!chunk) notFound();

    // Find the field Ada should scope to. Walk all subsections so the panel
    // can be opened from any subject's card.
    const adaMatch = adaFieldId
      ? chunk.subsections
          .flatMap((s) => s.fields.map((f) => ({ field: f, subsection: s })))
          .find((x) => x.field.id === adaFieldId)
      : null;
    const adaProps = adaMatch
      ? {
          fieldId: adaMatch.field.id,
          fieldLabel: adaMatch.field.question ?? adaMatch.field.label,
          fieldSubject: adaMatch.subsection.currentSubjectName ?? null,
          fieldValue: adaMatch.field.value,
        }
      : null;

    return (
      <ReviewShell
        section={section}
        teamSlug={slug}
        chunk={chunk}
        ada={adaProps}
      >
        <ChunkMain chunk={chunk} section={section} teamSlug={slug} />
      </ReviewShell>
    );
  }

  return (
    <ReviewShell section={section} teamSlug={slug} chunk={null}>
      <SectionPlaceholder
        sectionLabel={section.label}
        sectionSubtitle={section.subtitle}
        sectionNumber={section.number}
      />
    </ReviewShell>
  );
}

function SectionPlaceholder({
  sectionLabel,
  sectionSubtitle,
  sectionNumber,
}: {
  sectionLabel: string;
  sectionSubtitle: string;
  sectionNumber: number;
}) {
  return (
    <div className="max-w-[860px] px-11 pb-10 pt-9">
      <div className="mb-[26px] border-b border-border pb-[18px]">
        <div className="mb-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-muted">
          Section {String(sectionNumber).padStart(2, "0")} of 05 ·{" "}
          {sectionLabel.toUpperCase()}
        </div>
        <h2 className="mb-1.5 text-[24px] font-bold leading-[1.15] tracking-[-0.02em] text-ink">
          {sectionLabel}
        </h2>
        <p className="text-[15px] font-medium leading-[1.5] tracking-[-0.005em] text-ink-soft">
          {sectionSubtitle}
        </p>
      </div>
      <div className="rounded-lg border border-dashed border-border-strong bg-bg-elevated px-8 py-10 text-center">
        <div className="mb-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
          Content coming soon
        </div>
        <p className="text-[13.5px] text-ink-muted">
          This section is scaffolded. Review items will appear here once the
          underlying data is wired in.
        </p>
      </div>
    </div>
  );
}
