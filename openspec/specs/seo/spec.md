# SEO and sharing

## Purpose

Define how page metadata is derived: browser titles, meta descriptions, canonical URLs, and social share images, including the fallback chain when a page's SEO panel is empty.

## Requirements

### Requirement: Every page emits title, description, canonical, and robots

The base layout SHALL render a document title, meta description, canonical URL, Open Graph share image, and robots directives for every page, falling back to site settings when the page sets none.

#### Scenario: Page with a full SEO panel

- **WHEN** an editor sets a title, description, and image in a page's SEO panel
- **THEN** those values render as the browser title, meta description, and share image

### Requirement: Descriptions fall back to hero copy, then the tagline

A page's meta description SHALL be its SEO panel description, else the subheadline of its first `kat_hero` block, else the site tagline.

#### Scenario: New page with no SEO description

- **WHEN** a page has no SEO description but opens with a hero whose subheadline is filled in
- **THEN** the hero subheadline becomes the meta description

### Requirement: Share images fall back to the hero photo

A page's share image SHALL be the SEO panel image, else the first hero's image (chosen or built-in default), else the default social image from site settings.

#### Scenario: Hero-provided share image

- **WHEN** a page has no SEO image and a hero with a photo
- **THEN** the hero photo is used as the Open Graph image

### Requirement: Service pages describe themselves from their summary

A service detail page SHALL default its description to the service's one-sentence summary and its share image to the service image when the SEO panel sets neither.

#### Scenario: Service without SEO overrides

- **WHEN** a service has a summary and image but no SEO panel edits
- **THEN** the summary is the meta description and the service image is the share image

### Requirement: Titles join page and site with the configured separator

When a page title does not already include the site title, the browser title SHALL be `page title <separator> site title`, using the separator from Settings › SEO and defaulting to an em dash.

#### Scenario: Default separator

- **WHEN** no title separator is configured
- **THEN** titles join with an em dash
