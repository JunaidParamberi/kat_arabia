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
	const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 40);
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
for (const film of $$("[data-film]")) {
	const stage = $("[data-film-stage]", film)!;
	const video = $<HTMLVideoElement>("[data-film-video]", film);
	const poster = $("[data-film-poster]", film);
	const chapters = $$("[data-film-chapter]", film);
	const tabs = $$<HTMLButtonElement>("[data-film-tab]", film);
	const fills = $$("[data-film-fill]", film);
	const num = $("[data-film-num]", film);
	const n = Math.max(1, chapters.length);
	let active = -1;

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

	let pending: number | null = null;
	const seek = (p: number) => {
		if (!video || !video.duration) return;
		if (pending !== null) cancelAnimationFrame(pending);
		pending = requestAnimationFrame(() => {
			video.currentTime = Math.min(video.duration - 0.05, p * video.duration);
			pending = null;
		});
	};

	const setProgress = (p: number) => {
		const pos = p * n;
		setChapter(Math.min(n - 1, Math.floor(pos)));
		fills.forEach((f, k) => {
			f.style.width = `${Math.max(0, Math.min(1, pos - k)) * 100}%`;
		});
		seek(p);
		if (poster) poster.style.transform = `scale(${1.12 - p * 0.12})`;
	};

	if (video) {
		video.pause();
		video.addEventListener("loadedmetadata", () => seek(0));
	}

	if (reduced) {
		setProgress(0);
		tabs.forEach((t, i) =>
			t.addEventListener("click", () => {
				setChapter(i);
				fills.forEach((f, k) => (f.style.width = k <= i ? "100%" : "0%"));
				seek((i + 0.5) / n);
			}),
		);
		continue;
	}

	const st = ScrollTrigger.create({
		trigger: film,
		start: "top top",
		end: () => `+=${window.innerHeight * (n + 0.5)}`,
		pin: stage,
		scrub: 0.6,
		anticipatePin: 1,
		onUpdate: (self) => setProgress(self.progress),
	});
	setProgress(0);

	tabs.forEach((t, i) =>
		t.addEventListener("click", () => {
			const y = st.start + (st.end - st.start) * ((i + 0.5) / n);
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

/* ---------- industries image swap ---------- */
for (const root of $$("[data-industries]")) {
	const items = $$<HTMLButtonElement>("[data-ind]", root);
	const imgs = $$<HTMLImageElement>("[data-ind-img]", root);
	const title = $("[data-ind-title]", root);
	const count = $("[data-ind-count]", root);
	const total = String(items.length).padStart(2, "0");
	const show = (btn: HTMLButtonElement) => {
		if (btn.dataset.hasImage !== "true") return;
		const i = btn.dataset.ind;
		items.forEach((b) => b.classList.toggle("is-active", b === btn));
		imgs.forEach((img) => img.classList.toggle("is-active", img.dataset.indImg === i));
		if (title) title.textContent = btn.querySelector(".disp")?.textContent ?? "";
		if (count) count.textContent = `${btn.querySelector(".mono")?.textContent ?? ""} / ${total}`;
	};
	items.forEach((b) => {
		b.addEventListener("mouseenter", () => show(b));
		b.addEventListener("focus", () => show(b));
		b.addEventListener("click", () => show(b));
	});
}

/* ---------- footprint arcs ---------- */
for (const map of $$("[data-map]")) {
	const arcs = $$<SVGPathElement>("[data-arc]", map);
	if (!arcs.length || reduced) continue;
	gsap.set(arcs, { strokeDasharray: 1, strokeDashoffset: 1 });
	ScrollTrigger.create({
		trigger: map,
		start: "top 75%",
		once: true,
		onEnter: () => gsap.to(arcs, { strokeDashoffset: 0, duration: 1.6, stagger: 0.25, ease: "power2.inOut" }),
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
