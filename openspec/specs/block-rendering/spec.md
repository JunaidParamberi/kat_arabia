# Block rendering

## Purpose

Define how KAT blocks render their content: image fallbacks, prose handling, collection-fed sections, and the interactive blocks, so pages stay presentable whatever the editor supplies.

## Requirements

### Requirement: Every image falls back to a built-in default

Every image field SHALL be optional: when an editor picks no image, blocks that offer a `default_image` select SHALL render one of the shipped stills in `public/images/`, and blocks without one SHALL render no image rather than a broken frame.

#### Scenario: Hero with no chosen image

- **WHEN** a `kat_hero` block has no `image` and its `default_image` is set
- **THEN** the matching built-in still renders as the hero background

#### Scenario: Split block with no image at all

- **WHEN** a `kat_split` block has neither `image` nor a default chosen
- **THEN** the text column renders on its own with no empty frame

### Requirement: Image fields render as image objects

Image fields SHALL be stored as `{ src, alt }` objects and rendered through EmDash's `<Image>` component or the block's image helper, never as raw URL strings.

#### Scenario: Editor uploads a new photo

- **WHEN** an editor replaces an image through the media library
- **THEN** the block renders the new asset with its stored alt text

### Requirement: Multiline text renders as paragraphs and lists

Prose text fields SHALL split into paragraphs on blank lines, and single-item repeaters (scope, industries, steps) SHALL render as their list semantics, dropping empty lines.

#### Scenario: Two paragraphs in a description

- **WHEN** a service description contains a blank line between two blocks of text
- **THEN** they render as two paragraphs

### Requirement: Capabilities block is collection-driven

`kat_capabilities` SHALL render service tabs or a grid — both fed by the `services` collection in sort order — and SHALL NOT duplicate service copy inside block fields.

#### Scenario: New service added

- **WHEN** an editor creates a ninth service with sort order above the others
- **THEN** the tabs or grid include it without editing the block

### Requirement: Film block degrades gracefully

`kat_film` SHALL render the scrubbed video when one is uploaded or the built-in `/film/film-scrub.mp4` exists, over a poster image, and with no usable video SHALL fall back to the poster with chapter captions only.

#### Scenario: Video missing

- **WHEN** no film video is uploaded and the built-in file is unavailable
- **THEN** the poster and the chapter rail render a readable static section

### Requirement: Workforce block can show the 3D globe

`kat_workforce` SHALL mount the Three.js globe when `show_globe` is on, SHALL load it lazily, and SHALL render no canvas and load no Three.js code when the toggle is off.

#### Scenario: Globe disabled

- **WHEN** `show_globe` is unchecked
- **THEN** no canvas is rendered and no Three.js code loads for that section

### Requirement: Contact block renders the enquiry form

`kat_contact` SHALL render the enquiry form (Project / Prequalification / Manpower / Careers), contact details, addresses, hours, and reply note, posting to `/api/enquiry`, with `dark` switching the section to the night background.

#### Scenario: Form submission

- **WHEN** a visitor submits the form with valid fields
- **THEN** it posts to `/api/enquiry` and lands back on the contact section with a sent status
