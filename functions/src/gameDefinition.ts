import type { Outcome, OutcomeSchema, RoleConfig } from '@mygames/game-engine'
import type { GameDefinition } from '@mygames/game-server'

// ── Role config ───────────────────────────────────────────────────────────────
// Frozen role keys: 'vivo', 'ads'. Display labels: "Vivo", "ADS".

export const vivoConfig: RoleConfig = {
  roles: [
    { key: 'vivo', label: 'Vivo', short: 'V' },
    { key: 'ads',  label: 'ADS',  short: 'A' },
  ],
}

// ── Outcome schema (the negotiated contract) ─────────────────────────────────
// 5 issues + the shared optional Notes text field. C is a required enum (no default).
export const vivoSchema: OutcomeSchema = [
  { key: 'P',   type: 'decimal', min: 0, max: 1000 },                 // Payment Vivo→ADS ($M)
  { key: 'DEV', type: 'boolean' },                                    // Development (yes/no)
  { key: 'OWN', type: 'boolean' },                                    // Software Ownership (yes/no)
  { key: 'C',   type: 'enum', options: ['Escrow', 'Full', 'Neither'] }, // Source Code (required pick)
  { key: 'SLA', type: 'boolean' },                                    // Delivery SLA (yes/no)
  { key: 'notes', type: 'text' },                                     // optional free-text; blank = ''
]

// ── Score sense (both value-sense — higher surplus = better) ─────────────────
export const vivoScoreSense: Record<string, 'value' | 'cost'> = {
  vivo: 'value',
  ads:  'value',
}

// ── Scoring (spec-locked; units $M, value-sense) ─────────────────────────────
//   ADS  = P − (DEV?28:0) − (OWN?16:0) − (C=Escrow?2 : C=Full?6 : 0) − (SLA?1:0)
//   Vivo = (DEV?35:0) + (OWN?12:0) + (C=Escrow?6 : C=Full?9 : 0) − P − (SLA?0:3)
// The −3 on Vivo is the expected late-delivery loss Vivo bears when there is NO SLA.
// Walk-away / no-deal (null outcome) → surplus 0 for both (took BATNA).

type SourceCode = 'Escrow' | 'Full' | 'Neither'

function adsCodeCost(c: SourceCode): number {
  return c === 'Escrow' ? 2 : c === 'Full' ? 6 : 0
}
function vivoCodeBenefit(c: SourceCode): number {
  return c === 'Escrow' ? 6 : c === 'Full' ? 9 : 0
}

export function computeScoreBreakdown(
  roleKey: string,
  outcome: Outcome | null,
  _configData?: Record<string, unknown>,
): { value_or_cost: number; raw_score: number } {
  if (outcome === null) {
    return { value_or_cost: 0, raw_score: 0 }
  }

  const P   = outcome['P']   as number
  const DEV = outcome['DEV'] as boolean
  const OWN = outcome['OWN'] as boolean
  const C   = outcome['C']   as SourceCode
  const SLA = outcome['SLA'] as boolean

  if (roleKey === 'ads') {
    const score = P - (DEV ? 28 : 0) - (OWN ? 16 : 0) - adsCodeCost(C) - (SLA ? 1 : 0)
    return { value_or_cost: score, raw_score: score }
  } else {
    const score = (DEV ? 35 : 0) + (OWN ? 12 : 0) + vivoCodeBenefit(C) - P - (SLA ? 0 : 3)
    return { value_or_cost: score, raw_score: score }
  }
}

export function computeRawScore(roleKey: string, outcome: Outcome | null, configData?: Record<string, unknown>): number {
  return computeScoreBreakdown(roleKey, outcome, configData).raw_score
}

// ── GameDefinition ───────────────────────────────────────────────────────────

export const vivoGameDef: GameDefinition = {
  game_id: 'vivo',
  roles:   vivoConfig,
  scoreSense: vivoScoreSense,
  composition: { vivo: 1, ads: 1 },
  outcomeSchema: vivoSchema,
  computeRawScore,
  computeScoreBreakdown,
  reservations: { vivo: 0, ads: 0 },
  corsOrigins: ['https://vivo.mygames.live'],
  classroom: { callbackSecretId: 'CLASSROOM_CALLBACK_SECRET' },

  configFields: [
    { key: 'vivo_role_name', kind: 'string', default: 'Vivo' },
    { key: 'ads_role_name',  kind: 'string', default: 'ADS'  },
    { key: 'vivo_sheet_url', kind: 'url', default: '/role-info/vivo.pdf' },
    { key: 'ads_sheet_url',  kind: 'url', default: '/role-info/ads.pdf'  },
  ],

  roleInfoLinks: [
    { roleKey: 'vivo', links: [{ key: 'vivo_sheet_url', label: 'Role sheet' }] },
    { roleKey: 'ads',  links: [{ key: 'ads_sheet_url',  label: 'Role sheet' }] },
  ],

  // ── Knowledge-check + prep questions (verbatim from Vivo_KC_Questions_v1.md) ──
  // Graded denominator is role-filtered: VIVO static graded = V2,V5 (2); ADS = A1..A5 (5).
  // V1 is the VIVO role-ID gate; kc_gate_ads is the parallel ADS role-ID gate (platform-required).
  prepDefaults: [
    // ── Role-ID gates (system, one per role) ──────────────────────────────────
    {
      field: 'kc_gate_vivo', type: 'mc', system: true,
      category: 'knowledge_check', format: 'multiple_choice',
      grading: 'assigned_role', role_target: 'vivo',
      prompt: 'What is your role in the negotiation?',
      placeholder: '', order: 0, hidden: false, deletable: false,
      options: [
        { value: 'vivo', label: 'Vivo' },
        { value: 'ads',  label: 'ADS'  },
      ],
      explanation: 'You are Vivo, the buyer negotiating with ADS.',
    },
    {
      field: 'kc_gate_ads', type: 'mc', system: true,
      category: 'knowledge_check', format: 'multiple_choice',
      grading: 'assigned_role', role_target: 'ads',
      prompt: 'What is your role in the negotiation?',
      placeholder: '', order: 0, hidden: false, deletable: false,
      options: [
        { value: 'vivo', label: 'Vivo' },
        { value: 'ads',  label: 'ADS'  },
      ],
      explanation: 'You are ADS, the supplier negotiating with Vivo.',
    },

    // ── VIVO graded static MC: V2, V5 ─────────────────────────────────────────
    {
      field: 'kc_vivo_profit', type: 'mc', system: false,
      category: 'knowledge_check', format: 'multiple_choice',
      grading: 'static', correct_value: 'p1m', role_target: 'vivo',
      prompt: 'Answer this one using your Excel worksheet. What is your expected profit from a deal in which you pay ADS US$40 million, Vivo gets development-installation-servicing and full access to the source code, but does not get ownership of the software and ADS does not agree to a delivery SLA (so ADS will not cover late-delivery losses)?',
      placeholder: '', order: 10, hidden: false, deletable: false,
      options: [
        { value: 'p1m',  label: 'US$ 1 million' },
        { value: 'p7m',  label: 'US$ 7 million' },
        { value: 'pn2m', label: 'US$ -2 million' },
        { value: 'p4m',  label: 'US$ 4 million' },
      ],
      explanation: 'Benefits = 35 (development-installation-service) + 9 (full source-code access) + 0 (no ownership) = 44. Costs = 40 (payment to ADS) + 3 (no SLA, so Vivo bears the expected late-delivery loss) = 43. Expected profit = 44 − 43 = US$ 1 million.',
    },
    {
      field: 'kc_vivo_hardopening', type: 'mc', system: false,
      category: 'knowledge_check', format: 'multiple_choice',
      grading: 'static', correct_value: 'separate_people', role_target: 'vivo',
      prompt: 'Recall how this deal reached you: the first round of talks ended badly, and each company replaced its lead negotiator before this round. When you sit down, the ADS negotiator opens by pushing hard on price and sounds rigid and combative. Which response best serves your goal of getting a good agreement?',
      placeholder: '', order: 11, hidden: false, deletable: false,
      options: [
        { value: 'bad_faith',       label: 'Conclude that ADS is negotiating in bad faith — the last round already failed, and this confirms they are difficult — and harden your own position to match.' },
        { value: 'separate_people', label: 'Treat the hard opening as information about the problem, not the person: assume ADS faces real pressures of its own, keep the relationship cordial, and steer the talk toward the underlying business issues rather than trading personal jabs.' },
        { value: 'blame_previous',  label: 'Point out that the previous ADS team failed and that this negotiator risks the same outcome unless they soften.' },
        { value: 'stay_silent',     label: 'Stay silent on everything but price until ADS changes its tone.' },
      ],
      explanation: 'A tough or rigid opening is easy to read as bad faith, but that reading is usually your own fear talking, not established fact — and meeting it in kind turns the negotiation into a contest of wills that leaves value unclaimed. Separating the people from the problem — staying warm toward the negotiator while pressing firmly on the substance — keeps the door open to the trades that actually make the deal better for Vivo. Blaming the person invites a defensive spiral; going silent needlessly sacrifices communication.',
    },

    // ── ADS graded static MC: A1, A2, A3, A4, A5 ──────────────────────────────
    {
      field: 'kc_ads_ownership', type: 'mc', system: false,
      category: 'knowledge_check', format: 'multiple_choice',
      grading: 'static', correct_value: 'no_sell_competitors', role_target: 'ads',
      prompt: 'If Vivo has ownership of the software, then legally (choose one):',
      placeholder: '', order: 10, hidden: false, deletable: false,
      options: [
        { value: 'auto_source',         label: 'Vivo automatically gets access to the source code.' },
        { value: 'no_sell_competitors', label: "ADS would not be able to sell a copy of the software to Vivo's competitors." },
        { value: 'auto_install',        label: 'Vivo automatically gets installation of the software.' },
        { value: 'keep_selling',        label: 'ADS would be able to continue to sell copies of the software.' },
      ],
      explanation: "With ownership, Vivo holds the intellectual property rights, so ADS would not be able to sell the software to Vivo's competitors. Ownership is separate from source-code access and from installation.",
    },
    {
      field: 'kc_ads_walkaway', type: 'mc', system: false,
      category: 'knowledge_check', format: 'multiple_choice',
      grading: 'static', correct_value: 'both', role_target: 'ads',
      prompt: 'What is your walk-away for this negotiation?',
      placeholder: '', order: 11, hidden: false, deletable: false,
      options: [
        { value: 'nonneg',     label: 'An expected profit of at least 0, consistent with the returns ADS expects on the other projects it takes on.' },
        { value: 'some_loss',  label: 'An expected profit somewhat less than 0. ADS should be willing to take some loss to get a foothold in the South American market.' },
        { value: 'exactly_5m', label: 'An expected profit of exactly US$5 million, no more and no less, on every deal.' },
        { value: 'both',       label: 'Both of the first two can be argued to be correct.' },
      ],
      explanation: 'There are arguments both for requiring a non-negative expected profit and for accepting some loss to gain a foothold in the South American market. Be prepared to argue for your view. Keep in mind your negotiation outcome will be scored by comparing the expected profit you achieve to those achieved by others in the ADS role.',
    },
    {
      field: 'kc_ads_profit', type: 'mc', system: false,
      category: 'knowledge_check', format: 'multiple_choice',
      grading: 'static', correct_value: 'p7m', role_target: 'ads',
      prompt: 'Answer this one using your Excel worksheet. What is your expected profit from a deal in which Vivo pays you US$42 million, Vivo gets development-installation-servicing and full access to the source code, does not get ownership of the software, and ADS agrees to the delivery SLA (covering late-delivery losses)?',
      placeholder: '', order: 12, hidden: false, deletable: false,
      options: [
        { value: 'p7m',  label: 'US$ 7 million' },
        { value: 'p14m', label: 'US$ 14 million' },
        { value: 'p3m',  label: 'US$ 3 million' },
        { value: 'p9m',  label: 'US$ 9 million' },
      ],
      explanation: 'Revenue = 42 (Vivo\'s payment). Costs = 28 (development-installation-service) + 6 (full source-code access) + 0 (no ownership) + 1 (SLA agreed) = 35. Expected profit = 42 − 35 = US$ 7 million.',
    },
    {
      field: 'kc_ads_sourcecode', type: 'mc', system: false,
      category: 'knowledge_check', format: 'multiple_choice',
      grading: 'static', correct_value: 'interests_escrow', role_target: 'ads',
      prompt: 'Suppose Vivo arrives demanding that the source code be handed over outright and treats it as a deal-breaker. Your own concern is that handing over the code exposes ADS to piracy. Which approach is most likely to produce an agreement that works for ADS?',
      placeholder: '', order: 13, hidden: false, deletable: false,
      options: [
        { value: 'refuse_flatly',    label: 'Refuse the demand flatly; the two positions — "give us the code" versus "keep the code" — cannot both be satisfied, so one side must simply lose.' },
        { value: 'interests_escrow', label: "Look past the stated demand to what each side actually needs — Vivo wants protection against being left stranded if ADS fails it, while ADS needs to keep the code out of competitors' hands — and propose a structure such as escrow that serves both needs at once." },
        { value: 'concede_code',     label: 'Concede the code to preserve the relationship, since keeping Vivo happy matters more than the piracy risk.' },
        { value: 'lower_price',      label: 'Offer a lower price instead and hope Vivo drops the source-code issue.' },
      ],
      explanation: "The hand-over demand is a position; the interest beneath it is Vivo's need for protection against lock-in and future gouging. ADS's interest is protection against piracy. Stated as positions the two are irreconcilable, but stated as interests they are not: an escrow arrangement — code held by a neutral party, released only if ADS goes bankrupt, abandons support, or fails its commitments — gives Vivo the security it actually wants while letting ADS keep the code unless it fails to perform. Assuming a fixed win-lose pie, or giving away a costly asset to solve a problem cheaper means can solve, or ignoring the real interest, all leave value on the table.",
    },
    {
      field: 'kc_ads_hardopening', type: 'mc', system: false,
      category: 'knowledge_check', format: 'multiple_choice',
      grading: 'static', correct_value: 'separate_people', role_target: 'ads',
      prompt: 'Recall how this deal reached you: the first round of talks ended badly, and each company replaced its lead negotiator before this round. When you sit down, the Vivo negotiator opens by pushing hard on price and sounds rigid and combative. Which response best serves your goal of getting a good agreement?',
      placeholder: '', order: 14, hidden: false, deletable: false,
      options: [
        { value: 'bad_faith',       label: 'Conclude that Vivo is negotiating in bad faith — the last round already failed, and this confirms they are difficult — and harden your own position to match.' },
        { value: 'separate_people', label: 'Treat the hard opening as information about the problem, not the person: assume Vivo faces real pressures of its own, keep the relationship cordial, and steer the talk toward the underlying business issues rather than trading personal jabs.' },
        { value: 'blame_previous',  label: 'Point out that the previous Vivo team failed and that this negotiator risks the same outcome unless they soften.' },
        { value: 'stay_silent',     label: 'Stay silent on everything but price until Vivo changes its tone.' },
      ],
      explanation: 'A tough or rigid opening is easy to read as bad faith, but that reading is usually your own fear talking, not established fact — and meeting it in kind turns the negotiation into a contest of wills that leaves value unclaimed. Separating the people from the problem — staying warm toward the negotiator while pressing firmly on the substance — keeps the door open to the trades that actually make the deal better for ADS. Blaming the person invites a defensive spiral; going silent needlessly sacrifices communication.',
    },

    // ── VIVO prep / open-response (ungraded): V3, V4, V6 ──────────────────────
    {
      field: 'prep_vivo_walkaway', type: 'text', system: false,
      category: 'preparation', format: 'text', role_target: 'vivo',
      prompt: 'What is your walk-away for this negotiation?',
      placeholder: 'Think about what makes a deal worth doing at all.',
      order: 20, hidden: false, deletable: true,
    },
    {
      field: 'prep_vivo_priorities', type: 'text', system: false,
      category: 'preparation', format: 'text', role_target: 'vivo',
      prompt: 'Going into this negotiation, what are your priorities? That is, what are the major things you hope to achieve by way of getting an agreement?',
      placeholder: '', order: 21, hidden: false, deletable: true,
    },
    {
      field: 'prep_vivo_multiissue', type: 'text', system: false,
      category: 'preparation', format: 'text', role_target: 'vivo',
      prompt: "You and ADS have several issues to settle: the price, source code, the delivery guarantee, and software ownership. How do you think you should approach a negotiation with several issues like this one? Describe, in broad strokes, how you'd go about it.",
      placeholder: '', order: 22, hidden: false, deletable: true,
    },

    // ── ADS prep / open-response (ungraded): A6 ───────────────────────────────
    {
      field: 'prep_ads_multiissue', type: 'text', system: false,
      category: 'preparation', format: 'text', role_target: 'ads',
      prompt: "You and Vivo have several issues to settle: the price, source code, the delivery guarantee, and software ownership. How do you think you should approach a negotiation with several issues like this one? Describe, in broad strokes, how you'd go about it.",
      placeholder: '', order: 20, hidden: false, deletable: true,
    },
  ],

  content: {
    infoPDFs:      {} as Record<string, { private: string; public?: string }>,
    kcQuestions:   [],
    prepQuestions: [],
    scenarioText:  {},
  },
}

// ── Frozen conformance vector (spec-verified ground truth) ────────────────────

export type ConformanceCase = {
  label: string
  outcome: Outcome
  expectedADS: number
  expectedVivo: number
}

export const CONFORMANCE_VECTOR: ConformanceCase[] = [
  {
    label: 'Case 1: P=40, DEV=yes, OWN=no, C=Full, SLA=no',
    outcome: { P: 40, DEV: true, OWN: false, C: 'Full', SLA: false },
    expectedADS: 6, expectedVivo: 1,
  },
  {
    label: 'Case 2: P=42, DEV=yes, OWN=no, C=Full, SLA=yes',
    outcome: { P: 42, DEV: true, OWN: false, C: 'Full', SLA: true },
    expectedADS: 7, expectedVivo: 2,
  },
  {
    label: 'Case 3: P=30, DEV=yes, OWN=yes, C=Escrow, SLA=yes',
    outcome: { P: 30, DEV: true, OWN: true, C: 'Escrow', SLA: true },
    expectedADS: -17, expectedVivo: 23,
  },
  {
    label: 'Case 4: P=0, DEV=no, OWN=no, C=Neither, SLA=no',
    outcome: { P: 0, DEV: false, OWN: false, C: 'Neither', SLA: false },
    expectedADS: 0, expectedVivo: -3,
  },
]
