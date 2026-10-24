# Site shell

## Purpose

Define the persistent chrome around page content: the header and its menus, the mobile menu, the footer columns, and how site identity (title, tagline, logo) resolves.

## Requirements

### Requirement: Header renders the primary menu

The header SHALL render `primary` menu items as navigation links — items with the `button` CSS class as the "Get in touch" CTA — and SHALL mark the current page's link with `aria-current="page"`.

#### Scenario: Editor edits menu items

- **WHEN** an editor renames or reorders an item in the `primary` menu
- **THEN** the header shows the updated labels and order

#### Scenario: Current page marking

- **WHEN** a visitor is on `/services`
- **THEN** the Services header link carries `aria-current="page"`

### Requirement: Header adapts to heroes and scroll position

Pages whose first block is a hero SHALL start with an overlay header that solidifies once the visitor scrolls, other pages SHALL start solid, and at narrow widths links SHALL move into a toggle-driven mobile menu with `aria-controls`/`aria-label` wiring.

#### Scenario: Overlay header over the hero

- **WHEN** a page opens with a `kat_hero` block
- **THEN** the header starts transparent over the hero and gains its scrolled styling after scrolling

#### Scenario: Mobile navigation

- **WHEN** a visitor taps the menu toggle at phone width
- **THEN** the mobile menu opens, the toggle animates to a close state, and background scroll stops

### Requirement: Footer renders its menu columns and identity

The footer SHALL render `footer_company` and `footer_services` as labelled navigation columns, the site tagline when set, and the site title or logo as the wordmark.

#### Scenario: Footer columns

- **WHEN** the `footer_services` menu has eight items
- **THEN** the footer's Services column lists all eight in order

### Requirement: Site identity resolves from settings

The document title SHALL join the page title and site title with the configured title separator, the header and footer wordmark SHALL use the site title unless a logo is set in site settings, and an empty title SHALL fall back to a default rather than render blank.

#### Scenario: Title separator

- **WHEN** Settings › SEO defines a separator and a page has its own title
- **THEN** the browser tab shows `page title <separator> site title`

#### Scenario: Logo set

- **WHEN** an editor uploads a logo in site settings
- **THEN** the header and footer wordmark positions render the logo instead of the title text
