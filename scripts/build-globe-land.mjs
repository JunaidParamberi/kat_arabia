// Samples a lat/lon grid against Natural Earth land (world-atlas 110m) and writes the
// land points the workforce globe draws as its dotted map.
// Run: node scripts/build-globe-land.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { geoContains } from "d3-geo";
import { feature } from "topojson-client";

const require = createRequire(import.meta.url);
const topo = JSON.parse(readFileSync(require.resolve("world-atlas/land-110m.json"), "utf8"));
const land = feature(topo, topo.objects.land);

const STEP = 1.25; // degrees between rows
const points = [];
for (let lat = -58; lat <= 78; lat += STEP) {
	// Keep dot spacing roughly even on the sphere by widening the longitude step toward the poles.
	const lonStep = STEP / Math.max(0.2, Math.cos((lat * Math.PI) / 180));
	for (let lon = -180; lon < 180; lon += lonStep) {
		if (geoContains(land, [lon, lat])) points.push(+lat.toFixed(2), +lon.toFixed(2));
	}
}

const out = new URL("../public/globe-land.json", import.meta.url);
writeFileSync(out, JSON.stringify(points));
console.log(`wrote ${points.length / 2} land points to public/globe-land.json`);
