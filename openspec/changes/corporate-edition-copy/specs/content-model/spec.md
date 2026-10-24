# Spec Delta

## ADDED Requirements

### Requirement: The seeded page set matches the copy deck

The `pages` collection SHALL seed the eight Corporate Edition pages — `home`, `about`, `services`, `industries`, `projects`, `hse-quality`, `clients`, and `contact` — and SHALL NOT seed `strengths` or `locations`; their copy lives inside the deck's Home, About, and Contact sections.

#### Scenario: Old strengths URL

- **WHEN** a visitor requests `/strengths` after the change
- **THEN** the slug route finds no page and renders the 404 page

#### Scenario: Deck pages exist

- **WHEN** the seed is applied
- **THEN** each of the eight pages renders at its slug with the deck's copy

### Requirement: Page SEO fields carry the deck's titles and descriptions

Every seeded page and service entry SHALL store the page title and meta description given in the copy deck in its SEO panel, and pages without deck metadata SHALL fall back to the existing hero/tagline chain.

#### Scenario: Deck meta description

- **WHEN** a visitor opens `/services/oil-gas-engineering`
- **THEN** the browser meta description is the deck's line for that service page

## MODIFIED Requirements

### Requirement: Pages are composed of KAT blocks

The `pages` collection SHALL hold `title` and a `content` blocks field whose allowed types are exactly the fourteen `kat_*` blocks, capped at 30 blocks per page, and editors SHALL be able to reorder, duplicate, and edit blocks without code changes.

#### Scenario: Editor reorders sections

- **WHEN** an editor moves the workforce block above the capabilities block on the home page
- **THEN** the published page renders the sections in the new order

#### Scenario: Block limit

- **WHEN** a page already contains 30 blocks
- **THEN** the editor cannot add a thirty-first

### Requirement: Services and Industries are separate collections

The `services` and `industries` collections SHALL exist as separate editor-managed collections with their own fields, sort order, and seeded entries (11 services, 14 industries); both SHALL support drafts and revisions, and services SHALL also support preview and SEO.

#### Scenario: Capability tabs read the collection

- **WHEN** the home page's `kat_capabilities` block is set to tab layout
- **THEN** the tabs are populated from the `services` collection in sort order, not from hand-authored block fields

#### Scenario: Industries index reads the collection

- **WHEN** a `kat_industries` block renders
- **THEN** it lists the `industries` collection in sort order with each entry's number and image

### Requirement: The KAT block types exist

The schema SHALL register `kat_hero`, `kat_film`, `kat_intro`, `kat_capabilities`, `kat_workforce`, `kat_industries`, `kat_footprint`, `kat_steps`, `kat_split`, `kat_hse`, `kat_clients`, `kat_cta`, `kat_contact`, and `kat_projects`, each mapping to one component in `src/components/blocks/` through `KatBlocks.astro`.

#### Scenario: Block renders through its component

- **WHEN** a page contains a `kat_film` block
- **THEN** `src/components/blocks/Film.astro` renders it with the block's stored fields

### Requirement: Repeaters have fixed item limits

Block repeaters SHALL enforce their seed limits: 1–8 film chapters, up to 6 intro facts, up to 4 split facts, 1–9 steps, up to 8 offices, up to 6 certifications, up to 24 client logos, up to 14 scope items, and up to 14 industries on services.

#### Scenario: Too many logos

- **WHEN** an editor tries to add a twenty-fifth client logo
- **THEN** the editor blocks the addition at 24

#### Scenario: Deck scope list fits

- **WHEN** an editor pastes the deck's 14-item Oil & Gas scope list into a service entry
- **THEN** all 14 items are accepted

## RENAMED Requirements

FROM: `### Requirement: Thirteen KAT block types exist`
TO: `### Requirement: The KAT block types exist`
