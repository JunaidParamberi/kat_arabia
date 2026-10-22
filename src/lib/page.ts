import { pickImage } from "./media";

/** Whether the page opens with a full-bleed hero (so the header overlays it). */
export function startsWithHero(blocks: any[] | undefined | null) {
	return blocks?.[0]?._type === "kat_hero";
}

/** SEO fallbacks from the first hero: its subheadline and image. */
export function heroSeoDefaults(blocks: any[] | undefined | null, origin: string) {
	const hero = blocks?.find((b) => b._type === "kat_hero");
	const img = hero ? pickImage(hero.image, hero.default_image || "hero-dusk") : null;
	return {
		defaultDescription: hero?.subheadline?.trim() || undefined,
		defaultOgImage: img ? new URL(img.src, origin).href : undefined,
	};
}
