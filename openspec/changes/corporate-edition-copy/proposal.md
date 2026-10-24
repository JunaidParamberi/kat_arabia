# Proposal

## Why

The site currently carries the original launch copy: 8 service lines, the demo-era `strengths` and `locations` pages, and a minimal enquiry form. An approved copy deck — "KAT Arabia – Website Copy (Corporate Edition)" (Word doc, 24 Oct 2026) — now defines the authoritative wording, page set, service coverage, and contact requirements for launch, including three services missing from the site, four new pages, and a richer enquiry form the client's process needs.

## What Changes

- **Services expand from 8 to 11 entries**, matching the deck: add *Energy, Electrical & Solar Solutions*, *Camp Construction & Maintenance*, and *Engineering, Contracting & Project Management*; rename/reword existing entries to the deck's titles, overviews, scope lists, and meta descriptions.
- **New pages** authored as `pages` entries: **Industries We Serve**, **Projects**, **HSE & Quality**, and **Clients**, each using the deck's copy and page titles.
- **Strengths and Locations pages are removed (BREAKING)** — their content folds into Home ("Why Work with KAT Arabia"), About ("Our Approach", "Our Presence"), and Contact (office addresses); the `primary` and footer menus drop the dead links.
- **Home page restructured** to the deck's section order and copy: hero, About KAT Arabia, Our Services, Industries, Why Work with KAT Arabia, Our Projects, Our Presence, contact banner.
- **New `projects` collection + `kat_projects` block**: project profiles the client can add as projects are cleared for publication, listed on the Projects page and the home page section.
- **Enquiry form gains fields**: country, project type (select), location, **and a tender-document attachment** uploaded to R2, with type/size validation and admin-only download alongside the existing inbox.
- **Page titles and meta descriptions** from the deck applied through each entry's SEO panel.
- **All service, industry, HSE, clients, and About copy replaced** with the deck's wording; no figures, certificates, or client logos beyond what the deck clears.

Out of scope for this change: the "To Confirm Before Launch" items in the deck's Review Notes (office phone numbers, leadership biographies, offshore approvals, named project profiles) — these stay as placeholders until the client supplies them; email notification of enquiries.

## Capabilities

### New Capabilities

- `projects`: publishing project profiles — a `projects` collection the client edits, its visibility rules, and how profiles render on the Projects page and the home "Our Projects" section.

### Modified Capabilities

- `content-model`: the seeded `services` collection grows from 8 to 11 entries with the deck's titles and scope lists; the block registry gains `kat_projects` (fourteen block types, not thirteen); the home/about/contact page content follows the deck's section set; `strengths` and `locations` entries are removed.
- `enquiry`: submissions gain required `country`, `project type`, and `location` fields with a new validation rule and D1 columns, plus a tender-document attachment (accepted types, size limit, R2 storage, admin-only retrieval).
- `block-rendering`: the `kat_contact` requirement expands to the deck's form (new fields, project-type select, attachment control) while keeping honeypot, redirect contract, and dark toggle.

## Impact

- `scripts/build-seed.py` → regenerate `seed/seed.json` (`pnpm seed:build`, `pnpm seed:validate`); content edits for pages, services, industries.
- `src/pages/api/enquiry.ts`, `src/lib/enquiries.ts` — new fields, validation, `kat_enquiries` columns; new attachment handling (R2 binding in `wrangler.jsonc`).
- `src/components/blocks/Contact.astro` — new form controls including file input; `src/pages/enquiries.astro` — show new fields + attachment download.
- New `src/components/blocks/Projects.astro` registered in `KatBlocks.astro`.
- `src/layouts/Base.astro` menus (via admin/menu seed): `primary`, `footer_company`, `footer_services` link updates.
- SEO: page titles/meta from the deck stored in each entry's SEO panel.
- No route or layout changes: new pages render through the existing `[slug]` route; all content stays server-rendered.
