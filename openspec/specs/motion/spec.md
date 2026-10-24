# Motion

## Purpose

Define the site's scroll and reveal behaviour: Lenis smooth scrolling, GSAP reveals, the scroll-scrubbed film, counters, parallax, and the accessibility fallbacks that keep them harmless.

## Requirements

### Requirement: Smooth scrolling is synced to GSAP

Lenis SHALL drive smooth wheel scrolling with `ScrollTrigger.update` running on the GSAP ticker, and SHALL stop while the mobile menu is open and restart when it closes.

#### Scenario: Menu opens on mobile

- **WHEN** a visitor opens the mobile menu
- **THEN** background scrolling stops until the menu closes

### Requirement: Sections reveal on enter

Elements marked for reveal SHALL fade and rise once as they enter the viewport, batched through ScrollTrigger, and the hero SHALL play a staged entrance on load.

#### Scenario: Visitor scrolls into a section

- **WHEN** a section with a reveal marker comes into view
- **THEN** it animates in once and stays visible on later scrolls

### Requirement: The film scrubs with scroll

The film section SHALL pin for several screens of scroll while scroll position scrubs `video.currentTime`, with playback time eased toward the scroll target each frame, chapter rail and captions following, and the title card dissolving once scrubbing begins.

#### Scenario: Visitor scrolls through the film

- **WHEN** the visitor scrolls while the film section is pinned
- **THEN** the video scrubs forward and the active chapter follows the scroll position

#### Scenario: Scroll back up

- **WHEN** the visitor scrolls back through the pinned section
- **THEN** the video scrubs backward to the matching frame

### Requirement: Counters and parallax are scroll-linked

Fact numbers SHALL count up once when their section enters, hero and split images SHALL take a subtle scroll-linked zoom, and the film layer SHALL have a small pointer parallax on desktop.

#### Scenario: Facts section enters

- **WHEN** the facts row scrolls into view
- **THEN** each number animates from zero to its stated value once

### Requirement: Reduced motion disables all of it

Under `prefers-reduced-motion: reduce`, the site SHALL skip smooth scroll, reveals, counters, parallax, and film scrubbing, rendering content in its final state with the film as a static poster and its chapter captions.

#### Scenario: Visitor prefers reduced motion

- **WHEN** the operating system requests reduced motion
- **THEN** the page is fully readable with no scroll-linked animation running

### Requirement: Non-JS or failed-script state stays readable

Reveal elements SHALL be visible by default and hidden only once the motion script runs, so a failed or blocked script SHALL never leave sections invisible.

#### Scenario: Script fails to load

- **WHEN** the motion script does not execute
- **THEN** all sections render visible in their final layout
