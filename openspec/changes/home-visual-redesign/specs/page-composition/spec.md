# Spec Delta

## Purpose

Defines what a published page is allowed to show, so the site never presents empty, duplicated, placeholder, or miscounted content to visitors, and so the home page tells a short, proof-led story.

## ADDED Requirements

### Requirement: Home page follows a seven-section proof-led order

The seeded home page SHALL contain, in order: hero, client logo wall, services card grid, film, why-KAT + workforce, industries, and offices followed by the closing CTA. It SHALL NOT contain an about block, a projects block, or a second hero.

#### Scenario: Fresh seed applied

- **WHEN** the seed is applied to an empty database and `/` is requested
- **THEN** the sections render in the order hero, clients, services, film, why/workforce, industries, offices, CTA

#### Scenario: Client logos sit directly under the hero

- **WHEN** a visitor scrolls past the hero on `/`
- **THEN** the next section is the client logo wall

### Requirement: Home page copy stays short

The seeded home page SHALL render no more than 700 words of visible body text, excluding navigation, footer, and the film's chapter captions.

#### Scenario: Word budget

- **WHEN** the visible text of `/` is extracted, excluding header, footer, and film chapters
- **THEN** it contains 700 words or fewer

### Requirement: No image repeats within a page

A rendered page SHALL NOT display the same image file in more than one visible position, except the site logo.

#### Scenario: Home image audit

- **WHEN** every `<img>` source and CSS background image on `/` is collected, ignoring the logo
- **THEN** each source appears at most once

### Requirement: Empty sections do not render

A block whose content depends on a list (projects, clients, certifications, industries, offices) SHALL render nothing, including its heading, when that list is empty.

#### Scenario: No project profiles

- **WHEN** a page contains a projects block and the projects list is empty
- **THEN** no projects section, heading, or "0 profiles" label is rendered

#### Scenario: No certifications yet

- **WHEN** an HSE block has an empty certifications list
- **THEN** no certification row or placeholder badges render, while the rest of the block still shows

### Requirement: Placeholder text never reaches visitors

Published pages SHALL NOT render authoring placeholders such as `[ Image: … ]`, `[X]`, `[08:00 – 17:00]`, or "will be added here once confirmed".

#### Scenario: Missing service image

- **WHEN** a service has no image and no default image
- **THEN** its card renders without a media frame and without placeholder text

#### Scenario: Unfilled bracket token

- **WHEN** a seeded text field still contains a square-bracket placeholder token
- **THEN** `pnpm seed:validate` fails and names the field

### Requirement: Counts are derived from data

Any count shown beside a section (sectors, services, logos) SHALL be computed from the rendered items, and the items SHALL contain no duplicate titles.

#### Scenario: Industries count

- **WHEN** the industries block renders 14 unique sectors
- **THEN** any visible count reads 14, and no sector title appears twice
