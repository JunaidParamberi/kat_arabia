# Tasks

## 1. Extract brochure assets

- [x] 1.1 Write `scripts/extract-brochure.py` (poppler + Pillow): pull full-res rasters from `Kat_Arabia_saudi_HQ.pdf`, convert CMYK→sRGB, encode WebP (panoramas ~1600w q80, squares ~900w q80)
- [x] 1.2 Export 8 service panoramas (pp. 6–13) as `public/images/svc-<slug>.webp`; source the 3 services without a brochure page (energy/solar, engineering & PM, camp) from the closest unused brochure image and note them
- [x] 1.3 Export the 14 industry squares (p. 14) as `public/images/ind-<slug>.webp`, plus the HSE photos (p. 13) as `hse-<n>.webp`
- [x] 1.4 Render p. 15 at 300 dpi, crop and trim the 29 client logos to transparent PNG in `public/images/clients/<slug>.png`, keep a name list for alt text
- [ ] 1.5 Export the 12 country flags (p. 5) for the workforce strip — deferred: countries render as chips instead
- [x] 1.6 Review every exported image at 100%, re-crop soft or clipped ones, and confirm the total added weight stays under ~6 MB

## 2. Seed and data

- [x] 2.1 In `scripts/build-seed.py`: add `SVC_IMG`, complete `IND_IMG` for all 14 industries with unique files, extend every `default_image` option list
- [x] 2.2 Raise the `kat_clients` logos `max_items` from 24 to 30 and seed the 29 logos with company names
- [x] 2.3 Add the KSA phone number +966 53 181 4451 to `OFFICES` (Al Jubail) and `CONTACT`
- [x] 2.4 Rewrite `HOME` to the 7-section order from design.md §5: hero, clients, services cards, film, why (7 brochure points) + workforce, industries, footprint + CTA; drop the about and projects blocks; strip ordinal labels
- [x] 2.5 Trim home copy to the 700-word budget (hero subheadline ≤ 30 words, section intros ≤ 2 lines, no film chapter service tags)
- [x] 2.6 Add seed validation rules: unique service/industry image mapping, no `[…]` placeholder tokens in any text field, no duplicate industry titles
- [x] 2.7 Run `pnpm seed:build && pnpm seed:validate` until both pass
- [x] 2.8 Write `scripts/dedupe-industries.sql` (soft delete) for the 7 stale industry entries; run it against local D1 and confirm 14 remain — production run still pending

## 3. Shared visual language

- [x] 3.1 In `global.css`: remove the `.sec-label` top border and right-hand counter, restyle the label as a plain eyebrow
- [x] 3.2 Strip leading `NN —` ordinals from labels at render time in every block that prints `v.label`
- [x] 3.3 Set the headline scale: `h2.disp` weight 800, `clamp(30px, 4.6vw, 72px)`; confirm the Montserrat 800 weight loads in `astro.config.mjs`
- [x] 3.4 Remove the counter chips ("11 service lines · 1 QHSE system", "21 sectors", "0 profiles", "12 source countries") from block markup

## 4. Block changes

- [x] 4.1 `Capabilities.astro`: delete the `[ Image: … ]` placeholders; add a `cards` layout (photo, title, summary, link) and register the option in the seed schema
- [x] 4.2 `Projects.astro`, `Clients.astro`, `Hse.astro`, `Industries.astro`, `Footprint.astro`: render nothing when the list is empty
- [x] 4.3 `Clients.astro`: equal cells with no borders, uniform optical height, greyscale→colour on hover/focus, instant under reduced motion
- [x] 4.4 `Industries.astro`: photo-tile grid using each industry's unique image; count derived from items
- [x] 4.5 `Steps.astro`: add an icon variant (icon + title + one line) and drop the giant numerals in that variant
- [x] 4.6 `Workforce.astro` + globe: brighter land/arcs/rim, flag strip for the 12 countries, remove the canvas when WebGL fails
- [x] 4.7 `Footprint.astro`: crop the map viewBox to the Gulf, leader-line labels for the UAE cluster, no overlap at 360px and 1440px
- [x] 4.8 `Cta.astro`: support a background photo with a scrim; seed home CTA with an unused HSE/site still
- [x] 4.9 Apply the tone rhythm from design.md §6; merge adjacent paper/sand sections

## 5. Verify

- [x] 5.1 Apply the seed locally (export current home blocks first) and load `/`
- [x] 5.2 Script check on `/`: section order matches the spec, visible body text ≤ 700 words, no image source repeats, no `[` placeholder text, no "0 profiles"
- [ ] 5.3 Visual review in the browser at 1440px and 390px: headers, logo wall, cards, globe, map labels, CTA
- [x] 5.4 Check `/services`, `/industries`, `/hse-quality`, `/about` still render correctly with the new header anatomy
- [ ] 5.5 Reduced-motion check: logo hover, film, reveals
- [x] 5.6 Run `npx emdash types` and the build (`pnpm build`) with no errors

## 6. Client hand-off

- [ ] 6.1 Send the client the finished home page for review, with an optional request for real site photos and vector logos to replace the brochure assets later
