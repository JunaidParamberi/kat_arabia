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
	// From the KSA brochure (Kat_Arabia_saudi_HQ.pdf), extracted by scripts/extract-brochure.py.
	"ksa-vision": { src: "/images/ksa-vision.webp", alt: "Riyadh skyline rising beyond a large construction site" },
	"engineers-site": { src: "/images/engineers-site.webp", alt: "Two engineers in hard hats reviewing a pipeline and plant site" },
	"hse-site": { src: "/images/hse-site.webp", alt: "Site supervisor with a safety checklist beside HSE signage as crews work behind" },
	"svc-building": { src: "/images/svc-building.webp", alt: "Hard hat and drawings in front of towers under construction" },
	"svc-civil": { src: "/images/svc-civil.webp", alt: "Bridge deck under construction with a crane and excavator" },
	"svc-industrial": { src: "/images/svc-industrial.webp", alt: "Tower cranes over an industrial plant on the waterfront" },
	"svc-oil-gas": { src: "/images/svc-oil-gas.webp", alt: "Refinery and pipe racks under construction at sunset" },
	"svc-mep": { src: "/images/svc-mep.webp", alt: "Technician servicing pipework and switchgear in a plant room" },
	"svc-energy": { src: "/images/svc-energy.webp", alt: "High-voltage transmission towers and a substation at sunset" },
	"svc-plant": { src: "/images/svc-plant.webp", alt: "Cranes, excavators and plant equipment across a large site" },
	"svc-facility": { src: "/images/svc-facility.webp", alt: "Facility management team inspecting systems and controls" },
	"ind-infrastructure": { src: "/images/ind-infrastructure.webp", alt: "Cable-stayed bridge and rail line" },
	"ind-oil-gas": { src: "/images/ind-oil-gas.webp", alt: "Oil and gas facility with a flare stack" },
	"ind-petrochemicals": { src: "/images/ind-petrochemicals.webp", alt: "Petrochemical plant with spherical storage tanks" },
	"ind-manufacturing": { src: "/images/ind-manufacturing.webp", alt: "Automated manufacturing line with robotic arms" },
	"ind-mining": { src: "/images/ind-mining.webp", alt: "Haul trucks working in an open-pit mine" },
	"ind-commercial": { src: "/images/ind-commercial.webp", alt: "Commercial building frame under construction with tower cranes" },
	"ind-government": { src: "/images/ind-government.webp", alt: "Government building project nearing completion" },
	"ind-healthcare": { src: "/images/ind-healthcare.webp", alt: "Hospital reception and corridor with clinical staff" },
	"ind-hospitality": { src: "/images/ind-hospitality.webp", alt: "Hotel ballroom reception with guests and service staff" },
	"ind-logistics": { src: "/images/ind-logistics.webp", alt: "Container port with cranes, trucks and a cargo plane overhead" },
	"ind-marine": { src: "/images/ind-marine.webp", alt: "Marine crew on deck beside an offshore support vessel" },
	"ind-renewables": { src: "/images/ind-renewables.webp", alt: "Engineers at a solar and wind farm" },
	"ind-smart-cities": { src: "/images/ind-smart-cities.webp", alt: "Metro line running through a green, modern city district" },
};

/** Client logos from the KSA brochure, in brochure order. Files live in /public/images/clients. */
export const CLIENT_LOGOS: { slug: string; name: string }[] = [
	{ slug: "aramco", name: "Saudi Aramco" },
	{ slug: "sabic", name: "SABIC" },
	{ slug: "eagle-marine", name: "Eagle Marine" },
	{ slug: "zamil", name: "Zamil Group" },
	{ slug: "concord-stars", name: "Concord Stars Contracting" },
	{ slug: "gazmin", name: "GazMin Motors" },
	{ slug: "apcc", name: "APCC" },
	{ slug: "sobha", name: "Sobha Constructions" },
	{ slug: "azizi", name: "Azizi" },
	{ slug: "torri", name: "Torri Contracting" },
	{ slug: "aroma", name: "Aroma International Building Contracting" },
	{ slug: "cylingas", name: "Cylingas Engineering & Construction" },
	{ slug: "general-construction", name: "General Construction Co." },
	{ slug: "shapoorji-pallonji", name: "Shapoorji Pallonji" },
	{ slug: "bahri-mazroei", name: "Bahri & Mazroei" },
	{ slug: "ace-contracting", name: "ACE Contracting" },
	{ slug: "larsen-toubro", name: "Larsen & Toubro" },
	{ slug: "maaden", name: "Ma'aden" },
	{ slug: "deep-seafood", name: "The Deep Seafood Company" },
	{ slug: "noon", name: "noon" },
	{ slug: "khansaheb", name: "Khansaheb Group" },
	{ slug: "oasis-hills", name: "Oasis Hills Landscape Services" },
	{ slug: "pacific-marine", name: "Pacific Marine Engineering" },
	{ slug: "sierra", name: "Sierra Contracting" },
	{ slug: "plante", name: "Plante" },
	{ slug: "gptc", name: "GPTC" },
	{ slug: "sinopec", name: "Sinopec" },
	{ slug: "petroserve", name: "Petroserve International" },
	{ slug: "ssangyong", name: "SsangYong" },
];

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
