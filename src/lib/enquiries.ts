import { env } from "cloudflare:workers";

export interface Enquiry {
	id: number;
	created_at: string;
	type: string;
	name: string;
	company: string | null;
	email: string;
	phone: string | null;
	country: string | null;
	project_type: string | null;
	location: string | null;
	detail: string | null;
	message: string;
	page: string | null;
	attachment_key: string | null;
	attachment_name: string | null;
}

const db = () => (env as unknown as { DB: D1Database }).DB;
export const media = () => (env as unknown as { MEDIA: R2Bucket }).MEDIA;

const NEW_COLUMNS: Array<[string, string]> = [
	["country", "TEXT"],
	["project_type", "TEXT"],
	["location", "TEXT"],
	["attachment_key", "TEXT"],
	["attachment_name", "TEXT"],
];

async function ensureTable() {
	await db()
		.prepare(
			`CREATE TABLE IF NOT EXISTS kat_enquiries (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				created_at TEXT NOT NULL DEFAULT (datetime('now')),
				type TEXT NOT NULL,
				name TEXT NOT NULL,
				company TEXT,
				email TEXT NOT NULL,
				phone TEXT,
				detail TEXT,
				message TEXT NOT NULL,
				page TEXT,
				ip TEXT
			)`,
		)
		.run();
	// Guarded ALTERs: tables created before these columns existed keep working.
	const existing = await db()
		.prepare("PRAGMA table_info(kat_enquiries)")
		.all<{ name: string }>();
	const have = new Set((existing.results ?? []).map((c) => c.name));
	for (const [col, type] of NEW_COLUMNS) {
		if (!have.has(col)) {
			await db().prepare(`ALTER TABLE kat_enquiries ADD COLUMN ${col} ${type}`).run();
		}
	}
}

export interface EnquiryInput {
	type: string;
	name: string;
	email: string;
	message: string;
	company: string | null;
	phone: string | null;
	country: string | null;
	project_type: string | null;
	location: string | null;
	detail: string | null;
	page: string | null;
	ip: string | null;
}

/** Inserts the row and returns its id (used as the attachment's key prefix). */
export async function saveEnquiry(e: EnquiryInput): Promise<number> {
	await ensureTable();
	const res = await db()
		.prepare(
			`INSERT INTO kat_enquiries (type, name, company, email, phone, country, project_type, location, detail, message, page, ip)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		)
		.bind(
			e.type, e.name, e.company, e.email, e.phone, e.country, e.project_type,
			e.location, e.detail, e.message, e.page, e.ip,
		)
		.run();
	return Number(res.meta.last_row_id);
}

export async function setEnquiryAttachment(id: number, key: string, name: string) {
	await db()
		.prepare("UPDATE kat_enquiries SET attachment_key = ?, attachment_name = ? WHERE id = ?")
		.bind(key, name, id)
		.run();
}

/** Removes a row whose attachment upload failed, leaving no half-saved enquiry. */
export async function deleteEnquiry(id: number) {
	await db().prepare("DELETE FROM kat_enquiries WHERE id = ?").bind(id).run();
}

export async function getEnquiry(id: number): Promise<Enquiry | null> {
	await ensureTable();
	const row = await db()
		.prepare(
			"SELECT id, created_at, type, name, company, email, phone, country, project_type, location, detail, message, page, attachment_key, attachment_name FROM kat_enquiries WHERE id = ?",
		)
		.bind(id)
		.first<Enquiry>();
	return row ?? null;
}

export async function listEnquiries(limit = 200): Promise<Enquiry[]> {
	await ensureTable();
	const { results } = await db()
		.prepare(
			`SELECT id, created_at, type, name, company, email, phone, country, project_type, location, detail, message, page, attachment_key, attachment_name
			 FROM kat_enquiries ORDER BY id DESC LIMIT ?`,
		)
		.bind(limit)
		.all<Enquiry>();
	return results ?? [];
}
