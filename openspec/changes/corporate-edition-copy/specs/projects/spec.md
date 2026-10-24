# Spec Delta

## Purpose

Let the client publish project profiles as they are cleared for publication, and show them in a Projects listing on the Projects page and the home page's Our Projects section.

## ADDED Requirements

### Requirement: Projects are a first-class collection

A `projects` collection SHALL let editors create profiles with a title, summary, image, description, and sort order, SHALL support drafts and revisions, and SHALL NOT give entries their own public URLs — profiles appear only through the projects block.

#### Scenario: Editor drafts a profile

- **WHEN** an editor creates a project entry and leaves it in draft
- **THEN** it is editable in the admin but has no public URL

### Requirement: Only cleared projects appear on the site

The projects listing SHALL include published entries only, in sort order, and SHALL never render draft entries to visitors.

#### Scenario: Draft withheld

- **WHEN** one of six profiles is in draft
- **THEN** the public listing shows the five published profiles

### Requirement: The projects block renders the listing

The `kat_projects` block SHALL render its headline and intro with a card per published project — image, title, and summary — and with no published profiles SHALL render the section without cards rather than an empty frame.

#### Scenario: Profiles exist

- **WHEN** the Projects page contains the block and three profiles are published
- **THEN** three cards render in sort order

#### Scenario: No profiles yet

- **WHEN** the block renders and no profile is published
- **THEN** the headline and intro render with no card placeholders
