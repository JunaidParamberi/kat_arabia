# Design

## Context

- Home is composed in `scripts/build-seed.py` (`HOME` list) and rendered through `KatBlocks.astro` → `src/components/blocks/*.astro`. Styles live in `src/styles/global.css` plus scoped `<style>` in each block.
- Every section header is the same `.sec-label.mono` row: an ordinal label, a counter on the right, and a top border. Removing it in one place de-templates every page.
- Built-in images are 8 stills in `public/images/`. `IND_IMG` maps only 6 of 14 industries; the rest fall back to repeats. Services fall back to `[ Image: … ]`.
- The live DB holds 21 industries: the 14 seeded entries plus 7 stale entries from an earlier seed with short titles and shared numbers. The seed itself is correct.
- `Kat_Arabia_saudi_HQ.pdf` (16 pp, CMYK, Illustrator export) is the asset source. Service panoramas ≈2060×763 (pp. 6–13). Industry squares 1254×1254 (p. 14). HSE photos (p. 13). The client logo page is p. 15: a mix of raster logos and vector artwork.
- Font is Montserrat for display and body (a deliberate earlier switch, commit `f493832`). The brochure uses the same geometric family at heavy weights for headlines, which is the look to match.

## Goals / Non-Goals

**Goals:**
- A home page that reads as a real contractor's site: proof first, one image per use, short copy.
- Shared header anatomy and type scale fixed once, so inner pages improve without restructuring.
- Everything stays editor-driven through blocks and collections; no hard-coded home page.

**Non-Goals:**
- No new block types; we extend existing ones (`kat_capabilities` gets a `cards` layout).
- No change to the film's motion or video pipeline.
- No re-photography. Brochure stills are a stopgap until KAT supplies real site photos.

## Decisions

1. **Extract assets from the PDF with poppler and convert to sRGB WebP.**
   - `pdfimages -png` gets the full-resolution rasters. ImageMagick or Pillow converts CMYK to sRGB, then encodes WebP at q≈80: about 1600w for panoramas and 900w for squares.
   - Logos: crop each cell from a 300 dpi `pdftoppm` render of p. 15, trim whitespace, export transparent PNG at 2× display height. Rasterising handles the mixed vector/raster logos uniformly.
   - *Alternative:* ask the client for source logo files. That's better quality but blocks the work, so it stays as a follow-up request.

2. **Image naming and mapping in the seed.**
   - Files are `svc-<slug>.webp`, `ind-<slug>.webp`, `hse-<n>.webp` and `clients/<slug>.png`.
   - `build-seed.py` gains `SVC_IMG` and a complete `IND_IMG` covering all 14, and the `default_image` option lists are extended.
   - Seed validation asserts that the mapping values are unique.

3. **Hide-empty and no-placeholder behaviour lives in the components, not the seed.**
   - `Projects.astro`, `Clients.astro`, `Hse.astro` (certs) and `Industries.astro` return nothing for empty lists.
   - Placeholder spans are deleted.
   - A seed validation rule rejects `[…]` tokens so placeholders can't be reintroduced from content.

4. **Section header: one shared partial behaviour.**
   - Drop `.sec-label` borders and the right-hand counters. Render the label as a plain eyebrow, stripped of a leading `^\d+\s*[—–-]\s*` at render time, so old content still renders correctly.
   - Raise `h2.disp` to `font-weight: 800`, `clamp(40px, 4.6vw, 72px)`, tight leading. Body stays at 400.

5. **Home composition (seed `HOME`).**
   - **Hero:** keep it. Shorter subheadline, two CTAs (Services / Contact). The eyebrow becomes "Saudi Arabia · UAE".
   - **Clients** (`kat_clients`): 29 logos, headline "Trusted by the region's leading operators".
   - **Services** (`kat_capabilities`, `layout="cards"`): absorbs the About copy into its 2-line intro.
   - **Film:** unchanged. Chapter service tags are removed from the captions.
   - **Why KAT** (`kat_steps`, 7 brochure points, icon variant), followed by **Workforce** in the same night tone. One night band, not two.
   - **Industries:** a photo-tile grid with unique images.
   - **Offices** (`kat_footprint`) + **CTA** (`kat_cta` with a background photo).
   - The rejected alternative was merging Why and Workforce into one block. It would need a new block type, which is a non-goal.

6. **Tone rhythm.** Paper → (clients paper) → services sand → film image → why/workforce night → industries paper → offices night → CTA maroon photo band. Adjacent paper and sand sections merge.

7. **Industries clean-up.** A one-off script, `scripts/dedupe-industries.mjs`, uses the EmDash CLI/API to delete the 7 stale entries by title. It runs against local D1 first, then production. Its output is logged.

8. **Globe legibility.** Raise land-dot and arc colours to `--gold`/`--paper` at higher opacity and add an atmosphere rim. Render a flag strip of the 12 countries (flags taken from brochure p. 5) as the always-visible list. If WebGL fails, the canvas is removed.

9. **Map framing.** Crop the footprint SVG viewBox to the Gulf (KSA east and the UAE). Use leader-line labels for the UAE cluster.

## Risks / Trade-offs

- **The brochure photos are themselves stylised AI renders, so the "AI look" is reduced, not eliminated.** → Mitigation: unique use per page, a consistent grade, and fewer sunset frames on home (prefer daylight HSE and site shots). File a photo shot list for the client.
- **Logo trademark use.** → Mitigation: approved by the client on 2026-10-29; the logos already appear in KAT's own published brochure.
- **Raster logos cropped from the PDF may be soft.** → Mitigation: render at 300 dpi and cap display height at 40px. Request vector originals.
- **Re-applying the seed overwrites editor changes to home.** → Mitigation: export the current home blocks before applying. Apply only the home page and the new media.
- **Heavier type at 800 can crowd narrow screens.** → Mitigation: the `clamp()` minimum is 30px on mobile; check at 360px.

## Migration Plan

1. Extract and convert assets, then commit them to `public/images/`.
2. Make the component and CSS changes. They are backward-compatible with existing content.
3. Update `build-seed.py`, then run `pnpm seed:build && pnpm seed:validate`.
4. Run the industries de-dupe locally, apply the home page seed locally, verify, then repeat in production.
5. Rollback: revert the commit and re-apply the previous seed's home blocks from the export taken in step 4.

## Resolved

- Logos: approved for use (2026-10-29).
- Abu Dhabi HQ: keep "Foodco Building, Salam Street"; ignore the brochure's Mussaffa address.
- Photos: brochure stills are the image source for now; real site photos may replace them later through the media library.
