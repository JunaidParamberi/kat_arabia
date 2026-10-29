// Builds the site's two maps from Natural Earth (world-atlas) so coastlines and borders are real:
//   public/globe-map.json   equirectangular SVG paths, drawn into the workforce globe's texture
//   src/data/gulf-map.json  projected SVG paths, graticule, ticks + city positions for the footprint survey plate
// Run: node scripts/build-maps.mjs
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { geoDistance, geoEquirectangular, geoMercator, geoPath } from "d3-geo";
import { feature, mesh } from "topojson-client";

const require = createRequire(import.meta.url);
const load = (f) => JSON.parse(readFileSync(require.resolve(`world-atlas/${f}`), "utf8"));
const round = (d) => d.replace(/(\d+\.\d{1})\d+/g, "$1");

// ISO 3166 numeric codes (world-atlas feature ids).
const HUB = ["682", "784"]; // Saudi Arabia, UAE
const SOURCES = ["356", "524", "586", "144", "050", "608", "288", "404", "800", "694", "120", "108"];

/* ---------- globe texture paths (2048 × 1024 equirectangular) ---------- */
{
	const topo = load("countries-110m.json");
	const countries = feature(topo, topo.objects.countries).features;
	const W = 2048;
	const path = geoPath(geoEquirectangular().scale(W / (2 * Math.PI)).translate([W / 2, W / 4]).precision(0.1));
	const pick = (ids) => round(countries.filter((c) => ids.includes(c.id)).map((c) => path(c)).join(""));
	const out = {
		width: W,
		height: W / 2,
		land: round(path(feature(topo, topo.objects.land))),
		borders: round(path(mesh(topo, topo.objects.countries, (a, b) => a !== b))),
		sources: pick(SOURCES),
		hub: pick(HUB),
	};
	writeFileSync(new URL("../public/globe-map.json", import.meta.url), JSON.stringify(out));
	console.log(`globe-map.json: ${(JSON.stringify(out).length / 1024).toFixed(0)} KB`);
}

/* ---------- Gulf footprint survey plate (980 × 700) ---------- */
{
	const topo = load("countries-10m.json");
	const countries = feature(topo, topo.objects.countries).features;
	const W = 980;
	const H = 700;
	// Frame the Gulf corridor from Al Jubail to Sharjah: the coast the offices sit on, not the empty interior.
	const frame = {
		type: "Feature",
		geometry: { type: "MultiPoint", coordinates: [[48.6, 23.4], [56.4, 28.0]] },
	};
	const projection = geoMercator().fitExtent([[0, 0], [W, H]], frame).clipExtent([[-20, -20], [W + 20, H + 20]]);
	const path = geoPath(projection);
	const byId = (id) => countries.find((c) => c.id === id);
	const NEIGHBOURS = ["414", "368", "364", "634", "048", "512", "887", "400"]; // KW IQ IR QA BH OM YE JO
	const REGION = new Set(["682", "784", ...NEIGHBOURS]);
	const pt = (lon, lat) => projection([lon, lat]).map((n) => +n.toFixed(1));
	const x = (lon) => +projection([lon, 25])[0].toFixed(1);
	const y = (lat) => +projection([52, lat])[1].toFixed(1);
	const lons = [49, 50, 51, 52, 53, 54, 55, 56];
	const lats = [24, 25, 26, 27, 28];
	const out = {
		width: W,
		height: H,
		neighbours: round(NEIGHBOURS.map((id) => byId(id)).filter(Boolean).map((c) => path(c)).join("")),
		saudi: round(path(byId("682"))),
		uae: round(path(byId("784"))),
		borders: round(path(mesh(topo, topo.objects.countries, (a, b) => a !== b && REGION.has(a.id) && REGION.has(b.id)))),
		graticule: lons.map((l) => `M${x(l)} 0V${H}`).join("") + lats.map((l) => `M0 ${y(l)}H${W}`).join(""),
		ticks: {
			lon: lons.map((l) => ({ deg: l, at: x(l) })),
			lat: lats.map((l) => ({ deg: l, at: y(l) })),
		},
		// Map pixels per 100 km along the 25th parallel, for the scale bar.
		per100km: +(((x(53) - x(52)) / (geoDistance([52, 25], [53, 25]) * 6371)) * 100).toFixed(1),
		cities: {
			"al jubail": pt(49.66, 27.01),
			jubail: pt(49.66, 27.01),
			dammam: pt(50.1, 26.43),
			riyadh: pt(46.72, 24.71),
			"abu dhabi": pt(54.37, 24.45),
			dubai: pt(55.27, 25.2),
			sharjah: pt(55.41, 25.35),
		},
		labels: [
			{ text: "Saudi Arabia", at: pt(49.4, 24.3), kind: "country" },
			{ text: "Qatar", at: pt(51.2, 25.2), kind: "minor" },
			{ text: "Iran", at: pt(54.2, 27.75), kind: "minor" },
			{ text: "Arabian Gulf", at: pt(52.3, 26.8), kind: "sea" },
		],
	};
	mkdirSync(new URL("../src/data/", import.meta.url), { recursive: true });
	writeFileSync(new URL("../src/data/gulf-map.json", import.meta.url), JSON.stringify(out));
	console.log(`gulf-map.json: ${(JSON.stringify(out).length / 1024).toFixed(0)} KB`);
}
