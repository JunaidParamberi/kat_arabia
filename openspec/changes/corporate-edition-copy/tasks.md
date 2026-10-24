# Tasks

## 1. Seed schema

- [x] 1.1 Add the `projects` collection (title, summary, image, description, order; drafts + revisions; no URL pattern) to `scripts/build-seed.py` and verify `pnpm seed:build` succeeds and `pnpm seed:validate` passes with the new collection present
- [x] 1.2 Add the `kat_projects` block type (headline, intro, anchor_id) to `scripts/build-seed.py` so it joins `ALL_BLOCKS`, and verify `seed/seed.json` lists fourteen `blockTypes` and `pages.content.validation.allowedTypes` includes `kat_projects` (regenerate with `pnpm seed:build`, validate with `pnpm seed:validate`)

## 2. Seed content from the copy deck

- [x] 2.0 Export "KAT Arabia – Website Copy (Corporate Edition).docx" from `~/Downloads` into the repo as `docs/copy/corporate-edition.md` (plain markdown, headings preserved) and verify every section from Home through Contact Us is present so content work never depends on the Downloads folder
- [x] 2.1 Expand `SERVICES` to the deck's 11 entries — add energy-electrical-solar, camp-construction-maintenance, engineering-contracting-project-management; update titles, numbers 01–11, summaries, descriptions, scope/industries lists, `default_image`, and deck meta — and verify `pnpm seed:build` + `pnpm seed:validate` pass and all 11 slugs appear in the seed's services content
- [x] 2.2 Rewrite the `pages` content to the deck: home sections in the decided order (hero, film, about, capabilities, industries, workforce, why-work-with steps, projects block, footprint, CTA), about, services, contact addresses + form copy, and add `industries`, `projects`, `hse-quality`, `clients`; remove the `strengths` and `locations` entries and verify the seed's pages content lists exactly the eight deck pages
- [x] 2.3 Add the deck's page titles and meta descriptions to each page's and service's SEO fields and verify a sample (e.g. oil-gas-engineering) carries its deck meta description. NOTE: the EmDash seed engine cannot write SEO (it lives in `_emdash_seo`, which `applySeed` never touches), so deck meta is emitted to `seed/seo.json` by `build-seed.py` and applied post-seed by `scripts/apply-seo.py` against the same database
- [x] 2.4 Update the `primary`, `footer_company`, and `footer_services` menus — drop strengths/locations links, keep all button classes, list all 11 services in the footer — and verify no seeded menu item points at a removed slug; add a `footer_contact` menu and render it from `Base.astro` in place of the hardcoded contact column (removes the unconfirmed phone number; covered by the site-shell delta)
- [x] 2.5 Run `pnpm seed:build && pnpm seed:validate` and verify both exit clean with no hand edits made to `seed/seed.json`

## 3. Projects block

- [x] 3.1 Create `src/components/blocks/Projects.astro` (headline, intro, card per published project: image, title, summary; no cards when empty) and register it in `KatBlocks.astro`, and verify the block renders on a page through the dev server with a test entry
- [x] 3.2 Confirm draft project entries never render publicly (create one draft via the admin or seed and verify it is absent from the listing) and verify the empty state renders headline + intro with no placeholder frame
- [x] 3.3 Place the block on the Projects page and the home "Our Projects" section in the seed and verify both render published profiles in sort order after re-applying the seed

## 4. Enquiry endpoint

- [x] 4.1 Extend `src/pages/api/enquiry.ts` validation with country (required, 80), project_type (select of the four deck groups, 80), location (required, 120) and verify a curl POST missing country returns 422 JSON / `sent=0` redirect while a complete POST returns success
- [x] 4.2 Add `ALTER TABLE` column guards (country, project_type, location, attachment_key) in `src/lib/enquiries.ts` `ensureTable()` and verify against a `kat_enquiries` table created before the change that the columns are added and a new-fields submission inserts successfully
- [x] 4.3 Implement tender attachment handling: extension + content-type check (pdf/doc/docx/xls/xlsx), 10 MB cap, insert row → upload to `MEDIA` at `enquiries/<rowid>/<name>` → update key, row removed on upload failure — and verify an oversized or wrong-type file returns 422 with neither row nor object stored, and a valid PDF produces a row plus an R2 object
- [x] 4.4 Add an authenticated attachment route (e.g. `GET /enquiries/[id]/attachment`) guarded by `Astro.locals.user` that streams from R2, and verify a logged-in admin receives the file while a logged-out request gets not-found
- [x] 4.5 Verify `ALL` still answers 405 with `Allow: POST` and the honeypot still short-circuits to success without writing a row or file

## 5. Form UI and inbox

- [x] 5.1 Add country, project type select, location, and file input (accept PDF/Office) to `src/components/blocks/Contact.astro` while keeping honeypot, `page` field, and category select, and verify the rendered form posts to `/api/enquiry` and lands with `sent=1`
- [x] 5.2 Update `src/pages/enquiries.astro` to show country, project type, location, and an attachment download link, and verify an enquiry saved with a file appears with a working admin-only download

## 6. Verification

- [x] 6.1 Run `pnpm typecheck` and `pnpm build` and verify both complete without errors (typecheck: the only errors are 24 pre-existing DOM-type ones in `src/scripts/motion.ts`, unchanged from before this work; build completes clean)
- [x] 6.2 With the seed applied locally, sweep the site in the dev server — `/`, the eight pages, all 11 `/services/*` URLs — and verify each renders deck copy with its deck `<title>`/meta description, and that `/strengths` and `/locations` render 404
- [x] 6.3 Submit the live form end-to-end (with and without an attachment, plus an oversized/wrong-type file) and verify the redirect contract, `kat_enquiries` rows, R2 object, and rejection cases all behave per the enquiry spec
- [x] 6.4 Verify header, mobile menu, and all footer columns (Company, Services, Contact) contain no dead links and every service link resolves

## Workflow follow-up

- Archive the change with `openspec archive corporate-edition-copy` after review, which syncs the four deltas into the main specs.
- Verify the archived result with `openspec validate --specs --strict`.
