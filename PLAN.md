# KAT Arabia website — implementation plan

Source of truth for design: the "KAT Arabia — Homepage" Design canvas (Direction D + subpages).
CMS: [EmDash](https://emdashcms.com) — Astro 7 + Cloudflare (D1 database, R2 media, Workers).

## 1. Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Astro 7, `output: "server"` | Required by EmDash; server-rendered so CMS edits are live |
| CMS | EmDash 1.3 (`emdash/astro`) | Admin at `/_emdash/admin`, passkey login, blocks editor, media library |
| Hosting | Cloudflare Workers + D1 + R2 | EmDash's first-class target, free tier is enough, fits existing Cloudflare usage |
| Motion | GSAP + ScrollTrigger, Lenis | Scroll-scrubbed film, pinned sections, reveal animations |
| 3D | Three.js | Workforce globe (arcs from 12 countries into Al Jubail) |
| Type | Funnel Display (display), Geist (body), Geist Mono (labels) | Matches the design |
| Colour | Paper `#ECE6DB`, ink `#141010`, maroon `#7A1418`, sand-gold `#E3B877` | Matches the design |

## 2. Routes (mirrors katarabia.com's main sections, as pages)

| Route | Built from |
|---|---|
| `/` | `pages/home` — hero, scroll film, about, capabilities, workforce, industries, footprint, HSE, clients, contact |
| `/about` | `pages/about` |
| `/services` | `pages/services` + `services` collection index |
| `/services/[slug]` | `services` collection detail page |
| `/strengths` | `pages/strengths` |
| `/locations` | `pages/locations` |
| `/contact` | `pages/contact` with enquiry form |
| `/404` | static |
| `/_emdash/admin` | EmDash admin |

Any new page created in the admin renders at `/{slug}` automatically (`[slug].astro`).

## 3. Content model (defined in `seed/seed.json`)

**Collections**
- `pages` — `title`, `content` (blocks field). Every page is composed of KAT blocks, so the client edits copy, images and order without code.
- `services` — `title`, `number`, `summary`, `description`, `image`, `scope` (repeater), `industries` (repeater), `order`. 8 entries.
- `industries` — `title`, `number`, `image`. 14 entries.

**Blocks (`kat_*`)** — each maps to one Astro component in `src/components/blocks/`:

| Block | Purpose |
|---|---|
| `kat_hero` | Full-bleed image hero (home and inner variants), eyebrow, headline + highlight, CTAs, breadcrumb |
| `kat_film` | Pinned scroll-scrubbed film: video file, poster, 5 chapters (title, text, services) |
| `kat_intro` | Section label, headline, body paragraphs, optional facts row (value + label) |
| `kat_capabilities` | Interactive service tabs fed by the `services` collection (home) or a grid (`/services`) |
| `kat_workforce` | Wide photo, headline, text, 12 countries, CTAs, Three.js globe |
| `kat_industries` | Industries index fed by the `industries` collection with hover image swap |
| `kat_footprint` | Map + office list (repeater: city, country, role, address, phone) |
| `kat_steps` | Numbered steps (delivery process, strengths, "what happens next") |
| `kat_split` | Image + text with optional facts |
| `kat_hse` | Headline, text, certification placeholders |
| `kat_clients` | Logo wall (repeater of images, placeholders until supplied) |
| `kat_cta` | Maroon call-to-action band |
| `kat_contact` | Enquiry form (Project / Prequalification / Manpower / Careers) + contact details |

**Menus**: `primary` (About, Services, Strengths, Locations, Contact + "Get in touch" button), `footer_company`, `footer_services`.
**Site settings**: title, tagline, logo, social.

Images ship as defaults in `public/images/` (the 8 supplied stills). Blocks fall back to them when no image is chosen, so the seed has no remote downloads; editors replace them from the Media Library.

## 4. Motion map

| Where | Behaviour | Implementation |
|---|---|---|
| Whole site | Smooth scroll | Lenis, synced to GSAP ticker |
| Hero | Image 1.06→1.0 on load, headline lines rise | GSAP timeline |
| Scroll film | Section pins for ~5 screens; scroll scrubs `video.currentTime`; chapter rail + caption update | ScrollTrigger `scrub`. Falls back to the poster + chapter captions without a video, and to static on `prefers-reduced-motion` |
| Facts | Numbers count up on enter | GSAP + ScrollTrigger |
| Capabilities | Tab switch cross-fades image, scope rows stagger | vanilla JS + GSAP |
| Workforce | Three.js globe, slow auto-rotate, arcs draw into Al Jubail | Three.js, lazy-loaded on view |
| Industries | Hover swaps image | CSS + JS |
| Sections | Fade/rise reveals | ScrollTrigger batch |

Video note: for smooth scrubbing, encode the film with a keyframe on every frame:
`ffmpeg -i film.mp4 -c:v libx264 -g 1 -crf 22 -pix_fmt yuv420p -movflags +faststart -an film-scrub.mp4`

## 5. Contact form

`POST /api/enquiry` (Astro endpoint) validates the fields and stores each submission as an `enquiries` collection entry (draft, admin-only), visible in the admin. Email notification is phase 2 (needs an email provider such as Resend or Cloudflare Email Routing).

## 6. Phases

1. **Scaffold** — EmDash Cloudflare marketing template, strip demo blocks, set fonts/tokens, layout (header, mobile menu, footer).
2. **Schema + seed** — collections, 13 block types, menus, all page content from the design.
3. **Blocks** — build every block component, responsive at 390 / 768 / 1440.
4. **Motion** — Lenis, GSAP reveals, scroll film, capabilities tabs, globe.
5. **Contact** — form endpoint + enquiries collection.
6. **QA** — `astro build`, seed validation, run locally, check pages at desktop and mobile.
7. **Deploy (needs your Cloudflare account)** — `wrangler d1 create`, `wrangler r2 bucket create`, set IDs in `wrangler.jsonc`, `pnpm deploy`, open `/_emdash/admin` to create the first admin with a passkey.

## 7. Open items for Junaid

- The 10-second film (MP4) and the finished-project end frame.
- Images for Facility Management, the remaining 13 industries and HSE.
- Office addresses, working hours, reply time, ISO certificates, client logos.
- Confirm the 8 service lines vs the 7 listed on the current katarabia.com.
- Cloudflare account access for D1/R2 + deploy, and the domain.
