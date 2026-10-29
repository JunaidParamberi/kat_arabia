import * as THREE from "three";

const COORDS: Record<string, [number, number]> = {
	india: [20.6, 79],
	nepal: [28.4, 84.1],
	pakistan: [30.4, 69.3],
	"sri lanka": [7.9, 80.8],
	bangladesh: [23.7, 90.4],
	philippines: [12.9, 121.8],
	ghana: [7.9, -1],
	kenya: [0, 37.9],
	uganda: [1.4, 32.3],
	"sierra leone": [8.5, -11.8],
	cameroon: [5.5, 12.4],
	burundi: [-3.4, 29.9],
};
const HUB: [number, number] = [27.0, 49.66]; // Al Jubail

const R = 1;
const toVec = (lat: number, lon: number, r = R) => {
	const phi = (90 - lat) * (Math.PI / 180);
	const theta = (lon + 180) * (Math.PI / 180);
	return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
};

export function mountGlobe(host: HTMLElement, opts: { reduced: boolean }) {
	const canvas = host.querySelector("canvas");
	if (!canvas) return;
	let countries: string[] = [];
	try {
		countries = JSON.parse(host.dataset.countries ?? "[]");
	} catch {
		countries = [];
	}

	let renderer: THREE.WebGLRenderer;
	try {
		renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
	} catch {
		// No WebGL: drop the empty canvas area; the country list still carries the content.
		host.remove();
		return;
	}
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
	camera.position.set(0, 0, 4.7);

	const globe = new THREE.Group();
	scene.add(globe);

	// Earth: a matte sphere textured with a real map (Natural Earth land + borders from
	// public/globe-map.json, built by scripts/build-maps.mjs). Saudi Arabia and the UAE are
	// maroon, the twelve source countries a muted gold. A host `data-texture` image replaces it.
	const SIZE = 2048;
	const tex = document.createElement("canvas");
	tex.width = SIZE;
	tex.height = SIZE / 2;
	const ctx = tex.getContext("2d");
	const texture = new THREE.CanvasTexture(tex);
	texture.colorSpace = THREE.SRGBColorSpace;
	texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
	const paint = (map: { width: number; land: string; borders: string; sources: string; hub: string }) => {
		if (!ctx) return;
		const k = SIZE / map.width;
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.fillStyle = "#1a1412";
		ctx.fillRect(0, 0, SIZE, SIZE / 2);
		ctx.scale(k, k);
		ctx.fillStyle = "#4a3c35";
		ctx.fill(new Path2D(map.land));
		ctx.fillStyle = "#8a6a45";
		ctx.fill(new Path2D(map.sources));
		ctx.fillStyle = "#8f1c22";
		ctx.fill(new Path2D(map.hub));
		ctx.strokeStyle = "rgba(236, 230, 219, 0.28)";
		ctx.lineWidth = 0.6;
		ctx.stroke(new Path2D(map.borders));
		ctx.strokeStyle = "rgba(236, 230, 219, 0.4)";
		ctx.lineWidth = 0.7;
		ctx.stroke(new Path2D(map.land));
		texture.needsUpdate = true;
	};
	if (host.dataset.texture) {
		new THREE.TextureLoader().load(host.dataset.texture, (t) => {
			t.colorSpace = THREE.SRGBColorSpace;
			earthMat.map = t;
			earthMat.needsUpdate = true;
		});
	} else {
		fetch("/globe-map.json")
			.then((r) => r.json())
			.then(paint)
			.catch(() => {});
	}
	const earthMat = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.92, metalness: 0 });
	const earth = new THREE.Mesh(new THREE.SphereGeometry(R, 128, 128), earthMat);
	// SphereGeometry's u = 0 already sits at longitude −180 and increases eastward, matching toVec().
	globe.add(earth);

	// Soft studio light: a key from the upper left and enough fill to keep the night side readable.
	scene.add(new THREE.AmbientLight(0xfff4e6, 1.15));
	const key = new THREE.DirectionalLight(0xfff1dc, 2.1);
	key.position.set(-3, 2.5, 4);
	scene.add(key);

	// Hub
	const hub = toVec(HUB[0], HUB[1], R * 1.01);
	const hubDot = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 16), new THREE.MeshBasicMaterial({ color: 0xe3484f }));
	hubDot.position.copy(hub);
	globe.add(hubDot);
	const ring = new THREE.Mesh(
		new THREE.RingGeometry(0.04, 0.05, 40),
		new THREE.MeshBasicMaterial({ color: 0xc8333a, transparent: true, opacity: 0.8, side: THREE.DoubleSide }),
	);
	ring.position.copy(hub);
	ring.lookAt(hub.clone().multiplyScalar(2));
	globe.add(ring);

	// Arcs
	const arcs: { line: THREE.Line; count: number; delay: number; curve: THREE.QuadraticBezierCurve3; pulse: THREE.Mesh }[] = [];
	const pulseMat = new THREE.MeshBasicMaterial({ color: 0xffc977, transparent: true, opacity: 1 });
	const arcMat = new THREE.LineBasicMaterial({ color: 0xe3b877, transparent: true, opacity: 0.9 });
	const pointMat = new THREE.MeshBasicMaterial({ color: 0xf6e6c8 });
	countries.forEach((name, i) => {
		const c = COORDS[name.toLowerCase()];
		if (!c) return;
		const from = toVec(c[0], c[1], R * 1.01);
		const dist = from.distanceTo(hub);
		const mid = from.clone().add(hub).multiplyScalar(0.5).normalize().multiplyScalar(R + dist * 0.28);
		const curve = new THREE.QuadraticBezierCurve3(from, mid, hub);
		const pts = curve.getPoints(64);
		const geo = new THREE.BufferGeometry().setFromPoints(pts);
		geo.setDrawRange(0, opts.reduced ? pts.length : 0);
		const line = new THREE.Line(geo, arcMat);
		globe.add(line);
		const pulse = new THREE.Mesh(new THREE.SphereGeometry(0.01, 8, 8), pulseMat);
		pulse.visible = false;
		globe.add(pulse);
		arcs.push({ line, count: pts.length, delay: i * 0.18, curve, pulse });
		const p = new THREE.Mesh(new THREE.SphereGeometry(0.013, 10, 10), pointMat);
		p.position.copy(from);
		globe.add(p);
	});

	// Face Al Jubail toward the camera: a Y turn of π/2 − θ brings longitude θ to +z, then tilt by part of its latitude.
	const hubTheta = ((HUB[1] + 180) * Math.PI) / 180;
	globe.rotation.set(((HUB[0] * Math.PI) / 180) * 0.6, Math.PI / 2 - hubTheta, 0);
	const base = { x: globe.rotation.x, y: globe.rotation.y };

	// Drag to rotate
	let dragging = false;
	let lastX = 0;
	let offset = 0;
	let velocity = 0;
	canvas.addEventListener("pointerdown", (e) => {
		dragging = true;
		lastX = e.clientX;
		canvas.setPointerCapture(e.pointerId);
	});
	canvas.addEventListener("pointermove", (e) => {
		if (!dragging) return;
		velocity = (e.clientX - lastX) * 0.005;
		offset += velocity;
		lastX = e.clientX;
	});
	const end = () => (dragging = false);
	canvas.addEventListener("pointerup", end);
	canvas.addEventListener("pointercancel", end);
	canvas.style.touchAction = "pan-y";
	canvas.style.cursor = "grab";

	const resize = () => {
		const { width, height } = host.getBoundingClientRect();
		renderer.setSize(width, height, false);
		camera.aspect = width / Math.max(1, height);
		camera.updateProjectionMatrix();
	};
	resize();
	new ResizeObserver(resize).observe(host);

	let visible = true;
	new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(host);

	const clock = new THREE.Clock();
	const tick = () => {
		requestAnimationFrame(tick);
		if (!visible) return;
		const t = clock.getElapsedTime();
		if (!opts.reduced) {
			if (!dragging) {
				velocity *= 0.94;
				offset += velocity;
			}
			globe.rotation.y = base.y + Math.sin(t * 0.18) * 0.35 + offset;
			globe.rotation.x = base.x;
			for (const a of arcs) {
				const k = Math.max(0, Math.min(1, (t - 0.4 - a.delay) / 1.4));
				a.line.geometry.setDrawRange(0, Math.floor(k * a.count));
				// Once drawn, a pulse travels from the source country into Al Jubail.
				if (k >= 1) {
					a.pulse.visible = true;
					a.pulse.position.copy(a.curve.getPoint(((t * 0.35 + a.delay) % 1)));
				}
			}
			const s = 1 + ((t * 0.8) % 1) * 1.6;
			ring.scale.setScalar(s);
			(ring.material as THREE.MeshBasicMaterial).opacity = 0.8 * (1 - ((t * 0.8) % 1));
		}
		renderer.render(scene, camera);
	};
	tick();
}
