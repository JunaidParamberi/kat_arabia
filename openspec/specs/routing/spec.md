# Site routing

## Purpose

Define how URLs map to server-rendered pages: the home page, CMS pages, service detail pages, static utility routes, and the 404 fallback.

## Requirements

### Requirement: All content pages are server-rendered

Every page that reads from the CMS SHALL render on the server (`output: "server"` in `astro.config.mjs`) so admin edits appear without a rebuild, and content routes SHALL NOT use `getStaticPaths()`.

#### Scenario: Editor publishes a change

- **WHEN** an editor changes a page or service in the admin and saves it
- **THEN** the next request for that URL renders the updated content with no rebuild or redeploy

### Requirement: Home page renders at `/`

The `home` page SHALL render at `/` from its authored block order, and `/home` SHALL permanently redirect to `/` while preserving the query string so signed preview links keep working.

#### Scenario: Visitor opens the site root

- **WHEN** a visitor requests `/`
- **THEN** the `home` page's blocks render at that URL

#### Scenario: Legacy or preview link to /home

- **WHEN** a request arrives at `/home?preview=…`
- **THEN** it responds `301` to `/?preview=…`

### Requirement: Any CMS page renders at `/{slug}`

The `[slug]` route SHALL look up the `pages` collection by slug and render the entry's blocks, and a slug that matches no page SHALL rewrite to the 404 page rather than returning a framework error.

#### Scenario: Page exists

- **WHEN** a visitor requests `/strengths` and a `pages` entry with slug `strengths` exists
- **THEN** that page renders with its own title, SEO metadata, and blocks

#### Scenario: Unknown slug

- **WHEN** a visitor requests `/no-such-page` and no page has that slug
- **THEN** the request rewrites to `/404`, which responds with the branded not-found page

### Requirement: Services have an index and detail routes

`/services` SHALL render the services index page alongside the ordered `services` collection listing, `/services/{slug}` SHALL render an individual service with a next-service link that cycles through the list, and unknown service slugs SHALL rewrite to 404.

#### Scenario: Service detail

- **WHEN** a visitor requests `/services/mep`
- **THEN** the MEP service renders with its summary, description, scope, industries, and a link to the next service

#### Scenario: Unknown service slug

- **WHEN** `/services/unknown` is requested
- **THEN** the request rewrites to `/404`

### Requirement: Static utility routes exist

The site SHALL serve `/404` (branded not-found page), `/enquiries` (admin-only enquiry inbox), `/_emdash/admin` (EmDash admin), and `POST /api/enquiry` (the enquiry endpoint).

#### Scenario: Unauthenticated visitor opens the inbox

- **WHEN** a visitor without an EmDash session requests `/enquiries`
- **THEN** they are redirected to the admin login with a redirect back to `/enquiries`

### Requirement: New admin pages appear without route files

Because `pages` uses the `/{slug}` URL pattern, creating or renaming a page in the admin SHALL change its public URL with no new route file.

#### Scenario: Editor renames a page slug

- **WHEN** an editor changes a page's slug in the admin
- **THEN** the page renders at the new slug through the existing `[slug]` route
