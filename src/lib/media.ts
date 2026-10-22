/** Built-in images shipped in /public/images, used until an editor picks one. */
export const DEFAULT_IMAGES: Record<string, { src: string; alt: string }> = {
	"hero-dusk": {
		src: "/images/hero-dusk.webp",
		alt: "Industrial complex under construction at sunset on the Saudi Gulf coast, with tower cranes and steel structures",
	},
	"gc-facade": {
		src: "/images/gc-facade.webp",
		alt: "Glass curtain wall being installed on a building under construction at sunset",
	},
	"civil-interchange": {
		src: "/images/civil-interchange.webp",
		alt: "Aerial view of a highway interchange being built across the desert",
	},
	"steel-erection": {
		src: "/images/steel-erection.webp",
		alt: "Crawler crane lifting a steel beam onto a process plant structure at sunset",
	},
	"plant-night": {
		src: "/images/plant-night.webp",
		alt: "Engineer walking through a lit process plant at night",
	},
	mep: {
		src: "/images/mep.webp",
		alt: "Plant room with chillers, insulated pipework and cable trays",
	},
	equipment: {
		src: "/images/equipment.webp",
		alt: "Excavators, a mobile crane and dump trucks lined up on site at sunset",
	},
	workforce: {
		src: "/images/workforce.webp",
		alt: "A crew in hi-vis vests and white hard hats walking towards a process plant at sunset",
	},
};

type MediaValue =
	| {
			id?: string;
			src?: string;
			alt?: string;
			provider?: string;
			previewUrl?: string;
			meta?: Record<string, unknown>;
	  }
	| null
	| undefined;

/** Resolves an EmDash image or file field to a URL. */
export function mediaUrl(value: MediaValue): string | undefined {
	if (!value) return undefined;
	if (value.src) return value.src;
	if ((value.provider ?? "local") !== "local") return value.previewUrl;
	const key = typeof value.meta?.storageKey === "string" ? value.meta.storageKey : value.id;
	return key ? `/_emdash/api/media/file/${key}` : undefined;
}

/** An image field with a built-in fallback. */
export function pickImage(value: MediaValue, fallback?: string | null) {
	const src = mediaUrl(value);
	if (src) return { src, alt: value?.alt ?? "" };
	if (fallback && DEFAULT_IMAGES[fallback]) return DEFAULT_IMAGES[fallback];
	return null;
}

/** Splits plain text into paragraphs at blank lines. */
export function paragraphs(text: string | null | undefined): string[] {
	return (text ?? "")
		.split(/\n\s*\n/)
		.map((p) => p.trim())
		.filter(Boolean);
}

/** Two-digit chapter / item number. */
export const pad = (n: number) => String(n).padStart(2, "0");
