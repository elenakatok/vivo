# Vivo Knowledge Check — Structured Questions (v2)

**Status:** Updated from Gary's revised "Vivo Telecom: Knowledge Checks" (v6.9, addresses the graded-question imbalance). Ready to drop into the KC data model.
**Source:** Dr. Gary Bolton, "Vivo Telecom: Knowledge Checks," Center & Laboratory for Behavioral Operations & Economics, The University of Texas at Dallas. Last update: June 25, 2026.

---

## What changed from v1 (v6.4 → v6.9)

Gary rebalanced the graded MC questions. Previously Vivo had only **2** graded static MC (V2, V5) plus the role gate, while ADS had 5. Now Vivo has **4** graded static MC (V2, V3, V4, V5) plus the V1 role gate, and one prep (V6). (The platform's KC score counts only the static MC: the role gate is never in the numerator or denominator — so Vivo is scored **out of 4**, ADS **out of 5**.) Changes:
- **V3** (walk-away) — was open-response prep, now **graded MC**, correct = (a).
- **V4** (source-code / escrow) — was open-response prep, now **graded MC**, correct = (b).
- V6 remains the only Vivo prep (open-response).
- ADS is unchanged (A1–A5 graded, A6 prep).
- Scoring formulas and the contract form are unchanged — this is a KC-content-only revision.

---

## Grading rules (locked spec)

- **Graded MC questions only.** One point each. KC score = average of graded questions for the student's role.
- **Graded static MC (scored):** VIVO → V2, V3, V4, V5 (4). ADS → A1, A2, A3, A4, A5 (5). Plus a role-ID gate per role (VIVO V1 / ADS gate) — answered to proceed but **not** part of the KC score.
- **Prep / open-response (ungraded):** VIVO → V6. ADS → A6.
- **V1** is the role-identification gate (graded; correct answer "Vivo"). Returning students skip the role-ID step. No cohort reference.
- **Options shuffle per student** (deterministic hash of participantId + field, stable on reload).
- **Explanation text never references an answer by letter or position** (options shuffle). Explanations name the concept/value, not the slot. The source's "(a)", "(b)", "(d)" prefixes are rewritten here to name the substance.
- **role_target** uses the frozen role keys: vivo, ads.
- **Graded denominator is role-filtered:** each student is scored only on the graded static MC for their own role, and the role-ID gate is never in the numerator or denominator (VIVO out of 4, ADS out of 5).

---

## ROLE: vivo (Vivo Telecom)

### V1 — Role identification *(graded, 1 pt — role gate)*
**role_target:** vivo | **graded:** true | **format:** multiple_choice
**Prompt:** What is your role in the negotiation?
**Options:**
- Vivo *(correct)*
- ADS
**Explanation (correct):** You are Vivo, the buyer negotiating with ADS.

---

### V2 — Expected profit from a sample deal *(graded, 1 pt)*
**role_target:** vivo | **graded:** true | **format:** multiple_choice
**Prompt:** Answer this one using your Excel worksheet. What is your expected profit from a deal in which you pay ADS US$40 million, Vivo gets development-installation-servicing and full access to the source code, but does not get ownership of the software and ADS does not agree to a delivery SLA (so ADS will not cover late-delivery losses)?
**Options:**
- US$ 1 million *(correct)*
- US$ 7 million
- US$ -2 million
- US$ 4 million
**Explanation (correct):** Benefits = 35 (development-installation-service) + 9 (full source-code access) + 0 (no ownership) = 44. Costs = 40 (payment to ADS) + 3 (no SLA, so Vivo bears the expected late-delivery loss) = 43. Expected profit = 44 - 43 = US$ 1 million.

---

### V3 — Walk-away *(graded, 1 pt)* — NEW: was open-response in v1
**role_target:** vivo | **graded:** true | **format:** multiple_choice
**Prompt:** What is your walk-away for this negotiation?
**Options:**
- Walk away from any agreement that leaves Vivo with an expected profit below 0; keeping in mind ADS management's desire to get a foothold in South America. *(correct)*
- Walk away from any deal in which the price paid to ADS exceeds US$32 million, the figure in the letter of intent.
- Walk away unless Vivo obtains ownership of the software, since that is the issue worth the most to Vivo.
- Accept any deal that is offered; ADS was brought in to close this, so reaching an agreement matters more than the terms.
**Explanation (correct):** Vivo's walk-away is any agreement whose expected profit to Vivo is at least 0. Management has said a positive profit is enough to proceed, so Vivo should reject any deal with negative expected profit and otherwise try to do as well as possible. Fixing on a single price anchor ignores the whole package; treating ownership as a requirement makes a costly optional issue mandatory; and accepting any offered deal abandons the walk-away altogether.

---

### V4 — Source code as interest, not position *(graded, 1 pt)* — NEW: was open-response in v1
**role_target:** vivo | **graded:** true | **format:** multiple_choice
**Prompt:** Going into this negotiation, your aim is to protect Vivo against being left dependent on ADS — against future price gouging or being stranded if ADS stops supporting the system. ADS may resist handing over its source code outright. Which approach is most likely to get you the protection you need?
**Options:**
- Insist on outright transfer of the source code and treat it as a deal-breaker; it is the only way to be sure Vivo is protected.
- Focus on the protection you actually need rather than one particular form of it — and be open to an arrangement, such as the code being held by a neutral party and released to Vivo if ADS goes bankrupt, abandons support, or fails its commitments — which gives you that security while addressing ADS's concerns. *(correct)*
- Drop the source-code issue to keep things friendly, and rely on ADS's goodwill if problems come up later.
- Push hardest for ownership of the software instead, since it is the issue worth the most to Vivo on paper.
**Explanation (correct):** Outright transfer is a position; Vivo's underlying interest is protection against lock-in and gouging. Insisting on the position can stall the deal when the same interest can be met another way — an escrow arrangement gives Vivo the security it actually wants while letting ADS keep the code unless it fails to perform. Dropping the issue abandons the interest entirely; chasing ownership pursues the most expensive, least efficient issue (ownership costs ADS more than it is worth to Vivo) instead of the protection Vivo set out to get.

---

### V5 — Reading a hard opening *(graded, 1 pt)*
**role_target:** vivo | **graded:** true | **format:** multiple_choice
**Prompt:** Recall how this deal reached you: the first round of talks ended badly, and each company replaced its lead negotiator before this round. When you sit down, the ADS negotiator opens by pushing hard on price and sounds rigid and combative. Which response best serves your goal of getting a good agreement?
**Options:**
- Conclude that ADS is negotiating in bad faith — the last round already failed, and this confirms they are difficult — and harden your own position to match.
- Treat the hard opening as information about the problem, not the person: assume ADS faces real pressures of its own, keep the relationship cordial, and steer the talk toward the underlying business issues rather than trading personal jabs. *(correct)*
- Point out that the previous ADS team failed and that this negotiator risks the same outcome unless they soften.
- Stay silent on everything but price until ADS changes its tone.
**Explanation (correct):** A tough or rigid opening is easy to read as bad faith, but that reading is usually your own fear talking, not established fact — and meeting it in kind turns the negotiation into a contest of wills that leaves value unclaimed. Separating the people from the problem — staying warm toward the negotiator while pressing firmly on the substance — keeps the door open to the trades that actually make the deal better for Vivo. Blaming the person invites a defensive spiral; going silent needlessly sacrifices communication.

---

### V6 — Approaching a multi-issue negotiation *(prep — open response, ungraded)*
**role_target:** vivo | **graded:** false | **format:** open_response
**Prompt:** You and ADS have several issues to settle: the price, source code, the delivery guarantee, and software ownership. How do you think you should approach a negotiation with several issues like this one? Describe, in broad strokes, how you'd go about it.
**Guidance (open response):** No graded-correct answer; it surfaces the instincts students bring in. Listen for where each answer falls: settling issues one at a time (or fixing price first) versus considering them together or looking for trades across them. The spread of responses is the opener — the two tendencies can be placed side by side to introduce why issues might be linked, and whether handling them together changes how much value is available, not just how it is split.

---

## ROLE: ads (ADS)

### A1 — Ownership and its legal consequences *(graded, 1 pt)*
**role_target:** ads | **graded:** true | **format:** multiple_choice
**Prompt:** If Vivo has ownership of the software, then legally (choose one):
**Options:**
- Vivo automatically gets access to the source code.
- ADS would not be able to sell a copy of the software to Vivo's competitors. *(correct)*
- Vivo automatically gets installation of the software.
- ADS would be able to continue to sell copies of the software.
**Explanation (correct):** With ownership, Vivo holds the intellectual property rights, so ADS would not be able to sell the software to Vivo's competitors. Ownership is separate from source-code access and from installation.

---

### A2 — Walk-away *(graded, 1 pt)*
**role_target:** ads | **graded:** true | **format:** multiple_choice
**Prompt:** What is your walk-away for this negotiation?
**Options:**
- An expected profit of at least 0, consistent with the returns ADS expects on the other projects it takes on.
- An expected profit somewhat less than 0. ADS should be willing to take some loss to get a foothold in the South American market.
- An expected profit of exactly US$5 million, no more and no less, on every deal.
- Both of the first two can be argued to be correct. *(correct)*
**Explanation (correct):** There are arguments both for requiring a non-negative expected profit and for accepting some loss to gain a foothold in the South American market. Be prepared to argue for your view. Keep in mind your negotiation outcome will be scored by comparing the expected profit you achieve to those achieved by others in the ADS role.

---

### A3 — Expected profit from a sample deal *(graded, 1 pt)*
**role_target:** ads | **graded:** true | **format:** multiple_choice
**Prompt:** Answer this one using your Excel worksheet. What is your expected profit from a deal in which Vivo pays you US$42 million, Vivo gets development-installation-servicing and full access to the source code, does not get ownership of the software, and ADS agrees to the delivery SLA (covering late-delivery losses)?
**Options:**
- US$ 7 million *(correct)*
- US$ 14 million
- US$ 3 million
- US$ 9 million
**Explanation (correct):** Revenue = 42 (Vivo's payment). Costs = 28 (development-installation-service) + 6 (full source-code access) + 0 (no ownership) + 1 (SLA agreed) = 35. Expected profit = 42 - 35 = US$ 7 million.

---

### A4 — Source code: position vs interest *(graded, 1 pt)*
**role_target:** ads | **graded:** true | **format:** multiple_choice
**Prompt:** Suppose Vivo arrives demanding that the source code be handed over outright and treats it as a deal-breaker. Your own concern is that handing over the code exposes ADS to piracy. Which approach is most likely to produce an agreement that works for ADS?
**Options:**
- Refuse the demand flatly; the two positions — "give us the code" versus "keep the code" — cannot both be satisfied, so one side must simply lose.
- Look past the stated demand to what each side actually needs — Vivo wants protection against being left stranded if ADS fails it, while ADS needs to keep the code out of competitors' hands — and propose a structure such as escrow that serves both needs at once. *(correct)*
- Concede the code to preserve the relationship, since keeping Vivo happy matters more than the piracy risk.
- Offer a lower price instead and hope Vivo drops the source-code issue.
**Explanation (correct):** The hand-over demand is a position; the interest beneath it is Vivo's need for protection against lock-in and future gouging. ADS's interest is protection against piracy. Stated as positions the two are irreconcilable, but stated as interests they are not: an escrow arrangement — code held by a neutral party, released only if ADS goes bankrupt, abandons support, or fails its commitments — gives Vivo the security it actually wants while letting ADS keep the code unless it fails to perform. Assuming a fixed win-lose pie, giving away a costly asset to solve a problem cheaper means can solve, or ignoring the real interest, all leave value on the table.

---

### A5 — Reading a hard opening *(graded, 1 pt)*
**role_target:** ads | **graded:** true | **format:** multiple_choice
**Prompt:** Recall how this deal reached you: the first round of talks ended badly, and each company replaced its lead negotiator before this round. When you sit down, the Vivo negotiator opens by pushing hard on price and sounds rigid and combative. Which response best serves your goal of getting a good agreement?
**Options:**
- Conclude that Vivo is negotiating in bad faith — the last round already failed, and this confirms they are difficult — and harden your own position to match.
- Treat the hard opening as information about the problem, not the person: assume Vivo faces real pressures of its own, keep the relationship cordial, and steer the talk toward the underlying business issues rather than trading personal jabs. *(correct)*
- Point out that the previous Vivo team failed and that this negotiator risks the same outcome unless they soften.
- Stay silent on everything but price until Vivo changes its tone.
**Explanation (correct):** A tough or rigid opening is easy to read as bad faith, but that reading is usually your own fear talking, not established fact — and meeting it in kind turns the negotiation into a contest of wills that leaves value unclaimed. Separating the people from the problem — staying warm toward the negotiator while pressing firmly on the substance — keeps the door open to the trades that actually make the deal better for ADS. Blaming the person invites a defensive spiral; going silent needlessly sacrifices communication.

---

### A6 — Approaching a multi-issue negotiation *(prep — open response, ungraded)*
**role_target:** ads | **graded:** false | **format:** open_response
**Prompt:** You and Vivo have several issues to settle: the price, source code, the delivery guarantee, and software ownership. How do you think you should approach a negotiation with several issues like this one? Describe, in broad strokes, how you'd go about it.
**Guidance (open response):** No graded-correct answer; it surfaces the instincts students bring in. Listen for where each answer falls: settling issues one at a time (or fixing price first) versus considering them together or looking for trades across them. The spread of responses is the opener — the two tendencies can be placed side by side to introduce why issues might be linked, and whether handling them together changes how much value is available, not just how it is split.

---

## Scoring formulas (unchanged — reference only)

All values $M, value-sense:
- **ADS** = P - (DEV?28:0) - (OWN?16:0) - (C=Escrow?2 : C=Full?6 : 0) - (SLA?1:0)
- **Vivo** = (DEV?35:0) + (OWN?12:0) + (C=Escrow?6 : C=Full?9 : 0) - P - (SLA?0:3)

Contract form: P Payment (decimal), DEV Development (bool), OWN Software Ownership (bool), C Source Code (enum Escrow/Full/Neither, required), SLA Delivery SLA (bool), notes (optional text). The -3 Vivo penalty keys on SLA=no.
