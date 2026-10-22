import { getEmDashCollection } from "emdash";
import { pickImage } from "./media";

export interface ServiceItem {
	slug: string;
	number: string;
	title: string;
	summary: string;
	description: string;
	image: { src: string; alt: string } | null;
	scope: string[];
	industries: string[];
}

const fallbackOf = (v: unknown) => (typeof v === "string" && v !== "none" ? v : null);

export function toService(entry: { id: string; data: Record<string, any> }): ServiceItem {
	const d = entry.data;
	return {
		slug: entry.id,
		number: String(d.number ?? ""),
		title: String(d.title ?? ""),
		summary: String(d.summary ?? ""),
		description: String(d.description ?? d.summary ?? ""),
		image: pickImage(d.image, fallbackOf(d.default_image)),
		scope: (d.scope ?? []).map((s: { item: string }) => s.item).filter(Boolean),
		industries: (d.industries ?? []).map((s: { item: string }) => s.item).filter(Boolean),
	};
}

export async function getServices(): Promise<ServiceItem[]> {
	const { entries } = await getEmDashCollection("services", { orderBy: { order: "asc" }, limit: 50 });
	return (entries ?? []).map((e: any) => toService(e));
}

export interface IndustryItem {
	slug: string;
	number: string;
	title: string;
	image: { src: string; alt: string } | null;
}

export async function getIndustries(): Promise<IndustryItem[]> {
	const { entries } = await getEmDashCollection("industries", { orderBy: { order: "asc" }, limit: 50 });
	return (entries ?? []).map((e: any) => ({
		slug: e.id,
		number: String(e.data.number ?? ""),
		title: String(e.data.title ?? ""),
		image: pickImage(e.data.image, fallbackOf(e.data.default_image)),
	}));
}
