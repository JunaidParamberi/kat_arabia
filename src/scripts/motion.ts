import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
	root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
	Array.from(root.querySelectorAll<T>(sel));

/* ---------- smooth scroll ---------- */
let lenis: Lenis | null = null;
if (!reduced) {
	lenis = new Lenis({ duration: 1.1, smoothWheel: true });
	lenis.on("scroll", ScrollTrigger.update);
	gsap.ticker.add((time) => lenis?.raf(time * 1000));
	gsap.ticker.lagSmoothing(0);

	// Smooth in-page anchors.
	document.addEventListener("click", (e) => {
		const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href*="#"]');
		if (!a) return;
		const url = new URL(a.href, location.href);
		if (url.pathname !== location.pathname || !url.hash || url.hash === "#") return;
		const target = document.querySelector(url.hash);
		if (!target) return;
		e.preventDefault();
		lenis?.scrollTo(target as HTMLElement, { offset: -60 });
		history.replaceState(null, "", url.hash);
	});
}

/* ---------- header ---------- */
const header = $("[data-header]");
if (header) {
	let lastY = window.scrollY;
	const onScroll = () => {
		const y = window.scrollY;
		header.classList.toggle("is-scrolled", y > 40);
		// Hide when scrolling down, reveal when scrolling up.
		if (!header.classList.contains("menu-open")) {
			const down = y > lastY;
			if (down && y > 120) header.classList.add("is-hidden");
			else if (!down) header.classList.remove("is-hidden");
		}
		lastY = y;
	};
	onScroll();
	window.addEventListener("scroll", onScroll, { passive: true });

	const toggle = $<HTMLButtonElement>("[data-menu-toggle]", header);
	const menu = $("[data-menu]", header);
	toggle?.addEventListener("click", () => {
		const open = toggle.getAttribute("aria-expanded") !== "true";
		toggle.setAttribute("aria-expanded", String(open));
		toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
		header.classList.toggle("menu-open", open);
		if (menu) menu.hidden = !open;
		if (open) lenis?.stop();
		else lenis?.start();
	});
	menu?.addEventListener("click", (e) => {
		if ((e.target as HTMLElement).closest("a")) toggle?.click();
	});
}

/* ---------- hero intro ---------- */
const heroLines = $$("[data-hero-line]");
if (heroLines.length && !reduced) {
	const img = $("[data-hero-img]");
	const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
	if (img) tl.fromTo(img, { scale: 1.08 }, { scale: 1, duration: 2.2 }, 0);
	tl.from(heroLines, { y: 36, opacity: 0, duration: 1.1, stagger: 0.09 }, 0.15);
	if (img) {
		gsap.to(img, {
			yPercent: 8,
			ease: "none",
			scrollTrigger: { trigger: img.parentElement, start: "top top", end: "bottom top", scrub: true },
		});
	}
}

/* ---------- reveals ---------- */
if (reduced) {
	gsap.set("[data-reveal]", { opacity: 1, y: 0 });
} else {
	ScrollTrigger.batch("[data-reveal]", {
		start: "top 88%",
		once: true,
		onEnter: (els) =>
			gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.08, overwrite: true }),
	});
}

/* ---------- count-up facts ---------- */
for (const el of $$("[data-count]")) {
	const raw = el.dataset.count ?? "";
	const target = Number(raw);
	if (!Number.isFinite(target) || reduced || raw.length === 0) continue;
	const isYear = target > 1900 && target < 2100;
	const from = isYear ? target - 6 : 0;
	const pad = raw.length;
	const obj = { v: from };
	el.textContent = String(from).padStart(pad, "0");
	ScrollTrigger.create({
		trigger: el,
		start: "top 90%",
		once: true,
		onEnter: () =>
			gsap.to(obj, {
				v: target,
				duration: 1.6,
				ease: "power2.out",
				onUpdate: () => {
					el.textContent = String(Math.round(obj.v)).padStart(pad, "0");
				},
			}),
	});
}

/* ---------- parallax images ---------- */
if (!reduced) {
	for (const img of $$("[data-parallax]")) {
		gsap.fromTo(
			img,
			{ yPercent: -5 },
			{
				yPercent: 5,
				ease: "none",
				scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true },
			},
		);
	}
}

/* ---------- scroll film ---------- */
// Chapter breakpoints: Ground 0-20%, Structure 20-45%, Industry 45-65%, Energy 65-85%, Skyline 85-100%.
const FILM_BREAKPOINTS = [0, 0.2, 0.45, 0.65, 0.85, 1.0001];
// Sharpest frame in each chapter of public/film/film-scrub.mp4, as scroll progress. Re-measure if the film changes.
const FILM_REST_POINTS = [0, 0.44, 0.615, 0.84, 1];

for (const film of $$("[data-film]")) {
	const stage = $("[data-film-stage]", film)!;
	const video = $<HTMLVideoElement>("[data-film-video]", film);
	const poster = $("[data-film-poster]", film);
	const chapters = $$("[data-film-chapter]", film);
	const tabs = $$<HTMLButtonElement>("[data-film-tab]", film);
	const fills = $$("[data-film-fill]", film);
	const num = $("[data-film-num]", film);
	const intro = $("[data-film-intro]", film);
	const n = Math.max(1, chapters.length);
	const breakpoints = FILM_BREAKPOINTS.slice(0, n + 1);
	let active = -1;

	const chapterAt = (p: number) => {
		for (let k = n - 1; k >= 0; k--) {
			if (p >= breakpoints[k]) return k;
		}
		return 0;
	};

	const setChapter = (i: number) => {
		if (i === active) return;
		active = i;
		chapters.forEach((c, k) => c.classList.toggle("is-active", k === i));
		tabs.forEach((t, k) => {
			t.classList.toggle("is-active", k === i);
			t.setAttribute("aria-selected", String(k === i));
		});
		if (num) num.textContent = String(i + 1).padStart(2, "0");
	};

	// Smoothed scrub: a persistent rAF loop lerps currentTime toward the scroll-driven target,
	// instead of seeking directly on every scroll update.
	let target = 0;
	let current = 0;
	let rafId: number | null = null;
	const tickScrub = () => {
		rafId = null;
		if (!video || !Number.isFinite(video.duration) || !video.duration) return;
		current += (target * video.duration - current) * 0.18;
		if (Math.abs(target * video.duration - current) < 0.002) current = target * video.duration;
		video.currentTime = Math.max(0, Math.min(video.duration - 0.03, current));
		if (Math.abs(target * video.duration - current) > 0.001) rafId = requestAnimationFrame(tickScrub);
	};
	const seek = (p: number) => {
		target = p;
		if (rafId === null) rafId = requestAnimationFrame(tickScrub);
	};

	// Desktop-only pointer parallax on the video layer (max 12px), eased in the same scrub loop.
	const desktopMQ = window.matchMedia("(min-width: 769px)");
	let parallaxTargetX = 0;
	let parallaxTargetY = 0;
	let parallaxX = 0;
	let parallaxY = 0;
	let scale = 1;
	let parallaxRaf: number | null = null;
	const applyTransform = () => {
		if (video) video.style.transform = `scale(${scale}) translate3d(${parallaxX}px, ${parallaxY}px, 0)`;
	};
	const tickParallax = () => {
		parallaxRaf = null;
		parallaxX += (parallaxTargetX - parallaxX) * 0.08;
		parallaxY += (parallaxTargetY - parallaxY) * 0.08;
		applyTransform();
		if (Math.abs(parallaxTargetX - parallaxX) > 0.05 || Math.abs(parallaxTargetY - parallaxY) > 0.05) {
			parallaxRaf = requestAnimationFrame(tickParallax);
		}
	};
	if (!reduced) {
		stage.addEventListener("mousemove", (e) => {
			if (!desktopMQ.matches) return;
			const rect = stage.getBoundingClientRect();
			const nx = (e.clientX - rect.left) / rect.width - 0.5;
			const ny = (e.clientY - rect.top) / rect.height - 0.5;
			parallaxTargetX = nx * 24; // max ±12px
			parallaxTargetY = ny * 24;
			if (parallaxRaf === null) parallaxRaf = requestAnimationFrame(tickParallax);
		});
		stage.addEventListener("mouseleave", () => {
			parallaxTargetX = 0;
			parallaxTargetY = 0;
			if (parallaxRaf === null) parallaxRaf = requestAnimationFrame(tickParallax);
		});
	}

	let settleTimer: number | undefined;
	const setProgress = (p: number) => {
		const chapter = chapterAt(p);
		setChapter(chapter);
		fills.forEach((f, k) => {
			const span = breakpoints[k + 1] - breakpoints[k];
			const into = span > 0 ? (p - breakpoints[k]) / span : 0;
			f.style.width = `${Math.max(0, Math.min(1, into)) * 100}%`;
		});
		seek(p);
		// When scrolling pauses mid-film, ease only the video (never the page) to the nearest
		// sharp frame, so it doesn't rest on a motion-blurred one.
		if (settleTimer) clearTimeout(settleTimer);
		settleTimer = window.setTimeout(() => {
			if (p <= 0 || p >= 1) return;
			const rest = FILM_REST_POINTS.reduce((a, b) => (Math.abs(b - p) < Math.abs(a - p) ? b : a));
			if (Math.abs(rest - p) <= 0.15) seek(rest);
		}, 220);
		scale = 1 + p * 0.08;
		applyTransform();
		if (poster) poster.style.transform = `scale(${1.12 - p * 0.12})`;
		if (intro) {
			// Title card dissolves away once the scrub begins, so the film plays unobstructed.
			const dissolve = Math.min(1, p / 0.08);
			intro.style.opacity = String(1 - dissolve);
			intro.style.filter = `blur(${dissolve * 8}px)`;
			intro.style.transform = `translateY(${-dissolve * 28}px)`;
		}
	};

	if (video) {
		// iOS Safari leaves a muted/playsinline video on a black frame until it has
		// actually played once, even after seeking — force one play+pause to decode a frame.
		video.addEventListener("loadedmetadata", () => {
			const kick = video.play();
			if (kick && typeof kick.then === "function") {
				kick.then(() => video.pause()).catch(() => video.pause());
			} else {
				video.pause();
			}
			seek(0);
		});
	}

	if (reduced) {
		setChapter(0);
		fills.forEach((f) => (f.style.width = "0%"));
		tabs.forEach((t, i) =>
			t.addEventListener("click", () => {
				setChapter(i);
				fills.forEach((f, k) => (f.style.width = k <= i ? "100%" : "0%"));
			}),
		);
		continue;
	}

	const headerEl = $("[data-header]");
	const enterCinema = () => {
		headerEl?.classList.add("is-film-hidden");
		film.classList.add("is-pinned");
	};
	const leaveCinema = () => {
		headerEl?.classList.remove("is-film-hidden");
		film.classList.remove("is-pinned");
	};

	const st = ScrollTrigger.create({
		trigger: film,
		start: "top top",
		end: () => `+=${window.innerHeight * 5}`,
		pin: stage,
		scrub: 0.6,
		anticipatePin: 1,
		onUpdate: (self) => setProgress(self.progress),
		onEnter: enterCinema,
		onEnterBack: enterCinema,
		onLeave: leaveCinema,
		onLeaveBack: leaveCinema,
	});
	setProgress(0);

	tabs.forEach((t, i) =>
		t.addEventListener("click", () => {
			const mid = (breakpoints[i] + breakpoints[i + 1]) / 2;
			const y = st.start + (st.end - st.start) * mid;
			if (lenis) lenis.scrollTo(y, { duration: 1.4 });
			else window.scrollTo({ top: y, behavior: "smooth" });
		}),
	);
}

/* ---------- capabilities tabs ---------- */
for (const root of $$("[data-caps]")) {
	const rows = $$("[data-caps-row]", root);
	const tabs = $$<HTMLButtonElement>("[data-caps-tab]", root);
	const panels = $$("[data-caps-panel]", root);
	const select = (i: number, focus = false) => {
		rows.forEach((r, k) => r.classList.toggle("is-active", k === i));
		tabs.forEach((t, k) => {
			t.setAttribute("aria-selected", String(k === i));
			t.tabIndex = k === i ? 0 : -1;
		});
		panels.forEach((p, k) => {
			const on = k === i;
			p.hidden = !on;
			p.classList.toggle("is-active", on);
			if (on && !reduced) {
				gsap.fromTo(p.querySelector("figure"), { opacity: 0.2, scale: 1.02 }, { opacity: 1, scale: 1, duration: 0.7, ease: "power3.out" });
				gsap.fromTo(p.querySelectorAll("li"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: "power2.out" });
			}
		});
		if (focus) tabs[i]?.focus();
		ScrollTrigger.refresh();
	};
	tabs.forEach((t, i) => {
		t.tabIndex = t.getAttribute("aria-selected") === "true" ? 0 : -1;
		t.addEventListener("click", () => select(i));
		t.addEventListener("keydown", (e) => {
			if (e.key === "ArrowDown" || e.key === "ArrowRight") {
				e.preventDefault();
				select((i + 1) % tabs.length, true);
			} else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
				e.preventDefault();
				select((i - 1 + tabs.length) % tabs.length, true);
			}
		});
	});
}

/* ---------- footprint traverse: the survey line draws itself between benchmarks ---------- */
for (const map of $$("[data-map]")) {
	const arcs = $$<SVGPathElement>("[data-arc]", map);
	if (!arcs.length || reduced) continue;
	gsap.set(arcs, { strokeDasharray: 1, strokeDashoffset: 1 });
	ScrollTrigger.create({
		trigger: map,
		start: "top 70%",
		once: true,
		onEnter: () => gsap.to(arcs, { strokeDashoffset: 0, duration: 2.2, ease: "power2.inOut" }),
	});
}

/* ---------- workforce globe (lazy) ---------- */
const globes = $$("[data-globe]");
if (globes.length) {
	const io = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				io.unobserve(entry.target);
				import("./globe").then((m) => m.mountGlobe(entry.target as HTMLElement, { reduced }));
			}
		},
		{ rootMargin: "300px" },
	);
	globes.forEach((g) => io.observe(g));
}

/* ---------- enquiry form ---------- */
for (const form of $$<HTMLFormElement>("[data-enquiry]")) {
	const help = $("[data-help-text]", form);
	const extraLabel = $("[data-extra-label]", form);
	const extraInput = $<HTMLInputElement>("[data-extra-input]", form);
	const cta = $("[data-cta-label]", form);
	for (const radio of $$<HTMLInputElement>('input[name="type"]', form)) {
		radio.addEventListener("change", () => {
			if (!radio.checked) return;
			if (help) help.textContent = radio.dataset.help ?? "";
			if (extraLabel) extraLabel.textContent = radio.dataset.extra ?? "";
			if (extraInput) extraInput.placeholder = radio.dataset.ph ?? "";
			if (cta) cta.textContent = radio.dataset.cta ?? "Send";
		});
	}
	form.addEventListener("submit", async (e) => {
		e.preventDefault();
		const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
		const status = document.createElement("p");
		status.setAttribute("role", "status");
		status.className = "contact__notice";
		form.querySelector(".contact__notice")?.remove();
		if (button) button.disabled = true;
		try {
			const res = await fetch(form.action, {
				method: "POST",
				body: new FormData(form),
				headers: { Accept: "application/json" },
			});
			const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
			if (res.ok && data.ok) {
				status.textContent = "Thank you — your enquiry has been received. We will be in touch.";
				form.reset();
				form.querySelector<HTMLInputElement>('input[name="type"]')?.dispatchEvent(new Event("change"));
			} else {
				status.textContent = data.error ?? "Something went wrong. Please try again or email us.";
				status.classList.add("contact__notice--error");
			}
		} catch {
			status.textContent = "Network error. Please try again or email info@katarabia.com.";
			status.classList.add("contact__notice--error");
		} finally {
			if (button) button.disabled = false;
			form.prepend(status);
		}
	});
}

window.addEventListener("load", () => ScrollTrigger.refresh());
