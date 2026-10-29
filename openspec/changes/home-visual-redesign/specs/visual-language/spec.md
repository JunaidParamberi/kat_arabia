# Spec Delta

## Purpose

Sets the site-wide presentation rules that make KAT Arabia read as a credible regional contractor rather than a generated template: section header anatomy, type hierarchy, tone rhythm, and how imagery is assigned.

## ADDED Requirements

### Requirement: Section headers carry no numbering or rules

Section headers SHALL consist of an optional short eyebrow word, a headline, and optional intro text. They SHALL NOT render ordinal prefixes ("03 —"), counter chips ("11 SERVICE LINES · 1 QHSE SYSTEM"), or a hairline rule above the section.

#### Scenario: Services section header

- **WHEN** the services section renders on `/`
- **THEN** its header shows at most an eyebrow such as "Services" and the headline, with no leading number, counter, or top rule

#### Scenario: Editor enters a numbered label

- **WHEN** an editor stores "03 — Our Services" in a block label field
- **THEN** the rendered eyebrow drops the leading ordinal and dash and shows "Our Services"

### Requirement: Headlines contrast strongly with body text

Section headlines SHALL use a display weight of 700 or heavier at a size of at least 2.5× the body size on desktop. Body text SHALL use weight 400. The maroon highlight SHALL apply to at most one phrase per headline.

#### Scenario: Desktop headline weight

- **WHEN** a section headline is inspected at a 1440px viewport
- **THEN** its computed font-weight is 700 or more and its font-size is at least 40px

### Requirement: Tone changes are limited

A page SHALL NOT alternate background tone (paper, sand, night, maroon) on more than every other section. Adjacent paper/sand sections SHALL merge into one tone.

#### Scenario: Home tone rhythm

- **WHEN** the background tones of consecutive sections on `/` are listed
- **THEN** no two adjacent sections are paper and sand respectively, and no more than three night/maroon bands appear

### Requirement: Every service and industry has its own image

Each of the 11 services and each of the 14 industries SHALL resolve to a distinct built-in image when the editor has not chosen one. The built-in set SHALL include the brochure's service, industry, and HSE photographs.

#### Scenario: Service defaults are unique

- **WHEN** no service has an editor-chosen image
- **THEN** the 11 service cards on `/` show 11 different photographs

#### Scenario: Industry defaults are unique

- **WHEN** no industry has an editor-chosen image
- **THEN** the 14 industries resolve to 14 different photographs

### Requirement: Client logos render as a calm, uniform wall

Client logos SHALL render at a uniform optical height inside equal cells, in greyscale at rest, with full colour on hover or focus. They SHALL have no dashed or bordered cell outlines.

#### Scenario: Logo hover

- **WHEN** a visitor hovers or focuses a client logo
- **THEN** that logo transitions from greyscale to full colour, and under `prefers-reduced-motion` the change is instant
