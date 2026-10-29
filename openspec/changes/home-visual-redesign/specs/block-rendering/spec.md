# Spec Delta

## MODIFIED Requirements

### Requirement: Every image falls back to a built-in default

Every image field SHALL be optional: when an editor picks no image, blocks that offer a `default_image` select SHALL render one of the shipped stills in `public/images/`, and blocks without one SHALL render no image rather than a broken frame. A missing image SHALL never render placeholder text or an empty media box.

#### Scenario: Hero with no chosen image

- **WHEN** a `kat_hero` block has no `image` and its `default_image` is set
- **THEN** the matching built-in still renders as the hero background

#### Scenario: Split block with no image at all

- **WHEN** a `kat_split` block has neither `image` nor a default chosen
- **THEN** the text column renders on its own with no empty frame

#### Scenario: Service card with no image

- **WHEN** a service in the capabilities block has no image and no built-in default resolves
- **THEN** the card renders title and summary only, with no `[ Image: … ]` text and no grey frame

### Requirement: Capabilities block is collection-driven

`kat_capabilities` SHALL render service tabs, a grid, or photo cards, all fed by the `services` collection in sort order. It SHALL NOT duplicate service copy inside block fields. The cards layout SHALL show each service's image, title, and summary, link to `/services/{slug}`, and omit scope lists.

#### Scenario: New service added

- **WHEN** an editor creates a ninth service with sort order above the others
- **THEN** the tabs or grid include it without editing the block

#### Scenario: Cards layout on home

- **WHEN** the home capabilities block uses the cards layout
- **THEN** each service renders as one card with photo, title, and one-line summary linking to its detail page, and no scope bullets appear

## ADDED Requirements

### Requirement: Workforce globe is legible on the night background

When `kat_workforce` shows the globe, the landmasses and route arcs SHALL contrast clearly with the night background, and the twelve source countries SHALL also render as a visible list or flag strip. When WebGL is unavailable, the list alone SHALL convey the content.

#### Scenario: Globe contrast

- **WHEN** the workforce section renders with the globe on
- **THEN** land, arcs, and the Al Jubail destination are clearly distinguishable from the background at a glance

#### Scenario: No WebGL

- **WHEN** the browser cannot create a WebGL context
- **THEN** no blank canvas area remains and the twelve countries still render

### Requirement: Offices map keeps city labels readable

The footprint map SHALL frame the region so that every office marker and its label are fully visible and do not overlap at desktop and mobile widths.

#### Scenario: UAE cluster

- **WHEN** the footprint block renders Abu Dhabi, Dubai, Sharjah, and Al Jubail
- **THEN** all four labels are fully inside the map and none overlap another
