# Design

## Context

The site is an EmDash (Astro 7, `output: "server"`) marketing build on Cloudflare: schema and seeded content come from `scripts/build-seed.py` → `seed/seed.json` (never hand-edited), blocks render through `KatBlocks.astro`, pages resolve through `[slug].astro`, and the enquiry endpoint `POST /api/enquiry` writes D1 (`DB` binding) via `src/lib/enquiries.ts`, whose `ensureTable()` creates `kat_enquiries` on first use. R2 exists as the `MEDIA` binding (`kat-arabia-media`), currently reserved for EmDash's media library.

The Corporate Edition copy deck (Word doc in `~/Downloads`) is the authoritative copy: 11 service pages, 8 top-level pages, expanded enquiry form, explicit page titles and meta descriptions. Decisions already taken with the user: replace the `strengths` and `locations` pages, and ship the full form **including** tender-document upload. See proposal.md — Why.

## Goals / Non-Goals

**Goals:**
- Site content matches the deck: services, pages, home sections, SEO fields, contact form.
- Editors can add project profiles themselves, with drafts until cleared for publication.
- Tender uploads land in R2, are size/type-checked, and are admin-only.

**Non-Goals:**
- Filling the deck's "To Confirm Before Launch" items (phones, leadership bios, named projects, logo permissions) — placeholders remain.
- Email notification of enquiries (existing phase-2 item).
- Redesign: palette, typography, and block visuals stay as-is; only content and the new block follow existing patterns.
- Project detail pages (`/projects/[slug]`) — listings only for now.

## Decisions

**1. Schema and content change goes through `build-seed.py`.**
Collections, block types, menus, and seeded entries are edited in `scripts/build-seed.py`, then `pnpm seed:build` + `pnpm seed:validate` regenerate `seed/seed.json` (project constraint: the seed is generated). Existing DB rows are updated by re-applying the seed rather than manual SQL. *Alternative rejected:* editing `seed/seed.json` directly — it is overwritten on the next build.

**1b. Deck SEO lands via a post-seed script, not the seed itself.**
EmDash's seed engine never writes `_emdash_seo` (SEO lives in a separate table `applySeed` doesn't touch), so `build-seed.py` emits the deck's page titles and meta descriptions to `seed/seo.json` and `scripts/apply-seo.py` upserts them into the target database *after* `emdash seed` runs — both against the same DB path. Re-run `apply-seo.py` after every seed apply. In dev the DB is the miniflare D1 at `.wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite`, **not** the CLI's default `./data.db`; point both commands at the miniflare file.

**2. Services grow to 11 with stable slugs; existing slugs do not change.**
Add `energy-electrical-solar`, `camp-construction-maintenance`, `engineering-contracting-project-management`; keep the 8 existing slugs (only titles/copy change, e.g. `mep` → "Mechanical, Electrical & Plumbing (MEP) and Electro-Mechanical Solutions", `integrated-project-workforce` → "Project Workforce Solutions"). *Rationale:* existing slugs are already linked from menus and service tabs; renaming them would break URLs (the deck's meta descriptions are attached to entries, not slugs).

**3. New pages are `pages` entries; no new route files.**
`industries`, `projects`, `hse-quality`, `clients` render through `[slug].astro`. `strengths` and `locations` entries are deleted, so their URLs 404 naturally. Menus (`primary`, `footer_company`, `footer_services`) are updated in `build-seed.py` and re-applied so no link points at a removed page.

**4. Home keeps the scroll film and the workforce globe.**
The deck's section list is copy, not full IA, and the film and the Three.js globe are the site's marquee features. Order: hero → film → About KAT Arabia → Our Services → Industries → Workforce + globe → Why Work with KAT Arabia → Our Projects → Our Presence → CTA. *Alternatives rejected:* dropping the film or the workforce section — both remove signature features for no copy gain; confirmed with the user during apply.

**4a. Service `scope` repeater cap rises from 12 to 14.**
The deck's Oil & Gas scope list has 14 items (MEP has 13), so the old `maxItems: 12` would truncate approved client copy. The content-model delta is amended accordingly; client copy wins over the launch-time limit.

**5. `projects` collection has no URL pattern; `kat_projects` lists published entries.**
Profiles render only through the block on the Projects page and the home "Our Projects" section. *Alternative rejected:* `/projects/[slug]` detail pages — the deck has no profile copy yet, and detail pages add routes we would immediately rework when real profiles arrive.

**6. Enquiry attachments: insert → upload → update, in R2 under an `enquiries/` prefix.**
`ensureTable()` gains `ALTER TABLE … ADD COLUMN` guards for country, project_type, location, attachment_key. The row is inserted first (it owns the key `enquiries/<rowid>/<sanitized-filename>`), the file is written to the `MEDIA` bucket, then the key is updated; if the upload fails the row is removed and the endpoint answers `500` so nothing is reported as received. Upload uses the raw `env.MEDIA` binding — *alternative rejected:* going through EmDash's media library, which would expose tender documents as public site media.
Validation: extension **and** sniffed content type in {pdf, doc, docx, xls, xlsx}, `file.size ≤ 10 MB`, checked before any write. Serving: a new authenticated route (e.g. `GET /enquiries/[id]/attachment`) streams from R2 only when `Astro.locals.user` is set, mirroring the `/enquiries` guard.

**7. Project type is a select of the deck's four service groups.**
Options: *Construction and Infrastructure · Industrial and Energy · Building Systems and Facilities · Engineering, Equipment and Workforce* — grounded in the deck rather than invented. Country stays free text (80 chars), matching the form's international audience. *Note:* the deck's "project type" is treated as new form data; the existing category select (Project / Prequalification / Manpower / Careers) stays, since it drives the inbox grouping.

**8. Deck copy lands as seed content; placeholders stay visible.**
Where the deck says "add when available" (leadership, project profiles, client logos with permission), the section renders its heading and note rather than being hidden — matching the deck's intent.

## Risks / Trade-offs

- [Seed re-apply overwrites manual admin edits on the target deployment] → Make all content edits in `build-seed.py` in this change, then re-apply once; announce to the client that post-seed edits happen in the admin, not the script.
- [`/strengths` and `/locations` are live URLs today] → They 404 after the change (**BREAKING**, called out in proposal); check inbound links, and if analytics show traffic add redirects via EmDash's slug-redirect feature or a route rewrite.
- [R2 upload from the request path hits Workers subrequest/body limits] → 10 MB cap with explicit size check before buffering; reject early with a clear message.
- [Attachment rows without files or files without rows on partial failure] → Insert-then-update ordering with row cleanup on upload failure; an orphan file under `enquiries/` is harmless and can be swept later.
- [Two-phase form change breaks a currently-open form tab] → Old HTML posts old fields; server treats new fields as required only from the new page, and both phases answer the same redirect contract, so failures degrade to `sent=0`, not an error page.
- [Deck conflicts with seeded copy (services renamed, industries wording)] → The deck wins; diff both against the seed before applying and keep `pnpm seed:validate` green.

## Migration Plan

1. Update `scripts/build-seed.py` (schema: projects collection, `kat_projects`, new fields; content: 11 services, 8 pages, menus) → `pnpm seed:build` → `pnpm seed:validate`.
2. Deploy code (endpoint, Contact/Projects components, enquiries inbox) and re-apply the seed together, since old content + new schema (or vice versa) is the failure window; D1 `ensureTable`/`ALTER` guards make the endpoint safe against the old table either way.
3. Verify: services at `/services/*`, the four new pages, removed pages 404, menu links, form submit with and without attachment, admin-only attachment fetch.
4. Rollback: revert the commit and re-apply the previous seed; the D1 columns are additive and can stay in place.

## Open Questions

- Exact slugs/labels for the HSE and Industries nav links (footer vs primary) — settled while authoring menus in tasks, without changing specs or approach.
- Whether `detail` (the existing free-text qualifier) survives alongside the new fields — kept for now; removing it later is a content-only edit.
