# Proposal

## Why

The site reads as AI-generated. The home page has about 1,630 words across 10 sections. Eight stills are reused 24 times. A `[ Image: … ]` placeholder shows in production. The Projects section is empty ("0 profiles"). Industries shows seven pairs of duplicates under a "21 sectors" label. Mono "0X — LABEL" headers and hairline rules sit on every section. None of this says "credible Saudi/UAE contractor".

The KSA brochure (`Kat_Arabia_saudi_HQ.pdf`, Oct 2026) holds what the site is missing: 29 real client logos, a unique photo for each service and each industry, HSE site photography, the seven "Why KAT" points, workforce disciplines, and the KSA phone number. It also confirms that KSA operations only began in 2026, which is why there are no project profiles to show yet.

## What Changes

- **Home page restructure.** Cut from 10 sections to 7, in this order: Hero → Clients strip → Services grid → Film → Why KAT + Workforce → Industries → Offices + CTA. About copy folds into the hero/services intro. Projects is removed from home until profiles exist.
- **Proof from the brochure.** Add the 29 client logos as a `kat_clients` logo wall on home, directly under the hero. Add the KSA phone number to the contact details.
- **One image, one use.** Import the brochure's per-service panoramas (pp. 6–13), 14 industry photos (p. 14) and HSE photos (p. 13) as new built-in defaults. No image appears twice on one page.
- **No placeholders, no empty sections.** Blocks with no image render no media frame, and the `[ Image: … ]` text goes. A collection-driven block with zero items (projects) renders nothing, not a "0 profiles" header.
- **Industries de-duplicated.** Exactly the brochure's 14 sectors, one entry each. The count label is derived from the data, never hand-typed.
- **Services as a photo-card grid on home.** Each card shows an image, title and one-line summary. Scope bullet lists stay on `/services/[slug]` only. The tab layout remains available but home no longer uses it.
- **Visual de-templating (site-wide).** Remove the numbered mono section labels ("03 — OUR SERVICES") and counter chips ("11 SERVICE LINES · 1 QHSE SYSTEM"). Remove hairline rules above sections. Use a stronger heading weight and scale (brochure-style heavy display weight), fewer tone switches, and more whitespace.
- **"Why KAT" redesign.** The brochure's 7 points become icon + title + one line. The giant "01–06" numerals go.
- **Fixes:** a legible Workforce globe (or a flag strip fallback). The offices map is cropped to the Gulf so the four city labels don't collide. The CTA becomes a full-width photo band.
- **BREAKING (content):** the home page's seeded block list changes. Re-applying the seed replaces the editor's current home layout.

## Capabilities

### New Capabilities

- `page-composition`: rules for what a published page may show: section order on home, no duplicate images per page, no empty or placeholder sections, derived (not typed) counts.
- `visual-language`: site-wide presentation rules: section header anatomy (no numbered labels or rules), type scale and weight, tone rhythm, and the per-section imagery the brochure supplies.

### Modified Capabilities

- `block-rendering`: image fallback no longer shows placeholder text; collection blocks with zero entries render nothing; capabilities gains a home "cards" layout; clients wall renders monochrome-to-colour logos.
- `content-model`: block registry corrected to include `kat_projects` (14 types); `default_image` options extended with the brochure stills; industries collection cleaned to the brochure's 14 de-duplicated sectors; services count corrected to 11; client logo limit raised from 24 to 30 to fit all 29 brochure clients; contact details gain the KSA phone number.

## Impact

- **Code:** `src/components/blocks/{Hero,Capabilities,Industries,Clients,Steps,Workforce,Footprint,Cta,Intro,Projects}.astro`, `src/styles/global.css`, `astro.config.mjs` (font weights).
- **Seed:** `scripts/build-seed.py` (HOME block list, industries, default image options, contact). Regenerate with `pnpm seed:build` and pass `pnpm seed:validate`.
- **Assets:** about 30 new `.webp` files in `public/images/` (services, industries, HSE) plus about 29 logos in `public/images/clients/`, all extracted from the brochure PDF.
- **Out of scope:** inner-page restructures beyond the shared visual changes, new photography shoots, project case studies, Arabic content.
- **Decided (2026-10-29):** client logos are approved for use. The Abu Dhabi HQ stays "Foodco Building, Salam Street" (the brochure's Mussaffa address is not used). Brochure photos are approved as the image source for now.
- **Later:** real site photos and vector logos can replace the brochure assets through the media library.
