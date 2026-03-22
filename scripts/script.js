(function () {
	"use strict";

	const ICON_PATHS = {
		menu: `
			<line x1="4" y1="12" x2="20" y2="12"></line>
			<line x1="4" y1="6" x2="20" y2="6"></line>
			<line x1="4" y1="18" x2="20" y2="18"></line>
		`,
		x: `
			<line x1="18" y1="6" x2="6" y2="18"></line>
			<line x1="6" y1="6" x2="18" y2="18"></line>
		`,
		github: `
			<path d="M9 19c-5 1.5-5-2.5-7-3"></path>
			<path d="M16 22v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
		`,
		linkedin: `
			<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
			<rect x="2" y="9" width="4" height="12"></rect>
			<circle cx="4" cy="4" r="2"></circle>
		`,
		mail: `
			<rect x="2" y="4" width="20" height="16" rx="2"></rect>
			<path d="m22 7-10 5L2 7"></path>
		`,
		download: `
			<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
			<polyline points="7 10 12 15 17 10"></polyline>
			<line x1="12" y1="15" x2="12" y2="3"></line>
		`,
		externalLink: `
			<path d="M15 3h6v6"></path>
			<path d="M10 14 21 3"></path>
			<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
		`,
		arrowLeft: `
			<line x1="19" y1="12" x2="5" y2="12"></line>
			<polyline points="12 19 5 12 12 5"></polyline>
		`,
		eye: `
			<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
			<circle cx="12" cy="12" r="3"></circle>
		`,
		chevronLeft: `
			<polyline points="15 18 9 12 15 6"></polyline>
		`,
		chevronRight: `
			<polyline points="9 18 15 12 9 6"></polyline>
		`,
		chevronDown: `
			<polyline points="6 9 12 15 18 9"></polyline>
		`,
		send: `
			<path d="m22 2-7 20-4-9-9-4Z"></path>
			<path d="M22 2 11 13"></path>
		`,
		messageCircle: `
			<path d="m21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"></path>
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

	const CONTACT_EMAIL = "matheus.machaado.dev@gmail.com";

	const CV_FILES = {
		pt: { url: "assets/curriculos/curriculo.pdf", filename: "Matheus_Machado_Curriculo_PT.pdf" },
		en: { url: "assets/curriculos/curriculo_english.pdf", filename: "Matheus_Machado_Curriculo_EN.pdf" },
	};

	function triggerDownload(url, filename) {
		if (!url) return;
		const a = document.createElement("a");
		a.href = url;
		if (filename) a.download = filename;
		a.target = "_blank";
		a.rel = "noopener";
		document.body.appendChild(a);
		a.click();
		a.remove();
	}


	let copyToastTimer = null;

	function showCopyToast(message) {
		const toast = document.getElementById("copy-toast");
		const text = document.getElementById("copy-toast-text");
		if (!toast || !text) return;

		text.textContent = message;
		toast.setAttribute("aria-hidden", "false");
		toast.classList.add("show");

		if (copyToastTimer) clearTimeout(copyToastTimer);
		copyToastTimer = setTimeout(() => {
			toast.classList.remove("show");
			toast.setAttribute("aria-hidden", "true");
		}, 2400);
	}

	async function copyTextToClipboard(text) {
		try {
			if (navigator.clipboard && navigator.clipboard.writeText) {
				await navigator.clipboard.writeText(text);
				return true;
			}
		} catch (e) {}

		try {
			const ta = document.createElement("textarea");
			ta.value = text;
			ta.setAttribute("readonly", "");
			ta.style.position = "fixed";
			ta.style.top = "-1000px";
			ta.style.left = "-1000px";
			document.body.appendChild(ta);
			ta.select();
			ta.setSelectionRange(0, ta.value.length);
			const ok = document.execCommand("copy");
			ta.remove();
			return ok;
		} catch (e) {}

		return false;
	}

	function bindContactEmailCopy() {
		const btnMain = document.getElementById("contact-copy-email");
		const btnIcon = document.getElementById("contact-email-btn");

		const handler = async (e) => {
			if (e) e.preventDefault();
			await copyTextToClipboard(CONTACT_EMAIL);
			showCopyToast(t("contact.emailCopied").replace("{email}", CONTACT_EMAIL));
		};

		if (btnMain && !btnMain.dataset.bound) {
			btnMain.dataset.bound = "1";
			btnMain.addEventListener("click", handler);
		}

		if (btnIcon && !btnIcon.dataset.bound) {
			btnIcon.dataset.bound = "1";
			btnIcon.addEventListener("click", handler);
			btnIcon.addEventListener("keydown", (ev) => {
				if (ev.key === "Enter" || ev.key === " ") {
					ev.preventDefault();
					handler(ev);
				}
			});
		}
	}


	const translations = {
		pt: {
			"nav.home": "Início",
			"nav.about": "Sobre",
			"nav.projects": "Projetos",
			"nav.experience": "Experiência",
			"nav.education": "Educação",
			"nav.skills": "Tecnologias",
			"nav.contact": "Contato",

			"language.english": "Inglês",
			"language.portuguese": "Português",

			"hero.greeting": "Olá, eu sou",
			"hero.name": "Matheus Machado",
			"hero.title": "Full Stack Developer",
			"hero.subtitle": "Especialista em desenvolvimento web, automações e raspagem de dados. Transformo ideias em soluções digitais eficientes.",
			"hero.cta.contact": "Entrar em contato",
			"hero.cta.cv": "Baixar Currículo",

			"about.title": "Sobre Mim",
			"about.subtitle": "Conheça minha trajetória profissional",
			"about.description": "Sou Desenvolvedor Full Stack com 3+ anos de vivência em tecnologia (desde 2022), atuando do Front-end (React/JS) ao Back-end e Dados (Python/SQL) — com foco forte em automação, web scraping e construção de ferramentas internas que aceleram operações e reduzem trabalho manual.\n\nComecei minha jornada em 2022 como Jovem Aprendiz de TI na Totale Tecnologia, onde tive meu primeiro contato com o mundo corporativo e aprendi, na prática, o valor de ser proativo, colaborativo e sempre disposto a aprender.\nEm 2024, iniciei na Ridolfinvest como estagiário, mergulhando em Python, SQL, scraping e automações. Em dezembro/2024, fui promovido para Desenvolvedor Júnior, passando a atuar com responsabilidade ponta a ponta: front, back, banco e integrações.",

			"about.video": "Vídeo de apresentação",

			"skills.title": "Tecnologias",
			"skills.subtitle": "Ferramentas e linguagens que domino",
			"skills.frontend": "Frontend",
			"skills.backend": "Backend & Dados",
			"skills.tools": "Ferramentas",
			"skills.automation": "Automação",

			"projects.title": "Projetos",
			"projects.subtitle": "Projetos pessoais e profissionais",
			"projects.lead": "Aqui você encontra todos os projetos em que já trabalhei, sejam pessoais ou aqueles realizados com vínculo empregatício.",
			"projects.seeMore": "Ver mais",
			"projects.technologies": "Tecnologias",
			"projects.description": "Descrição",
			"projects.backToProjects": "Voltar aos projetos",
			"projects.desktop": "Desktop",
			"projects.mobile": "Mobile",
			"projects.stacksTools": "STACKS & TOOLS:",
			"projects.type.personal": "Pessoal",
			"projects.type.freelance": "Freelancer",
			"projects.type.professional": "Profissional",

			"experience.title": "Experiência Profissional",
			"experience.subtitle": "Minha trajetória no mercado de trabalho",
			"experience.showDetails": "Mostrar detalhes",
			"experience.hideDetails": "Esconder detalhes",
			"experience.technologies": "Tecnologias aprendidas",
			"experience.present": "Presente",
			"experience.companyLinkTitle": "Click para ser levado a pagina da empresa",

			"education.title": "Educação",
			"education.subtitle": "Formação acadêmica e especializações",
			"education.academic": "Formação Acadêmica",
			"education.courses": "Cursos e Certificados",
			"education.fiap.name": "FIAP",
			"education.fiap.degree": "Tecnólogo em Análise e Desenvolvimento de Sistemas",
			"education.fiap.description": "Formação prática e voltada ao mercado, com projetos em Web, Banco de Dados, APIs REST, ORM (JPA/Hibernate), BI (Power BI), NoSQL (MongoDB), Cloud (Azure/AWS) e Mobile.",
			"education.fiap.status": "Concluído",
			"education.fiap.period": "2022 - 2024",
			"education.usp.name": "USP/ESALQ",
			"education.usp.degree": "MBA em Engenharia de Software",
			"education.usp.description": "Pós-graduação (EAD) com foco em fundamentos e práticas de Engenharia de Software, abrangendo arquitetura, qualidade, DevOps, métodos ágeis e aplicações modernas.",
			"education.usp.status": "Em andamento",
			"education.usp.period": "11/2025 - Presente",
			"education.filter.all": "Todos",
			"education.filter.frontend": "Front-end",
			"education.filter.backend": "Back-end",
			"education.filter.design": "Design",
			"education.filter.sql": "SQL",
			"education.filter.others": "Outros",
			"education.download": "Baixar certificado",
			"education.downloadAll": "Baixar pacote",

			"contact.title": "Contato",
			"contact.subtitle": "Vamos conversar sobre seu próximo projeto",
			"contact.cta": "Entre em contato",
			"contact.emailCopyTitle": "Clique para copiar o e-mail",
			"contact.emailCopied": "E-mail copiado: {email}",

			"footer.rights": "Todos os direitos reservados",
			"footer.repository": "Veja também o repositório desse projeto",
			"mobile.repo.before": "Veja também o",
			"mobile.repo.link": "repositório",
			"mobile.repo.after": "desse projeto",
		},

		en: {
			"nav.home": "Home",
			"nav.about": "About",
			"nav.projects": "Projects",
			"nav.experience": "Experience",
			"nav.education": "Education",
			"nav.skills": "Technologies",
			"nav.contact": "Contact",

			"language.english": "English",
			"language.portuguese": "Portuguese",

			"hero.greeting": "Hello, I am",
			"hero.name": "Matheus Machado",
			"hero.title": "Full Stack Developer",
			"hero.subtitle": "Specialist in web development, automation, and data scraping. I transform ideas into efficient digital solutions.",
			"hero.cta.contact": "Get in touch",
			"hero.cta.cv": "Download CV",

			"about.title": "About Me",
			"about.subtitle": "Learn about my professional journey",
			"about.description": "Full Stack Developer with 3+ years of experience in technology (since 2022), working across Front-end (React/JS) and Back-end/Data (Python/SQL) — with a strong focus on automation, web scraping, and building internal tools that speed up operations and reduce manual work.\n\nI started my journey in 2022 as an IT Apprentice at Totale Tecnologia, where I had my first exposure to the corporate environment and learned, in practice, the importance of being proactive, collaborative, and always willing to learn.\nIn 2024, I joined RidolfInvest as a development intern, diving into Python, SQL, scraping, and automation. In December/2024, I was promoted to Junior Developer, taking end-to-end responsibility: front-end, back-end, database, and integrations.",

			"about.video": "Presentation video",

			"skills.title": "Technologies",
			"skills.subtitle": "Tools and languages I master",
			"skills.frontend": "Frontend",
			"skills.backend": "Backend & Data",
			"skills.tools": "Tools",
			"skills.automation": "Automation",

			"projects.title": "Projects",
			"projects.subtitle": "Personal and professional projects",
			"projects.lead": "Here you can find all the projects I\u2019ve worked on, both personal and professional.",
			"projects.seeMore": "See more",
			"projects.technologies": "Technologies",
			"projects.description": "Description",
			"projects.backToProjects": "Back to projects",
			"projects.desktop": "Desktop",
			"projects.mobile": "Mobile",
			"projects.stacksTools": "STACKS & TOOLS:",
			"projects.type.personal": "Personal",
			"projects.type.freelance": "Freelance",
			"projects.type.professional": "Professional",

			"experience.title": "Professional Experience",
			"experience.subtitle": "My journey in the job market",
			"experience.showDetails": "Show details",
			"experience.hideDetails": "Hide details",
			"experience.technologies": "Technologies learned",
			"experience.present": "Present",
			"experience.companyLinkTitle": "Click to be taken to the company page",

			"education.title": "Education",
			"education.subtitle": "Academic background and specializations",
			"education.academic": "Academic Background",
			"education.courses": "Courses & Certificates",
			"education.fiap.name": "FIAP",
			"education.fiap.degree": "Technology Degree in Systems Analysis and Development",
			"education.fiap.description": "Hands-on program with projects in Web, Databases, REST APIs, ORM (JPA/Hibernate), BI (Power BI), NoSQL (MongoDB), Cloud (Azure/AWS) and Mobile.",
			"education.fiap.status": "Completed",
			"education.fiap.period": "2022 - 2024",
			"education.usp.name": "USP/ESALQ",
			"education.usp.degree": "MBA in Software Engineering",
			"education.usp.description": "Postgraduate (online) program focused on Software Engineering foundations and practices, covering architecture, quality, DevOps, agile methods, and modern applications.",
			"education.usp.status": "In progress",
			"education.usp.period": "Nov/2025 - Present",
			"education.filter.all": "All",
			"education.filter.frontend": "Front-end",
			"education.filter.backend": "Back-end",
			"education.filter.design": "Design",
			"education.filter.sql": "SQL",
			"education.filter.others": "Others",
			"education.download": "Download certificate",
			"education.downloadAll": "Download pack",

			"contact.title": "Contact",
			"contact.subtitle": "Let's talk about your next project",
			"contact.cta": "Get in touch",
			"contact.emailCopyTitle": "Click to copy the email",
			"contact.emailCopied": "Email copied: {email}",

			"footer.rights": "All rights reserved",
			"footer.repository": "See the repository of this project",
			"mobile.repo.before": "Also check the",
			"mobile.repo.link": "repository",
			"mobile.repo.after": "for this project",
		},
	};

	let currentLanguage = "pt";

	try {
		const savedLang = localStorage.getItem("mm_portfolio_lang");
		if (savedLang === "en" || savedLang === "pt") currentLanguage = savedLang;
	} catch (e) {}

	function t(key) {
		return (translations[currentLanguage] && translations[currentLanguage][key]) || key;
	}

	function formatAboutDescription(text) {
		if (!text) return "";

		const expToken = currentLanguage === "pt" ? "3+ anos" : "3+ years";
		const roleToken = currentLanguage === "pt" ? "Desenvolvedor Full Stack" : "Full Stack Developer";
		let out = text;

		out = out.replace(roleToken, `<strong class="about-strong about-strong--role">${roleToken}</strong>`);
		out = out.replace(expToken, `<strong class="about-strong">${expToken}</strong>`);
		out = out.replace(/React\/JS/g, '<strong class="about-strong">React/JS</strong>');
		out = out.replace(/Python\/SQL/g, '<strong class="about-strong">Python/SQL</strong>');

		return out;
	}

	function applyTranslations() {
		document.documentElement.lang = currentLanguage;

		document.querySelectorAll("[data-i18n]").forEach((el) => {
			const key = el.getAttribute("data-i18n");
			if (key === "about.description") {
				el.innerHTML = formatAboutDescription(t(key));
				return;
			}

			el.textContent = t(key);
		});

		const repoLabel = document.getElementById("footer-repo-label");
		if (repoLabel) repoLabel.textContent = t("footer.repository") + ":";

		const langBtn = document.getElementById("language-button");
		const mobileLangBtn = document.getElementById("mobile-lang-button");
		if (langBtn) langBtn.textContent = currentLanguage.toUpperCase();
		if (mobileLangBtn) mobileLangBtn.textContent = currentLanguage.toUpperCase();

		const optEn = document.getElementById("lang-en");
		const optPt = document.getElementById("lang-pt");
		if (optEn) optEn.classList.toggle("active", currentLanguage === "en");
		if (optPt) optPt.classList.toggle("active", currentLanguage === "pt");

		const expLead = document.getElementById("experience-lead");
		if (expLead) {
			expLead.textContent =
				currentLanguage === "pt"
					? "Atuação em tecnologia desde 2022, evoluindo de suporte/infra para desenvolvimento full stack e automações em produção."
					: "Working in tech since 2022, evolving from IT support/infra to full stack development and production-grade automations.";
		}

		const eduLead = document.getElementById("education-lead");
		if (eduLead) {
			eduLead.textContent = currentLanguage === "pt" ? "Formação acadêmica e especializações que sustentam minha base técnica e visão de engenharia de software." : "Academic background and specializations that support my technical foundation and software engineering mindset.";
		}

		const emailBtn = document.getElementById("contact-email-btn");
		if (emailBtn) {
			emailBtn.title = t("contact.emailCopyTitle");
			emailBtn.setAttribute("aria-label", currentLanguage === "pt" ? "Copiar e-mail" : "Copy email");
		}

		const emailCta = document.getElementById("contact-copy-email");
		if (emailCta) emailCta.title = t("contact.emailCopyTitle");
	}


	function setLanguage(lang) {
		currentLanguage = lang === "en" ? "en" : "pt";

		try {
			localStorage.setItem("mm_portfolio_lang", currentLanguage);
		} catch (e) {}

		applyTranslations();
		renderProjects();
		renderExperiences();
		renderCertificates();
		updateEducationTabIndicator();
	}

	const revealObserver = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add("in-view");
					revealObserver.unobserve(entry.target);
				}
			});
		},
		{
			threshold: 0.15,
			rootMargin: "-100px 0px",
		}
	);

	function observeReveals(root) {
		const scope = root || document;
		scope.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));
	}

	function initCodeBackground() {
		const canvas = document.getElementById("code-bg");
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const DPR = window.devicePixelRatio || 1;

		function resize() {
			canvas.width = Math.floor(window.innerWidth * DPR);
			canvas.height = Math.floor(window.innerHeight * DPR);
			canvas.style.width = window.innerWidth + "px";
			canvas.style.height = window.innerHeight + "px";
			ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
		}

		resize();
		window.addEventListener("resize", resize);

		const stars = [];
		const numStars = 150;
		for (let i = 0; i < numStars; i++) {
			stars.push({
				x: Math.random() * window.innerWidth,
				y: Math.random() * window.innerHeight,
				size: Math.random() * 2 + 0.5,
				opacity: Math.random() * 0.5 + 0.2,
				speed: Math.random() * 0.02 + 0.01,
				twinkleSpeed: Math.random() * 0.02 + 0.01,
				twinklePhase: Math.random() * Math.PI * 2,
			});
		}

		const snippetTexts = ["const", "function", "() =>", "return", "async", "await", "</>", "{ }", "[ ]", "import", "export", "class", "if", "else", "for", "while", "===", "=>"];

		const codeSnippets = [];
		for (let i = 0; i < 20; i++) {
			codeSnippets.push({
				text: snippetTexts[Math.floor(Math.random() * snippetTexts.length)],
				x: Math.random() * window.innerWidth,
				y: Math.random() * window.innerHeight,
				opacity: Math.random() * 0.15 + 0.05,
				speed: Math.random() * 0.3 + 0.1,
				size: Math.random() * 4 + 10,
			});
		}

		let time = 0;
		let raf = 0;

		function draw() {
			time += 0.016;

			ctx.fillStyle = "hsl(210, 20%, 6%)";
			ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

			stars.forEach((star) => {
				const twinkle = Math.sin(time * star.twinkleSpeed * 10 + star.twinklePhase) * 0.3 + 0.7;

				ctx.beginPath();
				ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
				ctx.fillStyle = `rgba(150, 200, 180, ${star.opacity * twinkle})`;
				ctx.fill();

				if (star.size > 1.5) {
					ctx.beginPath();
					ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
					ctx.fillStyle = `rgba(0, 230, 150, ${star.opacity * twinkle * 0.1})`;
					ctx.fill();
				}
			});

			codeSnippets.forEach((snippet) => {
				ctx.fillStyle = `rgba(0, 230, 150, ${snippet.opacity})`;
				ctx.font = `${snippet.size}px JetBrains Mono, monospace`;
				ctx.fillText(snippet.text, snippet.x, snippet.y);

				snippet.y -= snippet.speed;
				if (snippet.y < -20) {
					snippet.y = window.innerHeight + 20;
					snippet.x = Math.random() * window.innerWidth;
					snippet.text = snippetTexts[Math.floor(Math.random() * snippetTexts.length)];
				}
			});

			raf = requestAnimationFrame(draw);
		}

		draw();

		window.__stopCodeBg = function () {
			cancelAnimationFrame(raf);
			window.removeEventListener("resize", resize);
		};
	}

	const terminalLines = ["> Initializing system...", "> Loading Matheus Machado...", "> Full Stack Developer detected", "> Welcome to the portfolio"];

	function startIntro() {
		const linesWrap = document.getElementById("intro-lines");
		const cursorRow = document.getElementById("intro-cursor");
		const selectWrap = document.getElementById("intro-select");
		const btnPt = document.getElementById("intro-pt");
		const btnEn = document.getElementById("intro-en");

		if (!linesWrap || !cursorRow || !selectWrap || !btnPt || !btnEn) return;

		let idx = 0;

		function addLine() {
			if (idx < terminalLines.length) {
				const lineEl = document.createElement("div");
				lineEl.className = "intro-line";
				lineEl.textContent = terminalLines[idx];
				linesWrap.appendChild(lineEl);
				idx += 1;
				setTimeout(addLine, 600);
				return;
			}

			setTimeout(() => {
				linesWrap.querySelectorAll(".intro-line").forEach((l) => l.classList.add("dim"));
				cursorRow.classList.add("hidden");
				selectWrap.classList.remove("hidden");
			}, 500);
		}

		addLine();

		btnPt.addEventListener("click", () => finishIntro("pt"));
		btnEn.addEventListener("click", () => finishIntro("en"));
	}

	function finishIntro(lang, instant) {
		setLanguage(lang);

		const intro = document.getElementById("intro-overlay");
		const site = document.getElementById("site");
		if (!intro || !site) return;

		if (instant) {
			intro.classList.add("hidden");
			site.classList.remove("hidden");

			injectIcons(document);

			renderProjects();
			renderExperiences();
			renderCertificates();
			updateEducationTabIndicator();

			observeReveals(document);

			startHeroTyping();
			return;
		}

		intro.classList.add("fade-out");
		setTimeout(() => {
			intro.classList.add("hidden");
			site.classList.remove("hidden");

			injectIcons(document);

			renderProjects();
			renderExperiences();
			renderCertificates();
			updateEducationTabIndicator();

			observeReveals(document);

			startHeroTyping();
		}, 500);
	}

	function initNavbar() {
		const langBtn = document.getElementById("language-button");
		const modal = document.getElementById("language-modal");
		const backdrop = document.getElementById("language-backdrop");
		const closeBtn = document.getElementById("language-close");
		const optEn = document.getElementById("lang-en");
		const optPt = document.getElementById("lang-pt");

		const mobileMenuBtn = document.getElementById("mobile-menu-button");
		const mobileMenu = document.getElementById("mobile-menu");
		const mobileMenuClose = document.getElementById("mobile-menu-close");
		const mobileBackdrop = mobileMenu ? mobileMenu.querySelector(".mobile-menu-backdrop") : null;
		const mobileLangBtn = document.getElementById("mobile-lang-button");

		if (!langBtn || !modal || !backdrop || !closeBtn || !optEn || !optPt) return;

		function openLangModal() {
			const rect = langBtn.getBoundingClientRect();
			const margin = 10;
			const desiredTop = rect.bottom + 10;
			const desiredLeft = rect.left;

			modal.style.visibility = "hidden";
			modal.classList.remove("hidden");
			backdrop.classList.remove("hidden");

			const modalRect = modal.getBoundingClientRect();
			const maxLeft = window.innerWidth - modalRect.width - margin;
			const maxTop = window.innerHeight - modalRect.height - margin;

			const left = Math.max(margin, Math.min(desiredLeft, maxLeft));
			const top = Math.max(margin, Math.min(desiredTop, maxTop));

			modal.style.left = left + "px";
			modal.style.top = top + "px";
			modal.style.right = "auto";

			modal.style.visibility = "visible";
			langBtn.setAttribute("aria-expanded", "true");
		}

		function closeLangModal() {
			modal.classList.add("hidden");
			backdrop.classList.add("hidden");
			modal.style.visibility = "visible";
			langBtn.setAttribute("aria-expanded", "false");
		}

		langBtn.addEventListener("click", () => {
			const isOpen = !modal.classList.contains("hidden");
			if (isOpen) closeLangModal();
			else openLangModal();
		});

		closeBtn.addEventListener("click", closeLangModal);
		backdrop.addEventListener("click", closeLangModal);

		optEn.addEventListener("click", () => {
			setLanguage("en");
			closeLangModal();
		});

		optPt.addEventListener("click", () => {
			setLanguage("pt");
			closeLangModal();
		});

		if (mobileMenuBtn && mobileMenu && mobileMenuClose) {
			const iconSpan = mobileMenuBtn.querySelector("[data-icon]");
			let mobileMenuAnimating = false;

			function applyMobileMenuStagger() {
				const items = [];
				const logo = mobileMenu.querySelector(".mobile-logo");
				if (logo) items.push(logo);
				mobileMenu.querySelectorAll(".mobile-nav-link").forEach((a) => items.push(a));
				if (mobileLangBtn) items.push(mobileLangBtn);
				const social = mobileMenu.querySelector(".mobile-social");
				if (social) items.push(social);
				const repo = mobileMenu.querySelector(".mobile-repo");
				if (repo) items.push(repo);

				items.forEach((el, i) => {
					el.style.setProperty("--d", `${90 + i * 55}ms`);
				});
			}

			function openMobileMenu() {
				if (mobileMenuAnimating) return;
				mobileMenuAnimating = true;
				mobileMenu.classList.remove("hidden");
				applyMobileMenuStagger();
				
				requestAnimationFrame(() => {
					mobileMenu.classList.add("is-open");
					document.body.classList.add("no-scroll");
				});

				setTimeout(() => {
					mobileMenuAnimating = false;
				}, 420);
				if (iconSpan) {
					iconSpan.setAttribute("data-icon", "x");
					injectIcons(iconSpan);
				}
			}

			function closeMobileMenu() {
				if (mobileMenuAnimating) return;
				mobileMenuAnimating = true;
				mobileMenu.classList.remove("is-open");
				document.body.classList.remove("no-scroll");

				setTimeout(() => {
					mobileMenu.classList.add("hidden");
					mobileMenuAnimating = false;
				}, 340);
				if (iconSpan) {
					iconSpan.setAttribute("data-icon", "menu");
					injectIcons(iconSpan);
				}
			}

			mobileMenuBtn.addEventListener("click", () => {
				const isOpen = mobileMenu.classList.contains("is-open");
				if (isOpen) closeMobileMenu();
				else openMobileMenu();
			});

			mobileMenuClose.addEventListener("click", closeMobileMenu);
			if (mobileBackdrop) mobileBackdrop.addEventListener("click", closeMobileMenu);

			mobileMenu.querySelectorAll("a[href^='#']").forEach((a) => {
				a.addEventListener("click", () => closeMobileMenu());
			});

			if (mobileLangBtn) {
				mobileLangBtn.addEventListener("click", () => {
					closeMobileMenu();
					openLangModal();
				});
			}

			document.addEventListener("keydown", (e) => {
				if (e.key === "Escape") {
					closeLangModal();
					closeMobileMenu();
					closeProjectDetail();
					closeCertModal();
				}
			});
		} else {
			document.addEventListener("keydown", (e) => {
				if (e.key === "Escape") {
					closeLangModal();
					closeProjectDetail();
					closeCertModal();
				}
			});
		}

		window.addEventListener("resize", () => {
			if (!modal.classList.contains("hidden")) openLangModal();
			updateEducationTabIndicator();

			const coursesPanel = document.getElementById("education-courses");
			if (coursesPanel && !coursesPanel.classList.contains("hidden")) renderCertificates();
		});
	}

	function startHeroTyping() {
		const target = document.getElementById("hero-typing-text");
		if (!target) return;

		const titles = ["Full Stack Developer", "Freelancer"];
		let currentTitleIndex = 0;
		let displayText = "";
		let isDeleting = false;

		function tick() {
			const currentTitle = titles[currentTitleIndex];
			const typingSpeed = isDeleting ? 50 : 100;
			const pauseTime = 2000;

			if (!isDeleting && displayText === currentTitle) {
				setTimeout(() => {
					isDeleting = true;
					tick();
				}, pauseTime);
				return;
			}

			if (isDeleting && displayText === "") {
				isDeleting = false;
				currentTitleIndex = (currentTitleIndex + 1) % titles.length;
				tick();
				return;
			}

			setTimeout(() => {
				if (isDeleting) {
					displayText = currentTitle.substring(0, displayText.length - 1);
				} else {
					displayText = currentTitle.substring(0, displayText.length + 1);
				}
				target.textContent = displayText;
				tick();
			}, typingSpeed);
		}

		tick();
	}

	function projectCover(p) {
		if (p.coverImage) return p.coverImage;

		const desk = Array.isArray(p.desktopImages) ? p.desktopImages : [];
		const mob = Array.isArray(p.mobileImages) ? p.mobileImages : [];
		const legacy = Array.isArray(p.images) ? p.images : [];

		return desk[0] || mob[0] || legacy[0] || "assets/img/placeholder.svg";
	}

	function normalizeProjectImages(p) {
		const desktopImages = Array.isArray(p.desktopImages) ? p.desktopImages : [];
		const mobileImages = Array.isArray(p.mobileImages) ? p.mobileImages : [];

		const legacy = Array.isArray(p.images) ? p.images : [];

		const outDesktop = desktopImages.length ? desktopImages.slice() : legacy.slice();
		const outMobile = mobileImages.length ? mobileImages.slice() : [];

		return { desktop: outDesktop, mobile: outMobile };
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
		vuejs: { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vuejs/vuejs-original.svg" },
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

	let projects = [];
	let projectsLoaded = false;
	let projectsLoadPromise = null;

	function loadProjects() {
		if (projectsLoadPromise) return projectsLoadPromise;

		projectsLoadPromise = fetch("scripts/projetos.json", { cache: "no-store" })
			.then((res) => res.json())
			.then((data) => {
				const arr = Array.isArray(data) ? data : data && Array.isArray(data.projects) ? data.projects : [];
				projects = Array.isArray(arr) ? arr : [];
				projectsLoaded = true;
				return projects;
			})
			.catch((err) => {
				console.warn("[projects] failed to load scripts/projetos.json", err);
				projects = [];
				projectsLoaded = true;
				return projects;
			});

		return projectsLoadPromise;
	}

	function projectField(project, key) {
		if (!project || !key) return "";
		const primary = currentLanguage === "en" ? `${key}_en` : key;
		const fallback = currentLanguage === "en" ? key : `${key}_en`;
		return project[primary] || project[fallback] || "";
	}

	let projectsIndex = 0;

	function getVisibleProjects() {
		if (!projects.length) return [];
		const visible = [];
		for (let i = 0; i < 4; i++) {
			const idx = (projectsIndex + i) % projects.length;
			visible.push(projects[idx]);
		}
		return visible;
	}

	function renderProjects() {
		const grid = document.getElementById("projects-grid");
		const bar = document.getElementById("projects-progress-bar");
		const prevBtn = document.getElementById("projects-prev");
		const nextBtn = document.getElementById("projects-next");

		if (!grid || !bar || !prevBtn || !nextBtn) return;

		if (!projectsLoaded) {
			loadProjects().then(() => renderProjects());
			return;
		}

		function render() {
			grid.innerHTML = "";

			const isMobileCards = window.matchMedia && window.matchMedia("(max-width: 767px)").matches;

			if (!projects.length) {
				bar.style.width = "0%";
				return;
			}

			getVisibleProjects().forEach((p) => {
				const title = projectField(p, "title") || p.title || "";
				const company = projectField(p, "company") || p.company || "";
				const description = projectField(p, "description") || p.description || "";

				const detailHref = `projeto-detalhe.html?id=${encodeURIComponent(p.id)}`;

				const card = document.createElement(isMobileCards ? "a" : "div");
				card.className = "project-card";

				if (isMobileCards) {
					card.href = detailHref;
					card.setAttribute("aria-label", `Open project details: ${title}`);
					card.addEventListener("click", () => {
						try {
							sessionStorage.setItem("mm_skip_intro_once", "1");
						} catch (e) {}
					});
				}

				const liveBtn =
					p.liveUrl && p.liveUrl !== "#"
						? `
							<a href="${p.liveUrl}" target="_blank" rel="noopener noreferrer" aria-label="Open live project">
								<span class="icon" data-icon="externalLink"></span>
							</a>
						`
						: "";

				card.innerHTML = isMobileCards
					? `
						<div class="project-media" style="background: ${p.gradient}">
							<img src="${projectCover(p)}" alt="${escapeHtml(title)}" />
						</div>
						<div class="project-body">
							<h3 class="project-title">${escapeHtml(title)}</h3>
							<p class="project-company">${escapeHtml(company)}</p>
							<p class="project-desc line-clamp-2">${escapeHtml(description)}</p>
							<div class="project-tech">
								${(p.technologies || [])
									.slice(0, 3)
									.map((tech) => `<span class="tech-pill">${escapeHtml(tech)}</span>`)
									.join("")}
							</div>
						</div>
					`
					: `
						<div class="project-media" style="background: ${p.gradient}">
							<img src="${projectCover(p)}" alt="${escapeHtml(title)}" />
							<div class="project-overlay">
								${liveBtn}
								<a href="${detailHref}" data-project-detail="1" aria-label="View details">
									<span class="icon" data-icon="eye"></span>
								</a>
							</div>
						</div>
						<div class="project-body">
							<h3 class="project-title">${escapeHtml(title)}</h3>
							<p class="project-company">${escapeHtml(company)}</p>
							<p class="project-desc line-clamp-2">${escapeHtml(description)}</p>
							<div class="project-tech">
								${(p.technologies || [])
									.slice(0, 3)
									.map((tech) => `<span class="tech-pill">${escapeHtml(tech)}</span>`)
									.join("")}
							</div>
						</div>
					`;

				grid.appendChild(card);
			});

			injectIcons(grid);

			grid.querySelectorAll('[data-project-detail="1"]').forEach((link) => {
				if (link.dataset.bound) return;
				link.dataset.bound = "1";
				link.addEventListener("click", () => {
					try {
						sessionStorage.setItem("mm_skip_intro_once", "1");
					} catch (e) {}
				});
			});


			bar.style.width = `${((projectsIndex + 1) / projects.length) * 100}%`;
		}

		if (!prevBtn.dataset.bound) {
			prevBtn.dataset.bound = "1";
			prevBtn.addEventListener("click", () => {
				projectsIndex = (projectsIndex - 1 + projects.length) % projects.length;
				render();
			});
		}

		if (!nextBtn.dataset.bound) {
			nextBtn.dataset.bound = "1";
			nextBtn.addEventListener("click", () => {
				projectsIndex = (projectsIndex + 1) % projects.length;
				render();
			});
		}

		render();
	}

	const pd = {
		overlay: null,
		close: null,
		content: null,
		panelScroll: null,
		title: null,
		company: null,
		type: null,
		tags: null,
		desc: null,
		tech: null,
		live: null,
		git: null,
		actions: null,
		desktopSection: null,
		mobileSection: null,
		desktopMain: null,
		desktopThumbs: null,
		mobileStrip: null,
		project: null,
	};

	function cacheProjectDetailEls() {
		pd.overlay = document.getElementById("project-detail");
		pd.close = document.getElementById("project-detail-close");
		pd.content = pd.overlay ? pd.overlay.querySelector(".pd2-content") : null;
		pd.panelScroll = pd.overlay ? pd.overlay.querySelector(".pd2-panel-scroll") : null;
		pd.title = document.getElementById("pd-title");
		pd.company = document.getElementById("pd-company");
		pd.type = document.getElementById("pd-type");
		pd.tags = document.getElementById("pd-tags");
		pd.desc = document.getElementById("pd-description");
		pd.tech = document.getElementById("pd-tech");
		pd.live = document.getElementById("pd-live");
		pd.git = document.getElementById("pd-git");
		pd.actions = pd.overlay ? pd.overlay.querySelector(".pd2-panel-actions") : null;
		pd.desktopSection = document.getElementById("pd-desktop-section");
		pd.mobileSection = document.getElementById("pd-mobile-section");
		pd.desktopMain = document.getElementById("pd-desktop-main");
		pd.desktopThumbs = document.getElementById("pd-desktop-thumbs");
		pd.mobileStrip = document.getElementById("pd-mobile-strip");

		if (pd.close) pd.close.addEventListener("click", closeProjectDetail);
	}

	function openProjectDetail(project) {
		if (!pd.overlay) cacheProjectDetailEls();
		if (
			!pd.overlay ||
			!pd.title ||
			!pd.company ||
			!pd.type ||
			!pd.tags ||
			!pd.desc ||
			!pd.tech ||
			!pd.live ||
			!pd.git ||
			!pd.desktopSection ||
			!pd.mobileSection ||
			!pd.desktopMain ||
			!pd.desktopThumbs ||
			!pd.mobileStrip
		)
			return;

		pd.project = project;

		pd.title.textContent = project.title;
		pd.company.textContent = project.company || "";

		const typeLabel = workTypeLabel(project.workType);
		pd.type.textContent = typeLabel || "";

		pd.tags.innerHTML = (project.technologies || [])
			.slice(0, 4)
			.map((tech) => `<span class="pd2-tag">${tech}</span>`)
			.join("");

		pd.desc.textContent = project.fullDescription || project.description || "";

		const techList = Array.isArray(project.technologies) ? project.technologies : [];
		const maxTechIcons = 8;
		const visibleTechs = techList.slice(0, maxTechIcons);
		const extraTechCount = techList.length - visibleTechs.length;

		pd.tech.innerHTML =
			visibleTechs
				.map((tech) => {
					const raw = String(tech || "");
					const label = escapeHtml(raw);
					const mark = raw
						.trim()
						.replace(/[^a-zA-Z0-9]+/g, " ")
						.split(" ")
						.filter(Boolean)[0]
						.slice(0, 2)
						.toUpperCase();

					const meta = techIconMeta(raw);
					if (meta && meta.src) {
						const invertClass = meta.invert ? " is-invert" : "";
						return `
							<span class="pd2-stack-icon${invertClass}" role="img" aria-label="${label}" title="${label}">
								<img src="${meta.src}" alt="${label}" loading="lazy" decoding="async" data-fallback="${escapeHtml(mark || "#")}" />
							</span>
						`;
					}

					return `
						<span class="pd2-stack-icon" role="img" aria-label="${label}" title="${label}">
							<span class="pd2-stack-mark" aria-hidden="true">${escapeHtml(mark || "#")}</span>
						</span>
					`;
				})
				.join("") +
			(extraTechCount > 0
				? `
					<span class="pd2-stack-icon pd2-stack-more" role="img" aria-label="+${extraTechCount}" title="+${extraTechCount}">
						<span class="pd2-stack-mark" aria-hidden="true">+${extraTechCount}</span>
					</span>
				`
				: "");

		// Fallback: if a CDN icon fails to load, replace it with initials so the UI never breaks.
		pd.tech.querySelectorAll("img[data-fallback]").forEach((img) => {
			img.addEventListener(
				"error",
				() => {
					const fallback = img.getAttribute("data-fallback") || "";
					const holder = img.closest(".pd2-stack-icon");
					if (!holder) return;
					holder.innerHTML = `<span class="pd2-stack-mark" aria-hidden="true">${fallback || "#"}</span>`;
				},
				{ once: true }
			);
		});

		// Live project button (optional)
		const liveUrl =
			project.liveUrl ||
			project.live ||
			project.deployUrl ||
			project.siteUrl ||
			project.demoUrl ||
			project.url ||
			"";

		const hasLive = Boolean(liveUrl && liveUrl !== "#");
		if (hasLive) {
			pd.live.href = liveUrl;
			pd.live.classList.remove("hidden");
		} else {
			pd.live.href = "#";
			pd.live.classList.add("hidden");
		}

		// Git repository button (always expected, but still safe if missing)
		const repoUrl =
			project.repoUrl ||
			project.githubUrl ||
			project.github ||
			project.repositoryUrl ||
			project.repository ||
			project.gitUrl ||
			project.git ||
			project.repo ||
			"";

		const hasRepo = Boolean(repoUrl && repoUrl !== "#");
		if (hasRepo) {
			pd.git.href = repoUrl;
			pd.git.removeAttribute("aria-disabled");
			pd.git.classList.remove("is-disabled");
		} else {
			pd.git.href = "#";
			pd.git.setAttribute("aria-disabled", "true");
			pd.git.classList.add("is-disabled");
		}

		// Layout variation: if both buttons are available, show side-by-side
		if (pd.actions) {
			pd.actions.classList.toggle("has-two", hasLive && hasRepo);
		}

		const imgs = normalizeProjectImages(project);

		pd.desktopThumbs.innerHTML = "";
		pd.mobileStrip.innerHTML = "";

		if (imgs.desktop.length) {
			pd.desktopSection.classList.remove("hidden");
			pd.desktopMain.src = imgs.desktop[0];
			pd.desktopMain.alt = `${project.title} desktop 1`;

			if (imgs.desktop.length > 1) {
				pd.desktopThumbs.innerHTML = imgs.desktop
					.map((src, idx) => {
						const active = idx === 0 ? "active" : "";
						return `
							<button type="button" class="pd2-thumb ${active}" data-pd-desktop="${idx}" aria-label="${project.title} desktop ${idx + 1}">
								<img src="${src}" alt="" loading="lazy" />
							</button>
						`;
					})
					.join("");

				pd.desktopThumbs.querySelectorAll("[data-pd-desktop]").forEach((btn) => {
					btn.addEventListener("click", () => {
						const idx = parseInt(btn.getAttribute("data-pd-desktop"), 10);
						if (!Number.isFinite(idx) || !imgs.desktop[idx]) return;
						pd.desktopMain.src = imgs.desktop[idx];
						pd.desktopMain.alt = `${project.title} desktop ${idx + 1}`;

						pd.desktopThumbs.querySelectorAll(".pd2-thumb").forEach((b) => b.classList.remove("active"));
						btn.classList.add("active");
					});
				});
			}
		} else {
			pd.desktopSection.classList.add("hidden");
		}

		if (imgs.mobile.length) {
			pd.mobileStrip.innerHTML = imgs.mobile
				.map((src, idx) => {
					return `
						<figure class="pd2-device pd2-device--mobile">
							<img src="${src}" alt="${project.title} mobile ${idx + 1}" loading="lazy" />
						</figure>
					`;
				})
				.join("");
			pd.mobileSection.classList.remove("hidden");
		} else {
			pd.mobileSection.classList.add("hidden");
		}

		// Reset scroll positions (better UX when opening multiple projects)
		if (pd.content) pd.content.scrollTop = 0;
		if (pd.panelScroll) pd.panelScroll.scrollTop = 0;

		pd.overlay.classList.remove("hidden");
		document.body.classList.add("no-scroll");
		injectIcons(pd.overlay);
	}

	function closeProjectDetail() {
		if (!pd.overlay) return;
		pd.overlay.classList.add("hidden");
		document.body.classList.remove("no-scroll");
		pd.project = null;
	}

	function getExperiences() {
		return [
			{
				id: "1",
				logo: "assets/img/logo_ridolfinvest.png",
			companyUrl: "https://ridolfinvest.com.br/",
				company: "RidolfInvest",
				role: currentLanguage === "pt" ? "Desenvolvedor Full Stack Júnior" : "Junior Full Stack Developer",
				startDate: "12/2024",
				endDate: t("experience.present"),
				duration: currentLanguage === "pt" ? "Atual" : "Current",
				description:
					currentLanguage === "pt"
						? "Atuação full stack em aplicações internas (Front + Back + SQL), com foco em produtividade operacional, padronização e redução de etapas manuais.<br/>• Evolução de uma plataforma interna que começou com automação de certidões e se tornou uma central de ferramentas para áreas internas (incluindo autenticação, sessão e fluxos completos).<br/>• Implementação de automações e raspagens em sites e sistemas complexos, integrando banco/CRM e tratando inconsistências e cenários de “não achados”.<br/>• Desenvolvimento de ferramenta de formulários automatizados com login, 2FA e sessão por usuário, reduzindo o tempo do fluxo (~15 min → ~5 min).<br/>• Criação/evolução de robôs e integrações com TRFs/TJs, incluindo leitura de valores em imagem (OCR) e rotinas de manutenção (cookies/tokens)."
						: "Full stack work on internal applications (Front + Back + SQL), focused on operational productivity, standardization, and reducing manual steps.<br/>• Evolved an internal platform that started with certificate automation and became a centralized tools hub for internal teams (auth, sessions, end-to-end flows).<br/>• Built automations and scraping for complex websites/systems, integrating database/CRM and handling inconsistencies and “not found” scenarios.<br/>• Delivered an automated forms tool with login, 2FA and per-user sessions, reducing cycle time (~15 min → ~5 min).<br/>• Created/evolved bots and integrations with Brazilian courts (TRFs/TJs), including OCR-based value extraction and maintenance routines (cookies/tokens).",
				technologies: ["React", "JavaScript", "Tailwind", "Python", "Flask", "MySQL", "Web Scraping", "Git", "GitHub", "WordPress"],
			},
			{
				id: "2",
				logo: "assets/img/logo_ridolfinvest.png",
			companyUrl: "https://ridolfinvest.com.br/",
				company: "RidolfInvest",
				role: currentLanguage === "pt" ? "Estagiário de Desenvolvimento" : "Development Intern",
				startDate: "03/2024",
				endDate: "12/2024",
				duration: currentLanguage === "pt" ? "10 meses" : "10 months",
				description:
					currentLanguage === "pt"
						? "Entrada na empresa como estágio com foco em Python + SQL, aprendendo banco de dados e scraping na prática e aplicando rapidamente em entregas reais.<br/>• Desenvolvimento de automações operacionais e rotinas de integração (importações, consolidação e validação de dados) para reduzir retrabalho.<br/>• Apoio no desenvolvimento de soluções internas (formulários, certidões e ferramentas de apoio ao time), sempre com atenção a logs, erros e consistência."
						: "Joined as a development intern with a focus on Python + SQL, learning databases and scraping hands-on and shipping real deliveries quickly.<br/>• Built operational automations and integration routines (imports, consolidation and data validation) to reduce rework.<br/>• Supported internal solutions (forms, certificates, team tools), with attention to logs, error handling and consistency.",
				technologies: ["Python", "SQL", "JavaScript", "HTML", "CSS", "Web Scraping", "Git", "GitHub", "Bootstrap", "WordPress"],
			},
			{
				id: "3",
				logo: "assets/img/logo_totale.png",
			companyUrl: "https://totaletecnologia.com.br/",
				company: "Totale Tecnologia",
				role: currentLanguage === "pt" ? "Jovem Aprendiz de TI" : "IT Apprentice",
				startDate: "2022",
				endDate: "2024",
				duration: currentLanguage === "pt" ? "2 anos" : "2 years",
				description:
					currentLanguage === "pt"
						? "Primeira experiência profissional em TI, com atuação em suporte e rotina de infraestrutura.<br/>• Manutenção de hardware (diagnóstico, troca de componentes) e suporte a estações de trabalho.<br/>• Instalação e configuração de softwares, atualizações e padronização de ambientes.<br/>• Suporte básico a usuários, desenvolvendo comunicação, proatividade e colaboração no ambiente corporativo."
						: "First professional experience in IT, working with support and infrastructure routines.<br/>• Hardware maintenance (diagnostics, component replacement) and workstation support.<br/>• Software installation/configuration, updates, and environment standardization.<br/>• User support, developing communication, proactivity, and collaboration in a corporate environment.",
				technologies: ["Windows", "Hardware", "IT Support", "Networking", "Helpdesk"],
			},
		];
	}

	function renderExperiences() {
		const wrap = document.getElementById("experience-timeline");
		if (!wrap) return;

		const experiences = getExperiences();
		wrap.innerHTML = "";

		experiences.forEach((exp, index) => {
			const align = index % 2 === 0 ? "left" : "right";
			const item = document.createElement("div");
			item.className = `timeline-item ${align} reveal`;

			const summaryTech = exp.technologies.slice(0, 3);
			const extra = exp.technologies.length - summaryTech.length;

			item.innerHTML = `
				<div class="timeline-dot" aria-hidden="true"></div>

				<div class="timeline-date">
					<span class="mono">${exp.startDate} - ${exp.endDate}</span><br/>
					<span class="small">${exp.duration}</span>
				</div>

				<div class="card-dark timeline-card" data-exp-card="${exp.id}">
					<div class="logo-placeholder">
						${
							exp.logo
								? exp.companyUrl
								? `<a href="${exp.companyUrl}" target="_blank" rel="noopener noreferrer" title="${t("experience.companyLinkTitle")}">
											<img src="${exp.logo}" alt="Logo ${exp.company}" loading="lazy" />
										</a>`
									: `<img src="${exp.logo}" alt="Logo ${exp.company}" loading="lazy" />`
								: `<span>${exp.company.charAt(0)}</span>`
						}
					</div>

					<h3 style="margin:0; font-size:1.25rem; font-weight:900;">${exp.company}</h3>
					<p class="exp-role">${exp.role}</p>

					<div class="exp-mobile-date">${exp.startDate} - ${exp.endDate} (${exp.duration})</div>

					<div class="exp-tech-summary">
						${summaryTech.map((tech) => `<span class="tech-pill">${tech}</span>`).join("")}
						${extra > 0 ? `<span class="more-pill">+${extra}</span>` : ""}
					</div>

					<button type="button" class="exp-toggle" data-exp-toggle="${exp.id}">
						<span class="exp-toggle-text">${t("experience.showDetails")}</span>
						<span class="icon-inline" data-icon="chevronRight"></span>
					</button>

					<div class="exp-details">
						<div class="exp-details-inner">
							<p>${exp.description}</p>

							<div class="exp-tech-block">
								<h4>${t("experience.technologies")}</h4>
								<div class="exp-tech-all">
									${exp.technologies.map((tech) => `<span>${tech}</span>`).join("")}
								</div>
							</div>
						</div>
					</div>
				</div>
			`;

			wrap.appendChild(item);
		});

		injectIcons(wrap);
		observeReveals(wrap);

		wrap.querySelectorAll("[data-exp-toggle]").forEach((btn) => {
			btn.addEventListener("click", () => {
				const id = btn.getAttribute("data-exp-toggle");
				const card = wrap.querySelector(`[data-exp-card="${id}"]`);
				if (!card) return;

				const isExpanded = card.classList.toggle("expanded");

				const labelEl = btn.querySelector(".exp-toggle-text");
				const iconEl = btn.querySelector("[data-icon]");

				if (labelEl) labelEl.textContent = isExpanded ? t("experience.hideDetails") : t("experience.showDetails");
				if (iconEl) {
					iconEl.setAttribute("data-icon", isExpanded ? "chevronDown" : "chevronRight");
					injectIcons(iconEl);
				}
			});
		});
	}

	let eduTab = "academic";
	let certFilter = "all";
	let certPage = 1;

	const certificates = [
			{ id: "1", name: "Bootstrap 5 - novos recursos e práticas recomendadas de HTML, CSS e JavaScript", category: "frontend", image: "assets/certificados/previews/01-bootstrap-5-novos-recursos-e-praticas-recomendadas-de-html-css-e-javascript.jpg", pdfUrl: "assets/certificados/pdfs/01-bootstrap-5-novos-recursos-e-praticas-recomendadas-de-html-css-e-javascript.pdf" },
			{ id: "2", name: "Bootstrap5 - crie uma landing page responsiva", category: "frontend", image: "assets/certificados/previews/02-bootstrap5-crie-uma-landing-page-responsiva.jpg", pdfUrl: "assets/certificados/pdfs/02-bootstrap5-crie-uma-landing-page-responsiva.pdf" },
			{ id: "3", name: "Excel - domine o editor de planilhas", category: "others", image: "assets/certificados/previews/03-excel-domine-o-editor-de-planilhas.jpg", pdfUrl: "assets/certificados/pdfs/03-excel-domine-o-editor-de-planilhas.pdf" },
			{ id: "4", name: "Figma - componentes, auto layout e máscaras", category: "design", image: "assets/certificados/previews/04-figma-componentes-auto-layout-e-mascaras.jpg", pdfUrl: "assets/certificados/pdfs/04-figma-componentes-auto-layout-e-mascaras.pdf" },
			{ id: "5", name: "Figma - conhecendo a ferramenta", category: "design", image: "assets/certificados/previews/05-figma-conhecendo-a-ferramenta.jpg", pdfUrl: "assets/certificados/pdfs/05-figma-conhecendo-a-ferramenta.pdf" },
			{ id: "6", name: "Figma - conhecendo componentes da interface", category: "design", image: "assets/certificados/previews/06-figma-conhecendo-componentes-da-interface.jpg", pdfUrl: "assets/certificados/pdfs/06-figma-conhecendo-componentes-da-interface.pdf" },
			{ id: "7", name: "Figma - construindo o layout do seu site mobile", category: "design", image: "assets/certificados/previews/07-figma-construindo-o-layout-do-seu-site-mobile.jpg", pdfUrl: "assets/certificados/pdfs/07-figma-construindo-o-layout-do-seu-site-mobile.pdf" },
			{ id: "8", name: "Funções com Excel - operações matemáticas e filtros", category: "others", image: "assets/certificados/previews/08-funcoes-com-excel-operacoes-matematicas-e-filtros.jpg", pdfUrl: "assets/certificados/pdfs/08-funcoes-com-excel-operacoes-matematicas-e-filtros.pdf" },
			{ id: "9", name: "Git e GitHub - compartilhando e colaborando em projetos", category: "others", image: "assets/certificados/previews/09-git-e-github-compartilhando-e-colaborando-em-projetos.jpg", pdfUrl: "assets/certificados/pdfs/09-git-e-github-compartilhando-e-colaborando-em-projetos.pdf" },
			{ id: "10", name: "HTML e CS - responsividade com mobile-first", category: "frontend", image: "assets/certificados/previews/10-html-e-cs-responsividade-com-mobile-first.jpg", pdfUrl: "assets/certificados/pdfs/10-html-e-cs-responsividade-com-mobile-first.pdf" },
			{ id: "11", name: "HTML e CSS - ambientes de desenvolvimento, estrutura de arquivos e tags", category: "frontend", image: "assets/certificados/previews/11-html-e-css-ambientes-de-desenvolvimento-estrutura-de-arquivos-e-tags.jpg", pdfUrl: "assets/certificados/pdfs/11-html-e-css-ambientes-de-desenvolvimento-estrutura-de-arquivos-e-tags.pdf" },
			{ id: "12", name: "HTML e CSS - cabeçalho, footer e variáveis CSS", category: "frontend", image: "assets/certificados/previews/12-html-e-css-cabecalho-footer-e-variaveis-css.jpg", pdfUrl: "assets/certificados/pdfs/12-html-e-css-cabecalho-footer-e-variaveis-css.pdf" },
			{ id: "13", name: "HTML e CSS - Classes, posicionamento e Flexbox", category: "frontend", image: "assets/certificados/previews/13-html-e-css-classes-posicionamento-e-flexbox.jpg", pdfUrl: "assets/certificados/pdfs/13-html-e-css-classes-posicionamento-e-flexbox.pdf" },
			{ id: "14", name: "HTML e CSS - praticando HTML-CSS", category: "frontend", image: "assets/certificados/previews/14-html-e-css-praticando-html-css.jpg", pdfUrl: "assets/certificados/pdfs/14-html-e-css-praticando-html-css.pdf" },
			{ id: "15", name: "HTML e CSS - trabalhando com responsividade e publicação de projetos", category: "frontend", image: "assets/certificados/previews/15-html-e-css-trabalhando-com-responsividade-e-publicacao-de-projetos.jpg", pdfUrl: "assets/certificados/pdfs/15-html-e-css-trabalhando-com-responsividade-e-publicacao-de-projetos.pdf" },
			{ id: "16", name: "JavaScript - explorando a linguagem", category: "frontend", image: "assets/certificados/previews/16-javascript-explorando-a-linguagem.jpg", pdfUrl: "assets/certificados/pdfs/16-javascript-explorando-a-linguagem.pdf" },
			{ id: "17", name: "JavaScript - manipulando elementos no DOM", category: "frontend", image: "assets/certificados/previews/17-javascript-manipulando-elementos-no-dom.jpg", pdfUrl: "assets/certificados/pdfs/17-javascript-manipulando-elementos-no-dom.pdf" },
			{ id: "18", name: "JavaScript - validando formulários", category: "frontend", image: "assets/certificados/previews/18-javascript-validando-formularios.jpg", pdfUrl: "assets/certificados/pdfs/18-javascript-validando-formularios.pdf" },
			{ id: "19", name: "JavaScript para Web - Crie páginas dinâmicas", category: "frontend", image: "assets/certificados/previews/19-javascript-para-web-crie-paginas-dinamicas.jpg", pdfUrl: "assets/certificados/pdfs/19-javascript-para-web-crie-paginas-dinamicas.pdf" },
			{ id: "20", name: "Pensamento computacional - fundamentos da computação e lógica de programação", category: "others", image: "assets/certificados/previews/20-pensamento-computacional-fundamentos-da-computacao-e-logica-de-programacao.jpg", pdfUrl: "assets/certificados/pdfs/20-pensamento-computacional-fundamentos-da-computacao-e-logica-de-programacao.pdf" },
			{ id: "21", name: "Power BI Desktop - construindo meu primeiro dashboard", category: "others", image: "assets/certificados/previews/21-power-bi-desktop-construindo-meu-primeiro-dashboard.jpg", pdfUrl: "assets/certificados/pdfs/21-power-bi-desktop-construindo-meu-primeiro-dashboard.pdf" },
			{ id: "22", name: "Praticando Python - condicionais if, elif e else", category: "backend", image: "assets/certificados/previews/22-praticando-python-condicionais-if-elif-e-else.jpg", pdfUrl: "assets/certificados/pdfs/22-praticando-python-condicionais-if-elif-e-else.pdf" },
			{ id: "23", name: "Praticando Python - funções", category: "backend", image: "assets/certificados/previews/23-praticando-python-funcoes.jpg", pdfUrl: "assets/certificados/pdfs/23-praticando-python-funcoes.pdf" },
			{ id: "24", name: "Praticando Python - laços for e while", category: "backend", image: "assets/certificados/previews/24-praticando-python-lacos-for-e-while.jpg", pdfUrl: "assets/certificados/pdfs/24-praticando-python-lacos-for-e-while.pdf" },
			{ id: "25", name: "Praticando Python - listas e tuplas", category: "backend", image: "assets/certificados/previews/25-praticando-python-listas-e-tuplas.jpg", pdfUrl: "assets/certificados/pdfs/25-praticando-python-listas-e-tuplas.pdf" },
			{ id: "26", name: "Praticando Python - trabalhando com projetos", category: "backend", image: "assets/certificados/previews/26-praticando-python-trabalhando-com-projetos.jpg", pdfUrl: "assets/certificados/pdfs/26-praticando-python-trabalhando-com-projetos.pdf" },
			{ id: "27", name: "Python - aplicando a Orientação a Objetos", category: "backend", image: "assets/certificados/previews/27-python-aplicando-a-orientacao-a-objetos.jpg", pdfUrl: "assets/certificados/pdfs/27-python-aplicando-a-orientacao-a-objetos.pdf" },
			{ id: "28", name: "Python - crie a sua primeira aplicação", category: "backend", image: "assets/certificados/previews/28-python-crie-a-sua-primeira-aplicacao.jpg", pdfUrl: "assets/certificados/pdfs/28-python-crie-a-sua-primeira-aplicacao.pdf" },
			{ id: "29", name: "React - desenvolvendo com JavaScript", category: "frontend", image: "assets/certificados/previews/29-react-desenvolvendo-com-javascript.jpg", pdfUrl: "assets/certificados/pdfs/29-react-desenvolvendo-com-javascript.pdf" },
	];


	function getCertName(cert) {
		if (!cert) return "";
		if (typeof cert.name === "string") return cert.name;
		if (cert.name && typeof cert.name === "object") {
			return cert.name[currentLanguage] || cert.name.pt || "";
		}
		return "";
	}

	function getCertColumns() {
		if (window.matchMedia("(min-width: 1024px)").matches) return 4;
		if (window.matchMedia("(min-width: 768px)").matches) return 3;
		return 2;
	}

	function getCertPageSize() {
		const cols = getCertColumns();
		return cols * 3;
	}

	function clamp(n, min, max) {
		return Math.max(min, Math.min(n, max));
	}

	function initEducation() {
		const tabAcademic = document.getElementById("tab-academic");
		const tabCourses = document.getElementById("tab-courses");
		const panelAcademic = document.getElementById("education-academic");
		const panelCourses = document.getElementById("education-courses");

		if (!tabAcademic || !tabCourses || !panelAcademic || !panelCourses) return;

		tabAcademic.addEventListener("click", () => {
			eduTab = "academic";
			tabAcademic.classList.add("active");
			tabCourses.classList.remove("active");
			panelAcademic.classList.remove("hidden");
			panelCourses.classList.add("hidden");
			updateEducationTabIndicator();
		});

		tabCourses.addEventListener("click", () => {
			eduTab = "courses";
			tabCourses.classList.add("active");
			tabAcademic.classList.remove("active");
			panelCourses.classList.remove("hidden");
			panelAcademic.classList.add("hidden");
			updateEducationTabIndicator();
			certPage = 1;
			renderCertificates();
		});

		document.querySelectorAll(".filter-btn").forEach((btn) => {
			btn.addEventListener("click", () => {
				const f = btn.getAttribute("data-filter");
				if (!f) return;

				certFilter = f;
				certPage = 1;

				document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
				btn.classList.add("active");

				renderCertificates();
			});
		});

		updateEducationTabIndicator();
	}

	function updateEducationTabIndicator() {
		const indicator = document.getElementById("edu-tab-indicator");
		const tabAcademic = document.getElementById("tab-academic");
		const tabCourses = document.getElementById("tab-courses");
		const tabsWrap = tabAcademic && tabAcademic.parentElement;

		if (!indicator || !tabAcademic || !tabCourses || !tabsWrap) return;

		const active = eduTab === "courses" ? tabCourses : tabAcademic;
		indicator.style.width = active.offsetWidth + "px";
		indicator.style.left = active.offsetLeft + "px";
	}

	function buildCertPagination(totalPages) {
		const nav = document.getElementById("cert-pagination");
		if (!nav) return;

		if (totalPages <= 1) {
			nav.classList.add("hidden");
			nav.innerHTML = "";
			return;
		}

		nav.classList.remove("hidden");

		const maxNumbers = 7;
		const pages = [];

		const add = (p) => pages.push(p);

		add(1);

		const left = Math.max(2, certPage - 1);
		const right = Math.min(totalPages - 1, certPage + 1);

		if (left > 2) add("...");
		for (let p = left; p <= right; p++) add(p);
		if (right < totalPages - 1) add("...");
		if (totalPages > 1) add(totalPages);

		const numbers = pages
			.map((p) => {
				if (p === "...") return `<span class="cert-page-ellipsis">…</span>`;
				const active = p === certPage ? "active" : "";
				return `<button type="button" class="cert-page-btn ${active}" data-cert-page="${p}" aria-label="Page ${p}">${p}</button>`;
			})
			.join("");

		nav.innerHTML = `
			<button type="button" class="cert-page-btn" data-cert-prev="1" ${certPage === 1 ? "disabled" : ""} aria-label="Previous page">
				<span class="icon-inline" data-icon="chevronLeft"></span>
			</button>
			<div class="cert-page-numbers">${numbers}</div>
			<button type="button" class="cert-page-btn" data-cert-next="1" ${certPage === totalPages ? "disabled" : ""} aria-label="Next page">
				<span class="icon-inline" data-icon="chevronRight"></span>
			</button>
		`;

		injectIcons(nav);

		const prev = nav.querySelector("[data-cert-prev]");
		const next = nav.querySelector("[data-cert-next]");

		if (prev) {
			prev.addEventListener("click", () => {
				certPage = clamp(certPage - 1, 1, totalPages);
				renderCertificates();
			});
		}

		if (next) {
			next.addEventListener("click", () => {
				certPage = clamp(certPage + 1, 1, totalPages);
				renderCertificates();
			});
		}

		nav.querySelectorAll("[data-cert-page]").forEach((btn) => {
			btn.addEventListener("click", () => {
				const p = parseInt(btn.getAttribute("data-cert-page"), 10);
				if (Number.isFinite(p)) {
					certPage = clamp(p, 1, totalPages);
					renderCertificates();
				}
			});
		});
	}

	
	const certModal = {
		backdrop: null,
		modal: null,
		image: null,
		title: null,
		download: null,
		close: null,
	};

	function cacheCertModalEls() {
		certModal.backdrop = document.getElementById("cert-modal-backdrop");
		certModal.modal = document.getElementById("cert-modal");
		certModal.image = document.getElementById("cert-modal-image");
		certModal.title = document.getElementById("cert-modal-title");
		certModal.download = document.getElementById("cert-modal-download");
		certModal.close = document.getElementById("cert-modal-close");

		if (certModal.close && !certModal.close.dataset.bound) {
			certModal.close.dataset.bound = "1";
			certModal.close.addEventListener("click", closeCertModal);
		}

		if (certModal.backdrop && !certModal.backdrop.dataset.bound) {
			certModal.backdrop.dataset.bound = "1";
			certModal.backdrop.addEventListener("click", closeCertModal);
		}
	}

	function openCertModal(cert) {
		if (!certModal.modal) cacheCertModalEls();
		if (!certModal.modal || !certModal.image || !certModal.download) return;

		const certName = getCertName(cert);

		if (certModal.title) certModal.title.textContent = certName;
		certModal.image.src = cert.image;
		certModal.image.alt = certName;

		certModal.download.href = cert.pdfUrl || "#";
		certModal.download.setAttribute("download", "");

		if (certModal.backdrop) certModal.backdrop.classList.remove("hidden");
		certModal.modal.classList.remove("hidden");
		document.body.classList.add("no-scroll");
	}

	function closeCertModal() {
		if (!certModal.modal) return;
		certModal.modal.classList.add("hidden");
		if (certModal.backdrop) certModal.backdrop.classList.add("hidden");
		document.body.classList.remove("no-scroll");
	}

function renderCertificates() {
		const grid = document.getElementById("certificates-grid");
		if (!grid) return;

		const filtered = certFilter === "all" ? certificates : certificates.filter((c) => c.category === certFilter);

		const pageSize = getCertPageSize();
		const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
		certPage = clamp(certPage, 1, totalPages);

		const start = (certPage - 1) * pageSize;
		const pageItems = filtered.slice(start, start + pageSize);

		const isMobileCards = window.matchMedia && window.matchMedia("(max-width: 767px)").matches;

		grid.innerHTML = "";

		pageItems.forEach((cert) => {
			const certName = getCertName(cert);
			const item = document.createElement("div");
			item.className = "cert-item";

			if (isMobileCards) {
				item.setAttribute("role", "button");
				item.tabIndex = 0;
				item.innerHTML = `
					<img src="${cert.image}" alt="${certName}" />
					<div class="cert-badge">${cert.category.toUpperCase()}</div>
				`;
				item.addEventListener("click", () => openCertModal(cert));
				item.addEventListener("keydown", (e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						openCertModal(cert);
					}
				});
			} else {
				item.innerHTML = `
					<img src="${cert.image}" alt="${certName}" />
					<div class="cert-badge">${cert.category.toUpperCase()}</div>
					<div class="cert-overlay">
						<p>${certName}</p>
						<a href="${cert.pdfUrl}" download class="cert-download">
							<span class="icon-inline" data-icon="download"></span>
							<span>${cert.pdfUrl && cert.pdfUrl.endsWith(".rar") ? t("education.downloadAll") : t("education.download")}</span>
						</a>
					</div>
				`;
			}

			grid.appendChild(item);
		});

		injectIcons(grid);
		buildCertPagination(totalPages);
	}

	function setFooterYear() {
		const y = document.getElementById("footer-year");
		if (!y) return;
		y.textContent = String(new Date().getFullYear());
	}

		function bindCvDownload() {
			const btn = document.getElementById("download-cv");
			if (!btn) return;
			btn.addEventListener("click", () => {
				const info = CV_FILES[currentLanguage] || CV_FILES.pt;
				triggerDownload(info.url, info.filename);
			});
		}

	function init() {
		initCodeBackground();
		injectIcons(document);

		applyTranslations();
		setFooterYear();
		initNavbar();
		bindCvDownload();
		bindContactEmailCopy();
		initEducation();
		cacheProjectDetailEls();

		let shouldSkipIntro = false;

		try {
			const url = new URL(window.location.href);
			if (url.searchParams.get("skipIntro") === "1") shouldSkipIntro = true;
		} catch (e) {}

		try {
			if (sessionStorage.getItem("mm_skip_intro_once") === "1") shouldSkipIntro = true;
		} catch (e) {}

		const ref = document.referrer || "";
		if (ref.indexOf("projeto-detalhe.html") !== -1 || ref.indexOf("roteiro-detalhe.html") !== -1) shouldSkipIntro = true;

		if (shouldSkipIntro) {
			try {
				sessionStorage.removeItem("mm_skip_intro_once");
			} catch (e) {}

			finishIntro(currentLanguage, true);

			try {
				const url = new URL(window.location.href);
				if (url.searchParams.has("skipIntro")) {
					url.searchParams.delete("skipIntro");
					history.replaceState(null, "", url.pathname + url.search + url.hash);
				}
			} catch (e) {}

			setTimeout(() => {
				const section = document.getElementById("projects");
				if (section) section.scrollIntoView({ behavior: "auto", block: "start" });
			}, 0);
		} else {
			startIntro();
		}

		observeReveals(document);

		try {
			const mq = window.matchMedia("(max-width: 767px)");
			const onMqChange = () => {
				renderProjects();
				renderCertificates();
			};
			if (mq && mq.addEventListener) mq.addEventListener("change", onMqChange);
			else if (mq && mq.addListener) mq.addListener(onMqChange);
		} catch (e) {}
	}


	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
