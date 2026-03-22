(function () {
	"use strict";

	const ICON_PATHS = {
		arrowLeft: `
			<line x1="19" y1="12" x2="5" y2="12"></line>
			<polyline points="12 19 5 12 12 5"></polyline>
		`,
		chevronLeft: `
			<polyline points="15 18 9 12 15 6"></polyline>
		`,
		chevronRight: `
			<polyline points="9 18 15 12 9 6"></polyline>
		`,
		github: `
			<path d="M9 19c-5 1.5-5-2.5-7-3"></path>
			<path d="M16 22v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
		`,
		externalLink: `
			<path d="M15 3h6v6"></path>
			<path d="M10 14 21 3"></path>
			<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
		`,
	};

	function svgIcon(name, size) {
		const paths = ICON_PATHS[name];
		if (!paths) return "";
		return `
			<svg xmlns="http://www.w3.org/2000/svg"
				width="${size}" height="${size}"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true">
				${paths}
			</svg>
		`.trim();
	}

	function injectIcons(root) {
		const scope = root || document;

		const nodes = [];
		if (scope instanceof Element && scope.matches("[data-icon]")) nodes.push(scope);
		scope.querySelectorAll("[data-icon]").forEach((el) => nodes.push(el));

		nodes.forEach((el) => {
			const name = el.getAttribute("data-icon");
			const size = el.classList.contains("icon-inline") ? 20 : 24;
			el.innerHTML = svgIcon(name, size);
		});
	}

	const translations = {
		pt: {
			"projects.description": "Descrição",
			"projects.desktop": "Desktop",
			"projects.mobile": "Mobile",
			"projects.imageAlt": "Imagem {n}",
			"projects.seeMore": "Ver mais",
			"projects.readMore": "Ver mais",
			"projects.readLess": "Ver menos",
			"projects.carouselPrev": "Anterior",
			"projects.carouselNext": "Próximo",
			"projects.carouselGoTo": "Ir para a imagem {n}",
			"projects.stacksTools": "STACKS & TOOLS:",
			"projects.backToProjects": "Voltar aos projetos",
			"projects.type.personal": "Pessoal",
			"projects.type.freelance": "Freelancer",
			"projects.type.professional": "Profissional",
		},
		en: {
			"projects.description": "Description",
			"projects.desktop": "Desktop",
			"projects.mobile": "Mobile",
			"projects.imageAlt": "Image {n}",
			"projects.seeMore": "See more",
			"projects.readMore": "Read more",
			"projects.readLess": "Read less",
			"projects.carouselPrev": "Previous",
			"projects.carouselNext": "Next",
			"projects.carouselGoTo": "Go to image {n}",
			"projects.stacksTools": "STACKS & TOOLS:",
			"projects.backToProjects": "Back to projects",
			"projects.type.personal": "Personal",
			"projects.type.freelance": "Freelance",
			"projects.type.professional": "Professional",
		},
	};

	const STORAGE_KEY = "mm_portfolio_lang";
	let currentLanguage = "pt";

	try {
		const savedLang = localStorage.getItem(STORAGE_KEY);
		if (savedLang === "en" || savedLang === "pt") currentLanguage = savedLang;
	} catch (e) {}

	function t(key) {
		return (translations[currentLanguage] && translations[currentLanguage][key]) || key;
	}

	function applyTranslations() {
		document.documentElement.lang = currentLanguage;

		document.querySelectorAll("[data-i18n]").forEach((el) => {
			const key = el.getAttribute("data-i18n");
			el.textContent = t(key);
		});

		const back = document.getElementById("project-detail-back");
		if (back) {
			back.title = t("projects.backToProjects");
			back.setAttribute("aria-label", t("projects.backToProjects"));
		}

		const descToggle = document.getElementById("pd-desc-toggle");
		const descWrap = document.getElementById("pd-desc-wrap");
		if (descToggle && descWrap && !descToggle.classList.contains("hidden")) {
			const expanded = descWrap.classList.contains("is-expanded");
			descToggle.textContent = expanded ? t("projects.readLess") : t("projects.readMore");
		}
	}

	function setupMobileDescriptionToggle() {
		const wrap = document.getElementById("pd-desc-wrap");
		const desc = document.getElementById("pd-description");
		const toggle = document.getElementById("pd-desc-toggle");
		if (!wrap || !desc || !toggle) return;

		const isMobile = window.matchMedia && window.matchMedia("(max-width: 1024px)").matches;

		// Reset
		wrap.classList.remove("is-collapsed", "is-expanded");
		toggle.classList.add("hidden");
		toggle.setAttribute("aria-expanded", "false");
		toggle.textContent = "";

		if (!isMobile) return;

		wrap.classList.add("is-collapsed");
		toggle.classList.remove("hidden");
		toggle.textContent = t("projects.readMore");
		toggle.setAttribute("aria-expanded", "false");

		requestAnimationFrame(() => {
			const overflows = desc.scrollHeight > desc.clientHeight + 1;
			if (!overflows) {
				wrap.classList.remove("is-collapsed");
				toggle.classList.add("hidden");
			}
		});

		if (toggle.dataset.bound !== "1") {
			toggle.dataset.bound = "1";
			toggle.addEventListener("click", () => {
				const expanded = wrap.classList.contains("is-expanded");
				if (expanded) {
					wrap.classList.remove("is-expanded");
					wrap.classList.add("is-collapsed");
					toggle.textContent = t("projects.readMore");
					toggle.setAttribute("aria-expanded", "false");
					return;
				}

				wrap.classList.add("is-expanded");
				wrap.classList.remove("is-collapsed");
				toggle.textContent = t("projects.readLess");
				toggle.setAttribute("aria-expanded", "true");
			});
		}
	}

	function projectField(project, key) {
		if (!project || !key) return "";
		const primary = currentLanguage === "en" ? `${key}_en` : key;
		const fallback = currentLanguage === "en" ? key : `${key}_en`;
		return project[primary] || project[fallback] || "";
	}

	function workTypeLabel(type) {
		if (!type) return "";
		const key = `projects.type.${type}`;
		const v = t(key);
		return v === key ? type : v;
	}

	function escapeHtml(value) {
		return String(value)
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/\"/g, "&quot;")
			.replace(/'/g, "&#039;");
	}

	const TECH_ICON_MAP = {
		react: { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" },
		node: { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg" },
		nodejs: { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg" },
		js: { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg" },
		javascript: { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg" },
		ts: { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg" },
		typescript: { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg" },
		python: { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg" },
		postgres: { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg" },
		postgresql: { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg" },
		tailwind: { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg" },
		tailwindcss: { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg" },
		mongodb: { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg" },
		docker: { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg" },
		wordpress: { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/wordpress/wordpress-plain.svg" },
		git: { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg" },
		github: { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg", invert: true },
		figma: { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-original.svg" },
		vite: { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vitejs/vitejs-original.svg" },
		nextjs: { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg", invert: true },
		express: { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/express/express-original.svg", invert: true },
	};

	function techIconMeta(tech) {
		const raw = String(tech || "").trim();
		if (!raw) return null;

		const key = raw.toLowerCase();
		const normalized = key.replace(/[^a-z0-9]/g, "");

		return TECH_ICON_MAP[normalized] || TECH_ICON_MAP[key] || null;
	}

	function normalizeProjectImages(project) {
		const desktopImages = Array.isArray(project.desktopImages) ? project.desktopImages : [];
		const mobileImages = Array.isArray(project.mobileImages) ? project.mobileImages : [];

		const legacy = Array.isArray(project.images) ? project.images : [];

		const outDesktop = desktopImages.length ? desktopImages.slice() : legacy.slice();
		const outMobile = mobileImages.length ? mobileImages.slice() : [];

		return { desktop: outDesktop, mobile: outMobile };
	}

	function resolveMobilePlaceholder(src) {
		const s = String(src || "");
		if (!s) return s;
		if (s.includes("placeholder.svg")) return "assets/img/placeholder-mobile.svg";
		return s;
	}

	function resolveDesktopPlaceholder(src) {
		const s = String(src || "");
		if (!s) return s;
		if (s.includes("placeholder.svg")) return "assets/img/placeholder-desktop.svg";
		return s;
	}

	function redirectToProjects() {
		window.location.replace("index.html?skipIntro=1#projects");
	}

	// ==========================
	// Carousels (scroll only when needed)
	// ==========================
	function isScrollerOverflowing(scroller) {
		if (!scroller) return false;
		const items = Array.from(scroller.children || []).filter((el) => el && el.nodeType === 1);
		if (items.length <= 1) return false;
		// Tolerance to avoid false positives due to fractional pixels / rounding.
		return scroller.scrollWidth > scroller.clientWidth + 8;
	}

	function makeCarouselDraggable(scroller) {
		if (!scroller) return;
		if (scroller.dataset.dragBound === "1") return;
		scroller.dataset.dragBound = "1";

		let isDown = false;
		let startX = 0;
		let startScrollLeft = 0;

		const onPointerDown = (e) => {
			if (!isScrollerOverflowing(scroller)) return;
			isDown = true;
			startX = e.clientX;
			startScrollLeft = scroller.scrollLeft;
			scroller.classList.add("is-dragging");
			try {
				scroller.setPointerCapture(e.pointerId);
			} catch (err) {}
		};

		const onPointerMove = (e) => {
			if (!isDown) return;
			const dx = e.clientX - startX;
			scroller.scrollLeft = startScrollLeft - dx;
		};

		const endDrag = (e) => {
			if (!isDown) return;
			isDown = false;
			scroller.classList.remove("is-dragging");
			try {
				scroller.releasePointerCapture(e.pointerId);
			} catch (err) {}
		};

		scroller.addEventListener("pointerdown", onPointerDown, { passive: true });
		scroller.addEventListener("pointermove", onPointerMove, { passive: true });
		scroller.addEventListener("pointerup", endDrag, { passive: true });
		scroller.addEventListener("pointercancel", endDrag, { passive: true });
	}

	function setupScrollableShell(shell, scroller) {
		if (!shell || !scroller) return;
		if (shell.dataset.scrollBound === "1") return;
		shell.dataset.scrollBound = "1";

		const onScroll = () => refreshScrollableShell(shell, scroller);
		scroller.addEventListener("scroll", onScroll, { passive: true });
		// Keep a reference for debugging (optional).
		shell._mmOnScroll = onScroll;
	}

	function refreshScrollableShell(shell, scroller) {
		if (!shell || !scroller) return;

		const scrollable = isScrollerOverflowing(scroller);
		shell.classList.toggle("is-scrollable", scrollable);

		if (!scrollable) {
			shell.classList.remove("at-start", "at-end");
			if (scroller.scrollLeft !== 0) scroller.scrollLeft = 0;
			return;
		}

		const max = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
		const left = scroller.scrollLeft;
		shell.classList.toggle("at-start", left <= 2);
		shell.classList.toggle("at-end", left >= max - 2);
	}

	function setupCarousels() {
		const shells = document.querySelectorAll(".pd2-carousel-shell");
		shells.forEach((shell) => {
			const scroller = shell.querySelector(".pd2-carousel");
			if (!scroller) return;

			makeCarouselDraggable(scroller);
			setupScrollableShell(shell, scroller);
			refreshScrollableShell(shell, scroller);

			// Prevent native image dragging inside carousels
			scroller.querySelectorAll("img").forEach((img) => {
				img.setAttribute("draggable", "false");
				img.addEventListener(
					"load",
					() => refreshScrollableShell(shell, scroller),
					{ once: true }
				);
			});
		});
	}


	// ==========================
	// Boot / Data loading
	// ==========================
	async function loadProjectsJson() {
		const res = await fetch("scripts/projetos.json", { cache: "no-store" });
		if (!res.ok) throw new Error(`Failed to load projetos.json (${res.status})`);
		const data = await res.json();
		if (Array.isArray(data)) return data;
		if (data && Array.isArray(data.projects)) return data.projects;
		return [];
	}

	function getProjectIdFromUrl() {
		try {
			const params = new URLSearchParams(window.location.search || "");
			return (params.get("id") || "").trim();
		} catch (e) {
			return "";
		}
	}

	function setText(id, value) {
		const el = document.getElementById(id);
		if (!el) return;
		el.textContent = value || "";
	}

	function clearNode(id) {
		const el = document.getElementById(id);
		if (!el) return null;
		el.innerHTML = "";
		return el;
	}

	function renderTags(technologies) {
		const wrap = clearNode("pd-tags");
		if (!wrap) return;
		(technologies || []).forEach((tch) => {
			const pill = document.createElement("span");
			pill.className = "pd2-tag font-mono";
			pill.textContent = tch;
			wrap.appendChild(pill);
		});
	}

	function renderTechIcons(technologies) {
		const wrap = clearNode("pd-tech");
		if (!wrap) return;

		(technologies || []).forEach((tch) => {
			const meta = techIconMeta(tch);

			const chip = document.createElement("span");
			chip.className = "pd2-stack-icon" + (meta && meta.invert ? " is-invert" : "");
			chip.title = tch;

			if (meta && meta.src) {
				const img = document.createElement("img");
				img.src = meta.src;
				img.alt = tch;
				img.loading = "lazy";
				chip.appendChild(img);
			} else {
				const span = document.createElement("span");
				span.className = "pd2-stack-mark font-mono";
				span.textContent = (tch || "").slice(0, 2).toUpperCase();
				chip.appendChild(span);
			}

			wrap.appendChild(chip);
		});
	}

	function buildDesktopItem(src, idx) {
		const device = document.createElement("div");
		device.className = "pd2-device pd2-device--desktop";

		const screen = document.createElement("div");
		screen.className = "pd2-device__screen";

		const img = document.createElement("img");
		img.src = resolveDesktopPlaceholder(src);
		img.alt = t("projects.imageAlt").replace("{n}", String((idx || 0) + 1));
		img.loading = "lazy";
		screen.appendChild(img);

		device.appendChild(screen);
		return device;
	}

	function buildMobileItem(src, idx) {
		const device = document.createElement("div");
		device.className = "pd2-device pd2-device--mobile";

		const screen = document.createElement("div");
		screen.className = "pd2-device__screen";

		const img = document.createElement("img");
		img.src = resolveMobilePlaceholder(src);
		img.alt = t("projects.imageAlt").replace("{n}", String((idx || 0) + 1));
		img.loading = "lazy";
		screen.appendChild(img);

		device.appendChild(screen);
		return device;
	}

	function renderImages(sectionId, stripId, images, buildItemFn) {
		const section = document.getElementById(sectionId);
		const strip = document.getElementById(stripId);
		if (!section || !strip) return;

		strip.innerHTML = "";
		if (!images || !images.length) {
			section.classList.add("hidden");
			return;
		}

		section.classList.remove("hidden");
		images.forEach((src, idx) => strip.appendChild(buildItemFn(src, idx)));
	}

	function renderProject(project) {
		if (!project) return;

		setText("pd-company", projectField(project, "company"));
		setText("pd-title", projectField(project, "title"));
		setText("pd-type", workTypeLabel(project.workType));

		const techs = Array.isArray(project.technologies) ? project.technologies : [];
		renderTags(techs);
		renderTechIcons(techs);

		const desc = projectField(project, "fullDescription") || projectField(project, "description");
		setText("pd-description", desc);

		const live = document.getElementById("pd-live");
		if (live) {
			const url = String(project.liveUrl || "").trim();
			if (url) {
				live.href = url;
				live.classList.remove("hidden");
			} else {
				live.href = "#";
				live.classList.add("hidden");
			}
		}

		const actions = document.querySelector(".pd2-panel-actions");
		if (actions && live) {
			actions.classList.toggle("has-two", !live.classList.contains("hidden"));
		}

		const git = document.getElementById("pd-git");
		if (git) {
			git.href = String(project.repoUrl || "").trim() || "https://github.com/Matheus-Machaado";
		}

		const imgs = normalizeProjectImages(project);
		renderImages("pd-desktop-section", "pd-desktop-strip", imgs.desktop, buildDesktopItem);
		renderImages("pd-mobile-section", "pd-mobile-strip", imgs.mobile, buildMobileItem);

		applyTranslations();
		setupMobileDescriptionToggle();
		setupCarousels();

		requestAnimationFrame(() => {
			document.querySelectorAll(".pd2-carousel-shell").forEach((shell) => {
				const scroller = shell.querySelector(".pd2-carousel");
				if (!scroller) return;
				refreshScrollableShell(shell, scroller);
			});
		});
	}

	async function boot() {
		// Ensure icons are injected on static elements (back button, links)
		injectIcons(document);

		const id = getProjectIdFromUrl();
		if (!id) return redirectToProjects();

		let projects = [];
		try {
			projects = await loadProjectsJson();
		} catch (e) {
			return redirectToProjects();
		}

		const project = projects.find((p) => String(p.id) === String(id));
		if (!project) return redirectToProjects();

		renderProject(project);

		window.addEventListener("resize", () => {
			setupMobileDescriptionToggle();
			document.querySelectorAll(".pd2-carousel-shell").forEach((shell) => {
				const scroller = shell.querySelector(".pd2-carousel");
				if (!scroller) return;
				refreshScrollableShell(shell, scroller);
			});
		});
	}

	document.addEventListener("DOMContentLoaded", boot);

})();
