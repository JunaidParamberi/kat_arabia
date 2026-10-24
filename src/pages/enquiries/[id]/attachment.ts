import type { APIRoute } from "astro";
import { getEnquiry, media } from "../../../lib/enquiries";

// Admin-only download of an enquiry's tender attachment, streamed from R2.
export const GET: APIRoute = async ({ params, locals }) => {
	if (!locals.user) return new Response("Not found", { status: 404 });
	const id = Number(params.id);
	if (!Number.isInteger(id) || id <= 0) return new Response("Not found", { status: 404 });

	const row = await getEnquiry(id).catch(() => null);
	if (!row?.attachment_key) return new Response("Not found", { status: 404 });

	const obj = await media().get(row.attachment_key).catch(() => null);
	if (!obj) return new Response("Not found", { status: 404 });

	const name = row.attachment_name ?? row.attachment_key.split("/").pop() ?? "attachment";
	return new Response(obj.body, {
		headers: {
			"Content-Type": obj.httpMetadata?.contentType ?? "application/octet-stream",
			"Content-Length": String(obj.size),
			"Content-Disposition": `attachment; filename="${name.replace(/"/g, "")}"`,
			"Cache-Control": "private, no-store",
		},
	});
};
