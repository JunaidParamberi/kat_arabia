import type { APIRoute } from "astro";
import { saveEnquiry } from "../../lib/enquiries";

const TYPES = new Set(["project", "prequalification", "manpower", "careers"]);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const clip = (v: FormDataEntryValue | null, max: number) =>
	typeof v === "string" ? v.trim().slice(0, max) : "";

export const POST: APIRoute = async ({ request, redirect, url }) => {
	const wantsJson = (request.headers.get("accept") ?? "").includes("application/json");
	const form = await request.formData().catch(() => null);
	const back = (ok: boolean) => {
		const page = clip(form?.get("page") ?? null, 200) || "/contact";
		const target = new URL(page.startsWith("/") ? page : "/contact", url.origin);
		target.searchParams.set("sent", ok ? "1" : "0");
		target.hash = "contact";
		return redirect(`${target.pathname}${target.search}${target.hash}`, 303);
	};
	const reply = (ok: boolean, status: number, error?: string) =>
		wantsJson ? Response.json({ ok, error }, { status }) : back(ok);

	if (!form) return reply(false, 400, "Invalid form");

	// Honeypot: bots fill hidden fields. Pretend success.
	if (clip(form.get("website"), 200)) return reply(true, 200);

	const type = clip(form.get("type"), 40);
	const name = clip(form.get("name"), 120);
	const email = clip(form.get("email"), 160);
	const message = clip(form.get("message"), 4000);
	if (!TYPES.has(type) || !name || !EMAIL.test(email) || !message) {
		return reply(false, 422, "Please complete the required fields.");
	}

	try {
		await saveEnquiry({
			type,
			name,
			email,
			message,
			company: clip(form.get("company"), 160) || null,
			phone: clip(form.get("phone"), 40) || null,
			detail: clip(form.get("detail"), 300) || null,
			page: clip(form.get("page"), 200) || null,
			ip: request.headers.get("cf-connecting-ip"),
		});
	} catch (err) {
		console.error("Failed to save enquiry", err);
		return reply(false, 500, "Could not save your enquiry.");
	}
	return reply(true, 200);
};

export const ALL: APIRoute = () => new Response("Method not allowed", { status: 405, headers: { Allow: "POST" } });
