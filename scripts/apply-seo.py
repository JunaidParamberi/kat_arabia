#!/usr/bin/env python3
"""Applies seed/seo.json to the local database after `emdash seed`.

The EmDash seed engine cannot write SEO records — they live in _emdash_seo,
which applySeed never touches — so deck page titles and meta descriptions are
applied here instead. Run after `pnpm seed:apply` (or `emdash seed ...`):

    python3 scripts/apply-seo.py [path/to/data.db]

Upserts (collection, content_id) rows; safe to re-run.
"""
import json
import sqlite3
import sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
db_path = Path(sys.argv[1]) if len(sys.argv) > 1 else root / "data.db"
rows = json.loads((root / "seed" / "seo.json").read_text())

con = sqlite3.connect(db_path)
applied = skipped = 0
for r in rows:
    if not r.get("title") and not r.get("description"):
        continue  # no deck meta for this entry; runtime fallbacks apply
    table = f"ec_{r['collection']}"
    row = con.execute(f"SELECT id FROM {table} WHERE slug = ?", (r["slug"],)).fetchone()
    if not row:
        print(f"  ! {r['collection']}/{r['slug']}: no such entry (seed applied?)")
        skipped += 1
        continue
    con.execute(
        f"""INSERT INTO _emdash_seo (collection, content_id, seo_title, seo_description)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(collection, content_id) DO UPDATE SET
                seo_title = excluded.seo_title,
                seo_description = excluded.seo_description,
                seo_no_index = 0,
                updated_at = datetime('now')""",
        (r["collection"], row[0], r["title"], r["description"]),
    )
    applied += 1
con.commit()
con.close()
print(f"seo: {applied} applied, {skipped} skipped -> {db_path}")
