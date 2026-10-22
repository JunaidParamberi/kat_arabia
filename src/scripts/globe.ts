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

	const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
	camera.position.set(0, 0, 4.1);

	const globe = new THREE.Group();
	scene.add(globe);

	// Body
	globe.add(
		new THREE.Mesh(
			new THREE.SphereGeometry(R * 0.995, 64, 64),
			new THREE.MeshBasicMaterial({ color: 0x1d1614, transparent: true, opacity: 0.96 }),
		),
	);

	// Fibonacci dot shell
	const N = 2600;
	const dots = new Float32Array(N * 3);
	for (let i = 0; i < N; i++) {
		const y = 1 - (i / (N - 1)) * 2;
		const rad = Math.sqrt(1 - y * y);
		const t = Math.PI * (3 - Math.sqrt(5)) * i;
		dots.set([Math.cos(t) * rad * R, y * R, Math.sin(t) * rad * R], i * 3);
	}
	const dotGeo = new THREE.BufferGeometry();
	dotGeo.setAttribute("position", new THREE.BufferAttribute(dots, 3));
	globe.add(new THREE.Points(dotGeo, new THREE.PointsMaterial({ color: 0x6b605a, size: 0.012, transparent: true, opacity: 0.55 })));

	// Graticule
	const lineMat = new THREE.LineBasicMaterial({ color: 0xece6db, transparent: true, opacity: 0.08 });
	for (let lat = -60; lat <= 60; lat += 30) {
		const pts = [];
		for (let lon = -180; lon <= 180; lon += 4) pts.push(toVec(lat, lon, R * 1.001));
		globe.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
	}
	for (let lon = -180; lon < 180; lon += 30) {
		const pts = [];
		for (let lat = -90; lat <= 90; lat += 4) pts.push(toVec(lat, lon, R * 1.001));
		globe.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
	}

	// Hub
	const hub = toVec(HUB[0], HUB[1], R * 1.01);
	const hubDot = new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 16), new THREE.MeshBasicMaterial({ color: 0xc8333a }));
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
	const arcs: { line: THREE.Line; count: number; delay: number }[] = [];
	const arcMat = new THREE.LineBasicMaterial({ color: 0xe3b877, transparent: true, opacity: 0.9 });
	const pointMat = new THREE.MeshBasicMaterial({ color: 0xece6db });
	countries.forEach((name, i) => {
		const c = COORDS[name.toLowerCase()];
		if (!c) return;
		const from = toVec(c[0], c[1], R * 1.01);
		const dist = from.distanceTo(hub);
		const mid = from.clone().add(hub).multiplyScalar(0.5).normalize().multiplyScalar(R + dist * 0.45);
		const curve = new THREE.QuadraticBezierCurve3(from, mid, hub);
		const pts = curve.getPoints(64);
		const geo = new THREE.BufferGeometry().setFromPoints(pts);
		geo.setDrawRange(0, opts.reduced ? pts.length : 0);
		const line = new THREE.Line(geo, arcMat);
		globe.add(line);
		arcs.push({ line, count: pts.length, delay: i * 0.18 });
		const p = new THREE.Mesh(new THREE.SphereGeometry(0.016, 10, 10), pointMat);
		p.position.copy(from);
		globe.add(p);
	});

	// Face Arabia toward the camera.
	const baseY = -((HUB[1] + 90) * Math.PI) / 180 + Math.PI;
	globe.rotation.set((HUB[0] * Math.PI) / 180 * 0.6, baseY - Math.PI / 2 + 0.25, 0);
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
			}
			const s = 1 + ((t * 0.8) % 1) * 1.6;
			ring.scale.setScalar(s);
			(ring.material as THREE.MeshBasicMaterial).opacity = 0.8 * (1 - ((t * 0.8) % 1));
		}
		renderer.render(scene, camera);
	};
	tick();
}
