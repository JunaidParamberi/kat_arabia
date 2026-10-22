import { env } from "cloudflare:workers";

export interface Enquiry {
	id: number;
	created_at: string;
	type: string;
	name: string;
	company: string | null;
	email: string;
	phone: string | null;
	detail: string | null;
	message: string;
	page: string | null;
}

const db = () => (env as unknown as { DB: D1Database }).DB;

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
}

export async function saveEnquiry(e: Omit<Enquiry, "id" | "created_at"> & { ip: string | null }) {
	await ensureTable();
	await db()
		.prepare(
			"INSERT INTO kat_enquiries (type, name, company, email, phone, detail, message, page, ip) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
		)
		.bind(e.type, e.name, e.company, e.email, e.phone, e.detail, e.message, e.page, e.ip)
		.run();
}

export async function listEnquiries(limit = 200): Promise<Enquiry[]> {
	await ensureTable();
	const { results } = await db()
		.prepare(
			"SELECT id, created_at, type, name, company, email, phone, detail, message, page FROM kat_enquiries ORDER BY id DESC LIMIT ?",
		)
		.bind(limit)
		.all<Enquiry>();
	return results ?? [];
}
