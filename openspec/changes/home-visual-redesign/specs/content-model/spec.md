# Spec Delta

## MODIFIED Requirements

### Requirement: Thirteen KAT block types exist

The schema SHALL register `kat_hero`, `kat_film`, `kat_intro`, `kat_capabilities`, `kat_workforce`, `kat_industries`, `kat_footprint`, `kat_projects`, `kat_steps`, `kat_split`, `kat_hse`, `kat_clients`, `kat_cta`, and `kat_contact` (fourteen types), each mapping to one component in `src/components/blocks/` through `KatBlocks.astro`.

#### Scenario: Block renders through its component

- **WHEN** a page contains a `kat_film` block
- **THEN** `src/components/blocks/Film.astro` renders it with the block's stored fields

#### Scenario: Projects block registered

- **WHEN** a page contains a `kat_projects` block
- **THEN** `src/components/blocks/Projects.astro` renders it

### Requirement: Services and Industries are separate collections

The `services` and `industries` collections SHALL exist as separate editor-managed collections with their own fields, sort order, and seeded entries (11 services, 14 industries with unique titles). Both SHALL support drafts and revisions, and services SHALL also support preview and SEO.

#### Scenario: Capability tabs read the collection

- **WHEN** the home page's `kat_capabilities` block is set to tab layout
- **THEN** the tabs are populated from the `services` collection in sort order, not from hand-authored block fields

#### Scenario: Industries index reads the collection

- **WHEN** a `kat_industries` block renders
- **THEN** it lists the `industries` collection in sort order with each entry's number and image

#### Scenario: Stale industries removed

- **WHEN** the industries collection is audited after this change is applied
- **THEN** it holds exactly the 14 brochure sectors and no entry shares a number or a title with another

### Requirement: Repeaters have fixed item limits

Block repeaters SHALL enforce their seed limits: 1–8 film chapters, up to 6 intro facts, up to 4 split facts, 1–9 steps, up to 8 offices, up to 6 certifications, up to 30 client logos, up to 12 scope items, and up to 14 industries on services.

#### Scenario: Too many logos

- **WHEN** an editor tries to add a thirty-first client logo
- **THEN** the editor blocks the addition at 30

## ADDED Requirements

### Requirement: Built-in image set covers every service and industry

The `default_image` options and the service and industry image mapping SHALL include a distinct shipped still for each of the 11 services and each of the 14 industries, sourced from the KSA brochure, alongside the existing eight stills.

#### Scenario: Seed maps unique defaults

- **WHEN** `pnpm seed:build` runs
- **THEN** every service and every industry maps to a still that no other service or industry uses, and `pnpm seed:validate` passes

### Requirement: Client logos are seeded from the brochure

The home `kat_clients` block SHALL be seeded with all 29 client logos from the brochure as image entries, each with the company's name as alt text.

#### Scenario: Logo alt text

- **WHEN** the clients wall renders the Saudi Aramco logo
- **THEN** its alt text is the company name, not a file name

### Requirement: Contact details include the KSA phone number

Seeded contact details and the KSA office entry SHALL include the phone number +966 53 181 4451, rendered as a `tel:` link.

#### Scenario: Tap to call

- **WHEN** a visitor taps the KSA phone number on mobile
- **THEN** the device opens a call to +966531814451
