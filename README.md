# KAT Arabia — website

Marketing site for **KAT Arabia General Contracting**, built with [EmDash CMS](https://emdashcms.com) on Astro 7 and Cloudflare (Workers + D1 + R2).

- Design source: "KAT Arabia — Homepage" design canvas (Direction D + subpages)
- Plan: [`PLAN.md`](./PLAN.md)

## Pages

| Route | Content |
|---|---|
| `/` | Hero, scroll film, about, capabilities, workforce (3D globe), industries, footprint, HSE, clients, contact |
| `/about`, `/strengths`, `/locations` | Block-built pages |
| `/services` | All service lines; `/services/{slug}` for each one |
| `/contact` | Enquiry form (Project · Prequalification · Manpower · Careers) |
| `/enquiries` | Inbox of form submissions (signed-in admins only) |
| `/_emdash/admin` | CMS admin |

Every page is made of **KAT blocks** that editors add, reorder and edit in the admin (Content → Pages). Services and Industries are their own collections. Menus (header and footer) are edited under Menus.

## Local development

Requires Node 22.22+ and pnpm.

```bash
pnpm install
pnpm dev                 # http://localhost:4321
```

On first run open `http://localhost:4321/_emdash/admin`, go through the setup wizard and **tick "include sample content"** — that loads all the KAT Arabia pages, services and industries from `seed/seed.json`.

Shortcut in development only: `http://localhost:4321/_emdash/api/setup/dev-bypass?content=1` creates a dev admin and loads the content.

### Editing the seed

`seed/seed.json` is generated from `scripts/build-seed.py` (block types, collections, menus and all launch copy):

```bash
pnpm seed:build
pnpm seed:validate
```

The seed only applies to an empty database. After launch, edit content in the admin.

## Deploy to Cloudflare

```bash
pnpm wrangler login
pnpm wrangler d1 create kat-arabia            # copy the database_id into wrangler.jsonc
pnpm wrangler r2 bucket create kat-arabia-media
pnpm wrangler secret put EMDASH_ENCRYPTION_KEY # any long random string; back it up
pnpm run deploy
```

Then open `https://<your-worker>.workers.dev/_emdash/admin`, complete the setup wizard (tick sample content) and register your passkey. Add the custom domain in the Cloudflare dashboard (Workers → kat-arabia → Domains).

## The scroll film

The `Scroll film` block scrubs a video with scroll (GSAP ScrollTrigger + Lenis). Upload the MP4 in the block's **Film** field. For smooth scrubbing, encode it with a keyframe on every frame:

```bash
ffmpeg -i film.mp4 -c:v libx264 -g 1 -crf 22 -pix_fmt yuv420p -movflags +faststart -an film-scrub.mp4
```

Until a film is uploaded the block shows the poster image with the chapter captions.

## Images

The eight supplied stills live in `public/images/` and are used as built-in defaults (each block has a "Built-in image" option). Upload replacements through the Media Library and pick them in the block's image field.

## Structure

```
seed/seed.json              schema + launch content (generated)
scripts/build-seed.py       seed generator
src/components/blocks/      one Astro component per KAT block
src/components/KatBlocks.astro  block type → component map
src/layouts/Base.astro      header, mobile menu, footer, EmDash wiring
src/scripts/motion.ts       Lenis, GSAP reveals, film scrub, tabs, form
src/scripts/globe.ts        Three.js workforce globe (lazy-loaded)
src/pages/api/enquiry.ts    form endpoint (stores to D1)
```

## Still needed

Film MP4 and end frame · Facility Management, industries and HSE photos · office addresses, hours, reply time · ISO certificates · client logos · Cloudflare account + domain.
