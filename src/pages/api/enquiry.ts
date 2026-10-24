import type { APIRoute } from "astro";
import { deleteEnquiry, saveEnquiry, setEnquiryAttachment, media } from "../../lib/enquiries";

const TYPES = new Set(["project", "prequalification", "manpower", "careers"]);
// The deck's four service groups.
const PROJECT_TYPES = new Set([
	"Construction and infrastructure",
	"Industrial and energy",
	"Building systems and facilities",
	"Engineering, equipment and workforce",
]);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ATTACHMENT_TYPES: Record<string, string> = {
	pdf: "application/pdf",
	doc: "application/msword",
	docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	xls: "application/vnd.ms-excel",
	xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};
const MAX_ATTACHMENT = 10 * 1024 * 1024; // 10 MB

const clip = (v: FormDataEntryValue | null, max: number) =>
	typeof v === "string" ? v.trim().slice(0, max) : "";

export const POST: APIRoute = async ({ request, redirect, url }) => {
	const wantsJson = (request.headers.get("accept") ?? "").includes("application/json");
	const form = await request.formData().catch(() => null);
	const back = (ok: boolean) => {
		const page = clip(form?.get("page") ?? null, 200) || "/contact";
		const safe = page.startsWith("/") && !page.startsWith("//") && !page.startsWith("/\\") ? page : "/contact";
		const target = new URL(safe, url.origin);
		if (target.origin !== url.origin) target.pathname = "/contact";
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
	const country = clip(form.get("country"), 80);
	const projectType = clip(form.get("project_type"), 80);
	const location = clip(form.get("location"), 120);
	if (
		!TYPES.has(type) || !name || !EMAIL.test(email) || !message ||
		!country || !location || (projectType && !PROJECT_TYPES.has(projectType))
	) {
		return reply(false, 422, "Please complete the required fields.");
	}

	const file = form.get("attachment");
	const upload = file instanceof File && file.size > 0 ? file : null;
	if (upload) {
		const ext = (upload.name.split(".").pop() ?? "").toLowerCase();
		const expected = ATTACHMENT_TYPES[ext];
		const ctOk = !expected || upload.type === "" || upload.type === expected;
		if (!expected || !ctOk || upload.size > MAX_ATTACHMENT) {
			return reply(false, 422, "Attachments must be PDF, Word or Excel files up to 10 MB.");
		}
	}

	let id: number;
	try {
		id = await saveEnquiry({
			type,
			name,
			email,
			message,
			company: clip(form.get("company"), 160) || null,
			phone: clip(form.get("phone"), 40) || null,
			country,
			project_type: projectType || null,
			location,
			detail: clip(form.get("detail"), 300) || null,
			page: clip(form.get("page"), 200) || null,
			ip: request.headers.get("cf-connecting-ip"),
		});
	} catch (err) {
		console.error("Failed to save enquiry", err);
		return reply(false, 500, "Could not save your enquiry.");
	}

	if (upload) {
		// Row first (for its id), then the object, then the key back on the row.
		// A failed upload removes the row so no enquiry is saved without its file.
		const ext = (upload.name.split(".").pop() ?? "").toLowerCase();
		const safeName = upload.name.replace(/[^\w.\- ]+/g, "_").slice(0, 120) || `attachment.${ext}`;
		const key = `enquiries/${id}/${safeName}`;
		try {
			await media().put(key, await upload.arrayBuffer(), {
				httpMetadata: { contentType: upload.type || ATTACHMENT_TYPES[ext] },
			});
			await setEnquiryAttachment(id, key, safeName);
		} catch (err) {
			console.error("Failed to store enquiry attachment", err);
			await deleteEnquiry(id).catch(() => {});
			return reply(false, 500, "Could not store your attachment. Please try again.");
		}
	}
	return reply(true, 200);
};

export const ALL: APIRoute = () => new Response("Method not allowed", { status: 405, headers: { Allow: "POST" } });
