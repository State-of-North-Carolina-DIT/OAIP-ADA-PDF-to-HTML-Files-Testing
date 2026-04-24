# Sidebar Verdict Badges + Filter

## Goal

In the docs/ viewer's document sidebar, surface each document's audit verdict as a colored pill, and add chip-based filters so the user can narrow the list to Pass, Review, Fail, or No Audit at a glance.

## Verdict Aggregation

Source: the **new** audit (the new conversion is what's being evaluated). Old audits are not used for badging.

For documents with multiple provider audits (claude/gpt/gemini), aggregate via majority vote with ties broken to the worse verdict (`pass < review < fail`). Skipped or missing-file verdicts do **not** count as votes. If no provider has a `pass`/`review`/`fail` verdict, the doc gets the "No Audit" badge.

Single-audit docs (using `audit-report.json`) use that single verdict directly.

## Badge States

- **Pass** — green pill
- **Review** — amber pill (maps to `needs_review` or any verdict containing "review")
- **Fail** — red pill
- **No Audit** — neutral gray pill, used for both `skipped` audits and missing audit files
- **Loading** — neutral pill with a subtle pulse, shown while audit fetch is in flight

## Filter UI

Four toggle chips above the existing sidebar search box: Pass, Review, Fail, No Audit. All on by default. Clicking a chip toggles its state. Filter combines with the search box using AND logic. Sidebar count reflects filtered total.

## Data Loading

After `loadBatch()` populates `S.subdirs` and renders the sidebar, kick off parallel fetches for every doc's audit JSONs (only `audit-report*.json` files — not the heavy HTML/PDF). Update each row's badge as its data arrives. Cache verdicts in state so revisits are free. The filter operates on whatever's loaded; once all fetches resolve, filter is fully accurate.

Use `Promise.all` with a reasonable concurrency cap is unnecessary — GitHub raw handles this fine for batches up to ~100 docs × 3 providers.

## Files Touched

- `docs/app.js` — verdict fetch + aggregation, sidebar render, filter state and logic
- `docs/styles.css` — badge pills, filter chips
- `docs/index.html` — filter chip container above sidebar search

## Out of Scope

- Old audit verdicts in the badge
- Per-provider mini-badges (single aggregate badge only)
- Sorting by verdict
- URL persistence of filter state
