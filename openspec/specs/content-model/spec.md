# Content model

## Purpose

Define the CMS schema the client edits: the three collections, the thirteen `kat_*` block types, menus, site settings, and how the seed file is generated and validated.

## Requirements

### Requirement: Pages are composed of KAT blocks

The `pages` collection SHALL hold `title` and a `content` blocks field whose allowed types are exactly the thirteen `kat_*` blocks, capped at 30 blocks per page, and editors SHALL be able to reorder, duplicate, and edit blocks without code changes.

#### Scenario: Editor reorders sections

- **WHEN** an editor moves the workforce block above the capabilities block on the home page
- **THEN** the published page renders the sections in the new order

#### Scenario: Block limit

- **WHEN** a page already contains 30 blocks
- **THEN** the editor cannot add a thirty-first

### Requirement: Thirteen KAT block types exist

The schema SHALL register `kat_hero`, `kat_film`, `kat_intro`, `kat_capabilities`, `kat_workforce`, `kat_industries`, `kat_footprint`, `kat_steps`, `kat_split`, `kat_hse`, `kat_clients`, `kat_cta`, and `kat_contact`, each mapping to one component in `src/components/blocks/` through `KatBlocks.astro`.

#### Scenario: Block renders through its component

- **WHEN** a page contains a `kat_film` block
- **THEN** `src/components/blocks/Film.astro` renders it with the block's stored fields

### Requirement: Services and Industries are separate collections

The `services` and `industries` collections SHALL exist as separate editor-managed collections with their own fields, sort order, and seeded entries (8 services, 14 industries); both SHALL support drafts and revisions, and services SHALL also support preview and SEO.

#### Scenario: Capability tabs read the collection

- **WHEN** the home page's `kat_capabilities` block is set to tab layout
- **THEN** the tabs are populated from the `services` collection in sort order, not from hand-authored block fields

#### Scenario: Industries index reads the collection

- **WHEN** a `kat_industries` block renders
- **THEN** it lists the `industries` collection in sort order with each entry's number and image

### Requirement: Link fields accept only safe URL shapes

Every CTA and link field SHALL accept only absolute http(s), `mailto:`, `tel:`, a site-relative path, or a fragment, and `anchor_id` fields SHALL match `^(?:$|[a-z][a-z0-9_-]*)$` so menu links like `/#workforce` resolve to them.

#### Scenario: Editor enters a javascript: URL

- **WHEN** an editor saves `javascript:alert(1)` in a CTA URL field
- **THEN** validation rejects the value

#### Scenario: Menu links to a section

- **WHEN** a block's `anchor_id` is `workforce` and a primary menu item points at `/#workforce`
- **THEN** clicking the menu item scrolls to that section

### Requirement: Repeaters have fixed item limits

Block repeaters SHALL enforce their seed limits: 1–8 film chapters, up to 6 intro facts, up to 4 split facts, 1–9 steps, up to 8 offices, up to 6 certifications, up to 24 client logos, up to 12 scope items, and up to 14 industries on services.

#### Scenario: Too many logos

- **WHEN** an editor tries to add a twenty-fifth client logo
- **THEN** the editor blocks the addition at 24

### Requirement: Menus and site settings are editable content

The three menus — `primary`, `footer_company`, `footer_services` — and site settings (title, tagline, SEO) SHALL be managed in the admin and rendered from the database, not hard-coded.

#### Scenario: Editor reorders header links

- **WHEN** an editor reorders the `primary` menu
- **THEN** the header navigation reflects the new order on the next request

### Requirement: The seed is generated, not hand-edited

`seed/seed.json` SHALL be produced by `pnpm seed:build` (`scripts/build-seed.py`) rather than hand-edited, and `pnpm seed:validate` SHALL pass before the seed is applied.

#### Scenario: Block field added

- **WHEN** a developer adds a field to a block in `scripts/build-seed.py`
- **THEN** `pnpm seed:build` regenerates `seed/seed.json` with the field and `pnpm seed:validate` passes
