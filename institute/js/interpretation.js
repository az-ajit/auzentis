// Layer 2 — Validated interpretation rules (see SCORING_AND_EVALUATION_MANUAL.md).
// Deterministic, versioned, rule-based — NOT AI-generated. Thresholds and
// wording here are design placeholders pending real psychometric review
// (see PSYCHOMETRIC_VALIDATION_PLAN.md) — they produce a readable report
// shape now, but are not yet validated norms.
//
// NOTE: this currently runs client-side in admin.html at report-approval
// time. SOFTWARE_ARCHITECTURE.md earmarks a dedicated interpretation-engine
// Edge Function for this — client-side is a pilot-stage simplification,
// tracked in DECISIONS_AND_ASSUMPTIONS.md.

const INTERPRETATION_RULE_VERSION = "interp-v1";

const DOMAIN_GUIDANCE = {
  "Numerical Aptitude": {
    strong: "Enrich with multi-step word problems, estimation challenges, and real-world measurement tasks.",
    developing: "Practice daily arithmetic drills and simple word problems to build consistency.",
    needs_focus: "Start with foundational number-sense activities (counting, basic operations) at a comfortable pace.",
  },
  "Verbal Aptitude": {
    strong: "Enrich with reading above current level and discussing vocabulary in context.",
    developing: "Read age-appropriate material aloud regularly and discuss new words encountered.",
    needs_focus: "Build foundational vocabulary through picture books, flashcards, and short daily reading.",
  },
  "Logical Aptitude": {
    strong: "Enrich with strategy games, logic puzzles, and open-ended reasoning challenges.",
    developing: "Practice pattern and sequence puzzles a few times a week.",
    needs_focus: "Start with simple sorting, matching, and pattern-recognition activities.",
  },
  "Memory": {
    strong: "Enrich with longer recall sequences and memory-strategy techniques (chunking, association).",
    developing: "Practice short recall games such as matching pairs or sequence repetition.",
    needs_focus: "Build foundational memory skills with very short, repeated recall exercises.",
  },
  "Attention": {
    strong: "Enrich with timed, multi-step focus tasks and reduced external prompting.",
    developing: "Use short, timed focus exercises and minimize multitasking during study.",
    needs_focus: "Start with brief, low-distraction attention tasks and build duration gradually.",
  },
  "Problem-Solving": {
    strong: "Enrich with open-ended, multi-step real-world problems and project-based tasks.",
    developing: "Work through multi-step word problems with explicit step-by-step reasoning.",
    needs_focus: "Start with single-step problems and build toward two-step reasoning gradually.",
  },
};

function bandForScore(score) {
  if (score >= 80) return "strong";
  if (score >= 50) return "developing";
  return "needs_focus";
}

const BAND_LABEL = { strong: "Strong", developing: "Developing", needs_focus: "Needs Focus" };

const BAND_SENTENCE = {
  strong: (domain) => `Demonstrates strong performance in ${domain}, consistently applying relevant skills correctly.`,
  developing: (domain) => `Shows developing ability in ${domain}, with a solid foundation and room to build further consistency.`,
  needs_focus: (domain) => `Would benefit from additional practice and support in ${domain} to build core skills.`,
};

// domainResults: [{ domain_name, domain_score, correct_count, total_count }]
function buildReportContent({ participant, assessmentTitle, domainResults, overallAccuracy, timeTakenSeconds, startedAt }) {
  const sections = domainResults.map((d) => {
    const band = bandForScore(d.domain_score);
    return {
      domain: d.domain_name,
      score: d.domain_score,
      correct_count: d.correct_count,
      total_count: d.total_count,
      band,
      band_label: BAND_LABEL[band],
      summary: BAND_SENTENCE[band](d.domain_name),
      recommendation: (DOMAIN_GUIDANCE[d.domain_name] || {})[band] || "Continue regular practice in this area.",
    };
  });

  const strengths = sections.filter((s) => s.band === "strong");
  const developmentAreas = sections.filter((s) => s.band !== "strong");

  const executiveSummary = sections.length
    ? `Across ${sections.length} domain${sections.length === 1 ? "" : "s"} assessed, overall accuracy was ${overallAccuracy}%. ` +
      (strengths.length ? `Relative strengths were observed in ${strengths.map((s) => s.domain).join(", ")}. ` : "") +
      (developmentAreas.length ? `Areas with room to develop further include ${developmentAreas.map((s) => s.domain).join(", ")}.` : "")
    : "No scored domains were available for this session.";

  return {
    interpretation_rule_version: INTERPRETATION_RULE_VERSION,
    participant_name: participant.full_name,
    age_band_code: participant.age_band_code,
    assessment_title: assessmentTitle,
    started_at: startedAt,
    time_taken_seconds: timeTakenSeconds,
    overall_accuracy: overallAccuracy,
    executive_summary: executiveSummary,
    domain_sections: sections,
    strengths: strengths.map((s) => s.domain),
    development_areas: developmentAreas.map((s) => s.domain),
    limitations: [
      "This platform's question bank is in pilot (draft/under-review) status — results are not yet backed by formal reliability/validity evidence.",
      "A single assessment session is one data point, not a complete picture of ability.",
      "Scores reflect performance on this specific item set under these specific conditions, not an innate or fixed trait.",
    ],
  };
}
