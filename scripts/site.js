/* Matheus Machado · Portfólio "Noite" · JS puro, sem dependências. */
(function () {
  "use strict";

  var root = document.documentElement;
  var DATA = window.MM_DATA || { projects: [], certificates: [] };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var lang = root.getAttribute("data-lang") === "en" ? "en" : "pt";

  var T = {
    pt: { more: "Ver mais", less: "Ver menos", details: "Ver detalhes", hide: "Esconder detalhes", seeProject: "Ver projeto", showMore: "Mostrar mais {n}", showLess: "Mostrar menos", mo: "mês", mos: "meses", yr: "ano", yrs: "anos", and: "e", play: "Assistir", drag: "Arraste", client: "Cliente", own: "Projeto próprio", screen: "Tela", of: "de", copied: "E-mail copiado", copyFail: "Não deu pra copiar. O e-mail está selecionado.", noScreens: "Sem telas nesta resolução.", close: "Fechar", prev: "Anterior", next: "Próxima", desktop: "Desktop", phone: "Celular" },
    en: { more: "Show more", less: "Show less", details: "Show details", hide: "Hide details", seeProject: "View project", showMore: "Show {n} more", showLess: "Show less", mo: "month", mos: "months", yr: "year", yrs: "years", and: "and", play: "Watch", drag: "Drag", client: "Client", own: "Own product", screen: "Screen", of: "of", copied: "Email copied", copyFail: "Couldn't copy. The email is selected.", noScreens: "No screens at this size.", close: "Close", prev: "Previous", next: "Next", desktop: "Desktop", phone: "Phone" }
  };
  var t = function (k) { return T[lang][k] || k; };
  var field = function (p, k) { return (lang === "en" && p[k + "_en"]) || p[k] || ""; };

  /* ---------- Idioma ---------- */
  var i18nNodes = $$("[data-en]");
  i18nNodes.forEach(function (el) { el.dataset.pt = el.innerHTML; });
  var altNodes = $$("[data-en-alt]");
  altNodes.forEach(function (el) { el.dataset.ptAlt = el.getAttribute("alt"); });

  function applyLang(next, persist) {
    lang = next === "en" ? "en" : "pt";
    root.lang = lang === "en" ? "en" : "pt-BR";
    root.setAttribute("data-lang", lang);
    i18nNodes.forEach(function (el) { el.innerHTML = lang === "en" ? el.dataset.en : el.dataset.pt; });
    altNodes.forEach(function (el) { el.setAttribute("alt", lang === "en" ? el.dataset.enAlt : el.dataset.ptAlt); });
    $$("[data-set-lang]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.setLang === lang)); });

    $$(".cv-link").forEach(function (a) { a.href = "assets/curriculos/" + (lang === "en" ? "curriculo_english.pdf" : "curriculo.pdf") + "?v=20261030b"; });
    if (persist) { try { localStorage.setItem("mm-lang", lang); } catch (e) {} }
    splitHeadings();
    renderWork();
    renderCerts();
    renderDurations();
    syncJobs();
    if (typeof renderCode === "function") renderCode(false);
    if (current) renderProject(current, view);
  }
  $$("[data-set-lang]").forEach(function (b) { b.addEventListener("click", function () { applyLang(b.dataset.setLang, true); }); });

  /* ---------- Nome letra a letra ---------- */
  var n = 0;
  $$(".name .w").forEach(function (w) {
    var txt = w.textContent; w.textContent = "";
    txt.split("").forEach(function (ch) {
      var s = document.createElement("span"); s.className = "ch"; s.textContent = ch; s.style.setProperty("--i", n++); w.appendChild(s);
    });
  });

  /* ---------- Campo de código (fundo da intro e do hero) ---------- */
  var TOKENS = ["const", "function", "() =>", "return", "async", "await", "</>", "{ }", "[ ]", "import", "export", "if", "===", "=>", "200 OK", "deploy", "npm run build", "SELECT *", "git push", "useState", "fetch()", "<div>", "pix.create()", "agenda.marcar()", "whatsapp.send()", "Prisma", "Next.js", "Node", "SQL", "API"];
  function codeField(canvas, o) {
    if (!canvas || !canvas.getContext) return null;
    var ctx = canvas.getContext("2d"), dpr = Math.min(window.devicePixelRatio || 1, 2), W = 0, H = 0, items = [], dots = [], raf = 0, running = false;
    var t = 0, scrollV = 0, lastSy = window.scrollY;
    function size() {
      var r = canvas.getBoundingClientRect(); W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(o.max, W * H / o.density));
      items = []; for (var i = 0; i < n; i++) items.push(spawn(true));
      dots = []; for (var k = 0; k < Math.round(n * 2.2); k++) dots.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.3 + .3, p: Math.random() * 6.3, s: Math.random() * .02 + .01 });
    }
    function spawn(any) {
      var z = Math.random();
      return { txt: TOKENS[(Math.random() * TOKENS.length) | 0], x: Math.random() * W, y: any ? Math.random() * H : H + 20, z: z, v: (.15 + z * .45) * o.speed, sz: 10 + z * 7, a: .05 + z * .12 };
    }
    function frame() {
      t += .016;
      var sy2 = window.scrollY; scrollV += ((sy2 - lastSy) - scrollV) * .15; lastSy = sy2;
      ctx.clearRect(0, 0, W, H);
      for (var d = 0; d < dots.length; d++) {
        var p = dots[d], tw = Math.sin(t * p.s * 60 + p.p) * .35 + .65;
        ctx.fillStyle = "rgba(239,237,232," + (.12 * tw).toFixed(3) + ")";
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      }
      ctx.textBaseline = "middle";
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        it.y -= it.v + Math.abs(scrollV) * .04 * (1 + it.z);
        if (it.y < -20) items[i] = it = spawn(false);
        ctx.font = "500 " + Math.round(it.sz) + "px \"JetBrains Mono\", ui-monospace, Consolas, monospace";
        ctx.fillStyle = "rgba(239,237,232," + it.a.toFixed(3) + ")";
        ctx.fillText(it.txt, it.x, it.y);
      }
      raf = running ? requestAnimationFrame(frame) : 0;
    }
    size(); window.addEventListener("resize", size);
    return {
      start: function () { if (running || reduceMotion) { if (reduceMotion) frame(); return; } running = true; raf = requestAnimationFrame(frame); },
      stop: function () { running = false; cancelAnimationFrame(raf); },
      size: size
    };
  }

  /* ---------- Intro: terminal (a mesma do portfólio antigo, nas cores novas) ---------- */
  var boot = $("#boot");
  function finishBoot(chosen) {
    if (!root.classList.contains("intro")) return;
    if (chosen) applyLang(chosen, true);
    try { sessionStorage.setItem("mm-intro", "1"); } catch (e) {}
    document.removeEventListener("keydown", bootKeys);
    boot.classList.add("out");
    root.classList.remove("intro");
    heroField && heroField.start();
    setTimeout(function () { boot.hidden = true; boot.classList.remove("out"); }, reduceMotion ? 0 : 500);
  }
  function bootKeys(e) {
    var k = e.key.toLowerCase();
    if (k === "escape") finishBoot();
    else if (!$("#boot-select").hidden && (k === "1" || k === "p")) finishBoot("pt");
    else if (!$("#boot-select").hidden && (k === "2" || k === "e")) finishBoot("en");
  }
  if (root.classList.contains("intro") && boot) {
    var LINES = ["> Initializing system...", "> Loading Matheus Machado...", "> Full Stack Developer detected", "> Welcome to the portfolio"];
    var linesEl = $("#boot-lines"), li = 0;
    $$("[data-boot-lang]").forEach(function (b) { b.addEventListener("click", function () { finishBoot(b.dataset.bootLang); }); });
    document.addEventListener("keydown", bootKeys);
    (function addLine() {
      if (li < LINES.length) {
        var row = document.createElement("div"); row.className = "boot-line"; row.textContent = LINES[li++];
        linesEl.appendChild(row);
        setTimeout(addLine, 600);
        return;
      }
      setTimeout(function () {
        $$(".boot-line", linesEl).forEach(function (l) { l.classList.add("dim"); });
        $("#boot-cur").hidden = true;
        $("#boot-select").hidden = false;
      }, 500);
    })();
  } else if (boot) { boot.hidden = true; }

  /* ---------- Fundo vivo do hero ---------- */
  var heroField = codeField($("#hero-bg"), { density: 12000, max: 80, speed: 1, radius: 200, target: $(".hero") });
  if (heroField) {
    if (!root.classList.contains("intro")) heroField.start();
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) {
      if (root.classList.contains("intro")) return;
      es[0].isIntersecting ? heroField.start() : heroField.stop();
    }).observe($(".hero"));
  }

  /* ---------- Nav ---------- */
  var nav = $("#nav"), lastY = window.scrollY, hero = $(".hero");
  function onNavScroll() {
    var y = window.scrollY;
    nav.classList.toggle("is-solid", y > 30);
    var pastHero = y > hero.offsetHeight * .6;
    lastY = y;
  }
  var navLinks = $$(".links a");
  if ("IntersectionObserver" in window) {
    var secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.toggle("is-current", a.getAttribute("href") === "#" + e.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["sobre", "especialidades", "case", "projetos", "servicos", "trajetoria", "contato"].forEach(function (id) { var s = document.getElementById(id); if (s) secObs.observe(s); });
  }

  /* ---------- Menu (celular) ---------- */
  var menu = $("#menu"), menuBtn = $("#menu-btn");
  var menuT = null;
  function setMenu(open) {
    clearTimeout(menuT);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? (lang === "en" ? "Close menu" : "Fechar menu") : (lang === "en" ? "Open menu" : "Abrir menu"));
    root.classList.toggle("menu-open", open);
    updFab();
    if (open) {
      menu.hidden = false; root.classList.add("lock");
      requestAnimationFrame(function () { menu.classList.add("is-open"); });

    } else {
      menu.classList.remove("is-open"); root.classList.remove("lock");
      menuT = setTimeout(function () { menu.hidden = true; updFab(); }, reduceMotion ? 0 : 350);
    }
  }
  menuBtn.addEventListener("click", function () { setMenu(menu.hidden); });
  menu.addEventListener("click", function (e) { if (e.target === menu) setMenu(false); });

  $$("#menu .menu-links a, #menu .menu-cta, #fab a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });

  /* ---------- Títulos palavra a palavra ---------- */
  function splitHeadings() {
    $$(".display, .contact-title, .film-h").forEach(function (el) {
      var i = 0;
      (function walk(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (c) {
          if (c.nodeType === 3) {
            var parts = c.textContent.split(/(\s+)/), frag = document.createDocumentFragment();
            parts.forEach(function (p) {
              if (!p) return;
              if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(" ")); return; }
              var w = document.createElement("span"); w.className = "w";
              var inner = document.createElement("span"); inner.textContent = p; inner.style.setProperty("--wi", i++);
              w.appendChild(inner); frag.appendChild(w);
            });
            node.replaceChild(frag, c);
          } else if (c.nodeType === 1 && !c.classList.contains("w")) walk(c);
        });
      })(el);
      el.classList.add("is-split");
    });
  }
  splitHeadings();

  /* ---------- Revelar no scroll ---------- */
  var revealEls = $$("[data-reveal]"), revealSweep = function () {};
  if ("IntersectionObserver" in window && !reduceMotion) {
    // Títulos que entram com recorte ficam 100% recortados no início; o navegador não os
    // considera visíveis, então observamos o bloco pai deles.
    var revealMap = new Map();
    var rObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        (revealMap.get(e.target) || []).forEach(function (el) { el.classList.add("is-in"); });
        rObs.unobserve(e.target); revealMap.delete(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: .08 });
    revealEls.forEach(function (el) {
      var target = el.classList.contains("display") ? el.parentElement : el;
      if (!revealMap.has(target)) revealMap.set(target, []);
      revealMap.get(target).push(el);
      rObs.observe(target);
    });
    // Rolagem rápida pode pular o observer: o que já passou da tela aparece também.
    revealSweep = function () {
      if (!revealMap.size) return;
      var vh = window.innerHeight;
      revealMap.forEach(function (els, target) {
        if (target.getBoundingClientRect().top < vh) { els.forEach(function (el) { el.classList.add("is-in"); }); rObs.unobserve(target); revealMap.delete(target); }
      });
    };
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Contadores ---------- */
  var counters = $$("[data-count]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var cObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        cObs.unobserve(e.target);
        var el = e.target, to = +el.dataset.count, suf = el.dataset.suffix || "", t0 = performance.now(), dur = 1400 + to;
        dur = Math.min(dur, 2000);
        (function step(now) {
          var k = clamp((now - t0) / dur, 0, 1), v = Math.round(to * (1 - Math.pow(1 - k, 4)));
          el.textContent = v + suf;
          if (k < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: .4 });
    counters.forEach(function (c) { if (+c.dataset.count > 1000) return; c.textContent = "0" + (c.dataset.suffix || ""); cObs.observe(c); });
  }

  /* ---------- Case: lista + celular ---------- */
  var builtItems = $$(".built-list li"), phoneImgs = $$(".phone img");
  function setBuilt(i) {
    builtItems.forEach(function (li) { li.classList.toggle("is-on", +li.dataset.screen === i); });
    phoneImgs.forEach(function (img, k) { img.classList.toggle("is-on", k === i); });
  }
  builtItems.forEach(function (li) {
    li.addEventListener("mouseenter", function () { setBuilt(+li.dataset.screen); });
  });
  if ("IntersectionObserver" in window) {
    var bObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) setBuilt(+e.target.dataset.screen); });
    }, { rootMargin: "-48% 0px -48% 0px" });
    builtItems.forEach(function (li) { bObs.observe(li); });
  }

  /* ---------- Processo: linha que acende ---------- */
  var steps = $(".steps"), stepItems = $$(".steps li"), stepsLine = $(".steps-line i");
  function updateSteps() {
    if (!steps) return;
    var r = steps.getBoundingClientRect(), vh = window.innerHeight;
    var p = reduceMotion ? 1 : clamp((vh * .78 - r.top) / (vh * .55), 0, 1);
    steps.style.setProperty("--p", p.toFixed(3));
    stepItems.forEach(function (li, i) {
      var lr = li.getBoundingClientRect();
      var on = window.innerWidth > 1180 ? p >= (i + .2) / stepItems.length : lr.top < vh * .72;
      li.classList.toggle("is-on", reduceMotion || on);
    });
  }


  /* ---------- Cartão de código do Sobre ---------- */
  var codeBody = $("#code-body"), codeTyped = false;
  var CODE = {
    pt: [
      [["c", "// matheus.ts"]],
      [["k", "const "], ["f", "matheus"], ["p", " = {"]],
      [["p", "  cargo: "], ["s", "\"Desenvolvedor Full Stack\""], ["p", ","]],
      [["p", "  formacao: ["], ["s", "\"FIAP\""], ["p", ", "], ["s", "\"MBA USP\""], ["p", "],"]],
      [["p", "  desde: "], ["n", "2022"], ["p", ","]],
      [["p", "  sistemasNoAr: "], ["n", "4"], ["p", ","]],
      [["p", "  foco: "], ["s", "\"resolver problema real\""], ["p", ","]],
      [["p", "};"]],
      [],
      [["k", "export default "], ["f", "matheus"], ["p", ";"]]
    ],
    en: [
      [["c", "// matheus.ts"]],
      [["k", "const "], ["f", "matheus"], ["p", " = {"]],
      [["p", "  role: "], ["s", "\"Full Stack Developer\""], ["p", ","]],
      [["p", "  education: ["], ["s", "\"FIAP\""], ["p", ", "], ["s", "\"MBA USP\""], ["p", "],"]],
      [["p", "  since: "], ["n", "2022"], ["p", ","]],
      [["p", "  systemsLive: "], ["n", "4"], ["p", ","]],
      [["p", "  focus: "], ["s", "\"solving real problems\""], ["p", ","]],
      [["p", "};"]],
      [],
      [["k", "export default "], ["f", "matheus"], ["p", ";"]]
    ]
  };
  function esc(x) { return x.replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
  function renderCode(animate) {
    if (!codeBody) return;
    var lines = CODE[lang];
    codeBody.innerHTML = lines.map(function (parts) {
      return '<span class="ln">' + parts.map(function (pt) { return '<span class="' + pt[0] + '">' + esc(pt[1]) + "</span>"; }).join("") + "</span>";
    }).join("");
    if (!animate) return;
    var lns = $$(".ln", codeBody);
    lns.forEach(function (l) { l.style.visibility = "hidden"; });
    lns.forEach(function (l, i) {
      setTimeout(function () {
        l.style.visibility = "";
        lns.forEach(function (x) { x.classList.remove("typing"); });
        l.classList.add("typing");
        if (i === lns.length - 1) setTimeout(function () { l.classList.remove("typing"); }, 1400);
      }, 120 + i * 85);
    });
  }
  if (codeBody && "IntersectionObserver" in window && !reduceMotion) {
    var codeObs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting && !codeTyped) { codeTyped = true; renderCode(true); codeObs.disconnect(); }
    }, { threshold: .35 });
    codeObs.observe(codeBody);
  }

  /* ---------- Carrosséis (celular) ---------- */
  $$(".rail-nav").forEach(function (nav) {
    var rail = document.getElementById(nav.dataset.rail);
    if (!rail) return;
    var items = $$(":scope > li", rail), count = nav.querySelector(".rail-count"), dots = nav.querySelector(".rail-dots");
    dots.innerHTML = items.map(function () { return "<i></i>"; }).join("");
    var di = $$("i", dots);
    function upd() {
      var w = items[0] ? items[0].getBoundingClientRect().width + 12 : 1;
      var i = clamp(Math.round(rail.scrollLeft / w), 0, items.length - 1);
      count.textContent = String(i + 1).padStart(2, "0") + " / " + String(items.length).padStart(2, "0");
      di.forEach(function (d, k) { d.classList.toggle("on", k === i); });
    }
    rail.addEventListener("scroll", function () { requestAnimationFrame(upd); }, { passive: true });
    upd();
  });

  /* ---------- WhatsApp flutuante ---------- */
  var fab = $("#fab"), contactSec = $("#contato");
  function updFab() {
    if (!fab) return;
    // Barra fixa sempre presente (como no Abdou's); some só com menu, detalhe do projeto ou vídeo abertos.
    fab.classList.add("is-on");
    fab.classList.toggle("is-hidden", !pd.hidden || !menu.hidden || !!(window.MMPlayer && window.MMPlayer.isOpen()));
  }

  /* ---------- Barra de leitura ---------- */
  var progress = $("#progress");
  function updateProgress() {
    if (!progress) return;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = "scaleX(" + (h > 0 ? window.scrollY / h : 0).toFixed(4) + ")";
  }

  /* ---------- Parallax nas capas ---------- */
  function updateParallax() {
    if (reduceMotion) return;
    var vh = window.innerHeight;
    $$(".wk-cover img, .film-main .film-frame > img").forEach(function (img) {
      var r = img.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var k = (r.top + r.height / 2 - vh / 2) / vh;
      img.style.transform = "translate3d(0," + (k * -6).toFixed(2) + "%,0) scale(1.12)";
    });
  }

  /* ---------- Faixa reage à rolagem ---------- */
  var track = $(".track"), tickX = 0, lastSY = window.scrollY, vel = 0;
  if (track && !reduceMotion) {
    track.style.animation = "none";
    (function loop() {
      var sy = window.scrollY, d = sy - lastSY; lastSY = sy;
      vel += (d - vel) * .1;
      tickX -= .5 + Math.min(12, Math.abs(vel) * .35);
      var half = track.scrollWidth / 2;
      if (half && -tickX >= half) tickX += half;
      track.style.transform = "translate3d(" + tickX.toFixed(2) + "px,0,0) skewX(" + clamp(-vel * .25, -8, 8).toFixed(2) + "deg)";
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- Loop de scroll ---------- */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; onNavScroll(); updateSteps(); updFab(); revealSweep(); updateTimeline(); updateProgress(); updateParallax(); });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  /* ---------- Projetos: cards ---------- */
  var workList = $("#work-list");
  var arrowSvg = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5"/></svg>';
  function typeLabel(p) { return p.workType === "personal" ? t("own") : t("client"); }
  function renderWork() {
    if (!workList) return;
    workList.innerHTML = DATA.projects.map(function (p) {
      var n = (p.desktopImages || []).length + (p.mobileImages || []).length;
      return '<li><a class="wk" href="#p-' + p.id + '">' +
        '<span class="wk-cover"><img src="' + p.coverImage + '" alt="" loading="lazy" width="1200" height="900"><span class="wk-type label">' + typeLabel(p) + "</span></span>" +
        '<span class="wk-body"><span class="wk-name">' + p.title + "</span>" +
        '<span class="wk-arrow">' + arrowSvg + "</span>" +
        '<span class="wk-ctx"><b>' + field(p, "company") + "</b>" + field(p, "description") + "</span>" +
        '<span class="wk-foot label"><span>' + t("seeProject") + '</span><span>' + n + (lang === "en" ? " screens" : " telas") + "</span></span></span></a></li>";
    }).join("");
    var items = $$(":scope > li", workList);
    if (!("IntersectionObserver" in window) || reduceMotion) { items.forEach(function (li) { li.classList.add("is-in"); }); return; }
    var wo = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting || e.boundingClientRect.top < 0) { e.target.classList.add("is-in"); wo.unobserve(e.target); } });
    }, { threshold: .15 });
    items.forEach(function (li) { if (li.getBoundingClientRect().top < innerHeight) li.classList.add("is-in"); else wo.observe(li); });
  }

  /* ---------- Detalhe do projeto ---------- */
  var pd = $("#pd"), pdMain = $("#pd-main"), gallery = $("#pd-gallery"), seg = $("#pd-seg");
  var current = null, view = "desktop", lastFocus = null;
  function byId(id) { for (var i = 0; i < DATA.projects.length; i++) if (DATA.projects[i].id === id) return DATA.projects[i]; return null; }
  function images(p, v) { return (v === "mobile" ? p.mobileImages : v === "tablet" ? p.tabletImages : p.desktopImages) || []; }
  var L = function (o, k) { return (lang === "en" && o[k + "_en"]) || o[k] || ""; };
  var paras = function (s) { return s ? s.split(/\n\n+/).map(function (x) { return "<p>" + x + "</p>"; }).join("") : ""; };
  // Imagens dos módulos do case, na ordem em que aparecem (o lightbox navega por elas).
  var caseShots = [];
  function shotHtml(s, alt) {
    var i = caseShots.push(s.src) - 1;
    return '<button type="button" class="pc-shot is-' + (s.kind || "desktop") + '" data-ci="' + i + '"><span class="shot-frame"><img src="' + s.src + '" alt="' + alt + '" loading="lazy"></span></button>';
  }
  function renderCase(p) {
    var c = p.case, box = $("#pd-case"), meta = $("#pd-meta"), toc = $("#pd-toc");
    caseShots = [];
    if (!c) { box.innerHTML = ""; box.hidden = true; meta.hidden = true; toc.hidden = true; return; }
    var en = lang === "en", h = "";
    if (c.cover) h += '<figure class="pc-cover">' + shotHtml(c.cover, p.title) + "</figure>";
    if (c.highlights) h += '<ul class="pc-nums">' + c.highlights.map(function (x) { return "<li><b>" + x.n + "</b><span>" + L(x, "l") + "</span></li>"; }).join("") + "</ul>";
    if (c.challenge) h += '<section class="pc-sec" id="pc-desafio"><p class="label soft-label">' + (en ? "(The challenge)" : "(O desafio)") + '</p><h3 class="pc-h">' + L(c, "challengeTitle") + '</h3><div class="pc-text">' + paras(L(c, "challenge")) + "</div></section>";
    if (c.modules) {
      h += '<section class="pc-sec" id="pc-modulos"><p class="label soft-label">' + (en ? "(What was built)" : "(O que foi construído)") + '</p><h3 class="pc-h">' + L(c, "modulesTitle") + "</h3>";
      h += c.modules.map(function (m, i) {
        var items = (en && m.items_en) || m.items || [];
        var shots = (m.shots || []), kind = shots.length ? (shots[0].kind || "desktop") : "none";
        return '<article class="pc-mod is-' + kind + (shots.length > 1 ? " is-multi" : "") + '">' +
          '<div class="pc-mod-text"><span class="label pc-mod-n">' + (i < 9 ? "0" : "") + (i + 1) + "</span><h4>" + L(m, "t") + "</h4><p>" + L(m, "d") + "</p>" +
          (items.length ? "<ul>" + items.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul>" : "") + "</div>" +
          (shots.length ? '<div class="pc-mod-media">' + shots.map(function (s) { return shotHtml(s, p.title + ", " + L(m, "t")); }).join("") + "</div>" : "") +
          "</article>";
      }).join("") + "</section>";
    }
    if (c.result) h += '<section class="pc-sec pc-result" id="pc-resultado"><p class="label soft-label">' + (en ? "(Result)" : "(Resultado)") + '</p><div class="pc-text pc-big">' + paras(L(c, "result")) + "</div></section>";
    if (c.note) h += '<p class="pc-note">' + L(c, "note") + "</p>";
    box.innerHTML = h; box.hidden = false;
    meta.innerHTML = (c.meta || []).map(function (x) { return "<div><dt class=\"label soft-label\">" + L(x, "k") + "</dt><dd>" + L(x, "v") + "</dd></div>"; }).join("");
    meta.hidden = !(c.meta && c.meta.length);
    var links = [];
    if (c.challenge) links.push(["pc-desafio", en ? "The challenge" : "O desafio"]);
    if (c.modules) links.push(["pc-modulos", en ? "What was built" : "O que foi construído"]);
    if (c.result) links.push(["pc-resultado", en ? "Result" : "Resultado"]);
    links.push(["pd-screens", en ? "Screens" : "Telas"]);
    toc.innerHTML = '<p class="label soft-label">' + (en ? "In this case" : "Neste case") + "</p>" + links.map(function (l, i) { return '<a href="#' + l[0] + '" data-go="' + l[0] + '"><span class="label">0' + (i + 1) + "</span>" + l[1] + "</a>"; }).join("");
    toc.hidden = false;
  }
  function moveSeg() {
    var b = seg.querySelector('[aria-selected="true"]');
    if (!b || !b.offsetWidth) return;
    seg.style.setProperty("--sx", b.offsetLeft + "px");
    seg.style.setProperty("--sw", b.offsetWidth + "px");
  }
  function renderGallery() {
    var list = images(current, view);
    gallery.className = "pd-gallery is-" + view;
    gallery.innerHTML = list.length ? list.map(function (src, i) {
      return '<figure class="shot" style="--i:' + i + '"><button type="button" class="shot-btn" data-i="' + i + '"><span class="shot-frame"><img src="' + src + '" alt="' + current.title + ", " + t("screen").toLowerCase() + " " + (i + 1) + '" loading="lazy"></span></button></figure>';
    }).join("") : '<p class="soft">' + t("noScreens") + "</p>";
  }
  function setView(v, keep) {
    view = v;
    $$("button", seg).forEach(function (b) { b.setAttribute("aria-selected", String(b.dataset.view === v)); });
    renderGallery(); moveSeg();
    if (keep) return;
    var bar = $("#pd-screens");
    if (bar.getBoundingClientRect().top < 1) bar.scrollIntoView({ block: "start", behavior: reduceMotion ? "auto" : "smooth" });
  }
  function renderProject(p, v) {
    current = p;
    $("#pd-company").textContent = field(p, "company");
    $("#pd-title").textContent = p.title;
    $("#pd-type").textContent = typeLabel(p);
    $("#pd-desc").innerHTML = paras(p.case ? (L(p.case, "lead") || field(p, "description")) : (field(p, "fullDescription") || field(p, "description")));
    renderCase(p);
    $("#pd-tags").innerHTML = (p.technologies || []).map(function (x) { return "<li>" + (lang === "en" && x === "IA" ? "AI" : x) + "</li>"; }).join("");
    var live = $("#pd-live");
    live.hidden = !p.liveUrl; if (p.liveUrl) live.href = p.liveUrl;
    var nd = images(p, "desktop").length, nt = images(p, "tablet").length, nm = images(p, "mobile").length;
    $("#pd-n-desktop").textContent = nd; $("#pd-n-tablet").textContent = nt; $("#pd-n-mobile").textContent = nm;
    seg.querySelector('[data-view="desktop"]').hidden = !nd;
    seg.querySelector('[data-view="tablet"]').hidden = !nt;
    seg.querySelector('[data-view="mobile"]').hidden = !nm;
    var idx = DATA.projects.indexOf(p), nx = DATA.projects[(idx + 1) % DATA.projects.length];
    $("#pd-next").href = "#p-" + nx.id; $("#pd-next-name").textContent = nx.title;
    var want = v || p.defaultView || (nd ? "desktop" : "mobile");
    if (!images(p, want).length) want = nd ? "desktop" : nm ? "mobile" : "tablet";
    setView(want, true);
  }
  function openProject(id) {
    var p = byId(id);
    if (!p) return;
    var wasOpen = !pd.hidden;
    if (!wasOpen) lastFocus = document.activeElement;
    renderProject(p);
    pdMain.scrollTop = 0; $(".pd-side-scroll").scrollTop = 0; pd.scrollTop = 0;
    if (!wasOpen) {
      pd.hidden = false; pd.classList.remove("is-out");
      if (!reduceMotion) { pd.classList.add("is-in"); setTimeout(function () { pd.classList.remove("is-in"); }, 800); }
      root.classList.add("lock");
      if (root.classList.contains("intro")) endIntro();
      requestAnimationFrame(moveSeg);
      $("#pd-close").focus({ preventScroll: true });
    }
  }
  function closeProject() {
    if (pd.hidden) return;
    var finish = function () { pd.hidden = true; pd.classList.remove("is-out"); root.classList.remove("lock"); current = null; if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true }); };
    if (reduceMotion) finish(); else { pd.classList.add("is-out"); setTimeout(finish, 430); }
  }
  function route() {
    var h = location.hash;
    if (h.indexOf("#p-") === 0) openProject(h.slice(3)); else closeProject();
  }
  // Abrir pela página empilha uma entrada no histórico (o Voltar do navegador fecha);
  // trocar de projeto com o painel aberto só substitui, então fechar sempre fecha.
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#p-"]');
    if (!a || e.metaKey || e.ctrlKey) return;
    var id = a.getAttribute("href").slice(3);
    if (!byId(id)) return;
    e.preventDefault();
    if (pd.hidden) history.pushState({ pd: 1 }, "", "#p-" + id);
    else history.replaceState(history.state, "", "#p-" + id);
    openProject(id);
  });
  window.addEventListener("popstate", route);
  window.addEventListener("hashchange", route);
  $("#pd-close").addEventListener("click", function () {
    if (history.state && history.state.pd) history.back();
    else { history.replaceState(null, "", location.pathname + location.search); closeProject(); }
  });
  $$("button", seg).forEach(function (b) { b.addEventListener("click", function () { setView(b.dataset.view); }); });
  window.addEventListener("resize", moveSeg);

  /* ---------- Lightbox ---------- */
  var lb = $("#lb"), lbImg = $("#lb-img"), lbIdx = 0, lbList = [];
  function showLb(i) {
    lbIdx = (i + lbList.length) % lbList.length;
    lbImg.src = lbList[lbIdx];
    lbImg.alt = current.title + ", " + t("screen").toLowerCase() + " " + (lbIdx + 1);
    $("#lb-count").textContent = (lbIdx + 1) + " " + t("of") + " " + lbList.length;
  }
  function openLb(list, i) { lbList = list; lb.hidden = false; showLb(i); $("#lb-close").focus(); }
  gallery.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-i]");
    if (b) openLb(images(current, view), +b.dataset.i);
  });
  $("#pd-case").addEventListener("click", function (e) {
    var b = e.target.closest("button[data-ci]");
    if (b) openLb(caseShots, +b.dataset.ci);
  });
  $("#pd-toc").addEventListener("click", function (e) {
    var a = e.target.closest("a[data-go]");
    if (!a) return;
    e.preventDefault();
    var el = document.getElementById(a.dataset.go);
    if (el) el.scrollIntoView({ block: "start", behavior: reduceMotion ? "auto" : "smooth" });
  });
  function closeLb() { lb.hidden = true; }
  $("#lb-prev").addEventListener("click", function () { showLb(lbIdx - 1); });
  $("#lb-next").addEventListener("click", function () { showLb(lbIdx + 1); });
  $("#lb-close").addEventListener("click", closeLb);
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
  var tx = null;
  lb.addEventListener("touchstart", function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) { if (tx === null) return; var dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) showLb(lbIdx + (dx < 0 ? 1 : -1)); tx = null; });

  /* ---------- Certificados (embutidos na formação) ---------- */
  var certGrid = $("#cert-grid"), certMore = $("#cert-more"), certCat = "all", certOpen = false;
  var CERT_PAGE = window.innerWidth < 721 ? 4 : 8;
  function renderCerts() {
    if (!certGrid) return;
    var list = DATA.certificates.filter(function (c) { return certCat === "all" || c.cat === certCat; });
    var shown = certOpen ? list : list.slice(0, CERT_PAGE);
    certGrid.innerHTML = shown.map(function (c, i) {
      return '<li style="--i:' + (i % CERT_PAGE) + '"><a href="' + c.pdf + '" target="_blank" rel="noopener"><span class="cert-img"><img src="' + c.img + '" alt="" loading="lazy" width="836" height="563"></span><span class="cert-cat label">' + (c.cat === "others" ? (lang === "en" ? "Others" : "Outros") : c.cat === "frontend" ? "Front-end" : c.cat === "backend" ? "Back-end" : "Design") + '</span><span class="cert-name">' + c.name + '</span><span class="cert-open label">PDF ↗</span></a></li>';
    }).join("");
    var rest = list.length - CERT_PAGE;
    certMore.hidden = rest <= 0;
    certMore.textContent = certOpen ? t("showLess") : t("showMore").replace("{n}", rest);
  }
  $$("#cert-chips button").forEach(function (b) {
    b.addEventListener("click", function () {
      certCat = b.dataset.cat; certOpen = false;
      $$("#cert-chips button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      renderCerts();
    });
  });
  if (certMore) certMore.addEventListener("click", function () {
    certOpen = !certOpen; renderCerts();
    if (!certOpen) $("#formacao").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  });

  /* ---------- Abas da formação ---------- */
  var tabs = $$(".tabs [role=tab]"), ink = $(".tabs-ink");
  function moveInk() {
    var a = $(".tabs [aria-selected=true]");
    if (!a || !ink) return;
    ink.style.width = a.offsetWidth + "px"; ink.style.transform = "translateX(" + a.offsetLeft + "px)";
  }
  tabs.forEach(function (tb, i) {
    tb.addEventListener("click", function () {
      tabs.forEach(function (x) { var on = x === tb; x.setAttribute("aria-selected", String(on)); x.tabIndex = on ? 0 : -1; $("#" + x.getAttribute("aria-controls")).hidden = !on; });
      moveInk();
    });
    tb.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      var n = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length]; n.focus(); n.click();
    });
  });
  window.addEventListener("resize", moveInk);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveInk);

  /* ---------- Trajetória: detalhes + duração + linha ---------- */
  function syncJobs() {
    $$(".job-more").forEach(function (b) { b.querySelector("span").textContent = b.getAttribute("aria-expanded") === "true" ? t("hide") : t("details"); });
  }
  $$(".job-more").forEach(function (b) {
    b.addEventListener("click", function () {
      var job = b.closest(".job"), open = b.getAttribute("aria-expanded") !== "true";
      b.setAttribute("aria-expanded", String(open)); job.classList.toggle("is-open", open);
      syncJobs();
    });
  });
  function renderDurations() {
    var now = new Date();
    $$(".dur").forEach(function (d) {
      var f = d.dataset.from.split("-"), to = d.dataset.to ? d.dataset.to.split("-") : [now.getFullYear(), now.getMonth() + 1];
      var m = (+to[0] - +f[0]) * 12 + (+to[1] - +f[1]); if (m < 1) m = 1;
      var y = Math.floor(m / 12), r = m % 12, out = [];
      if (y) out.push(y + " " + (y > 1 ? t("yrs") : t("yr")));
      if (r) out.push(r + " " + (r > 1 ? t("mos") : t("mo")));
      d.textContent = out.join(" " + t("and") + " ");
    });
  }
  var tlEl = $("#timeline"), tlFill = $(".tl-rail i");
  function updateTimeline() {
    if (!tlEl || !tlFill) return;
    var r = tlEl.getBoundingClientRect(), vh = window.innerHeight;
    var p = reduceMotion ? 1 : clamp((vh * .6 - r.top) / r.height, 0, 1);
    tlFill.style.transform = "scaleY(" + p.toFixed(3) + ")";
    $$(".job", tlEl).forEach(function (j) { j.classList.toggle("lit", j.getBoundingClientRect().top < vh * .6 || reduceMotion); });
  }

  /* ---------- Vídeos do case (player próprio) ---------- */
  var VIDEOS = {
    doc: {
      key: "doc-v9", src: "https://matheus-machado-media.netlify.app/doc/master.m3u8", poster: "assets/img/projetos/abdous/doc-frame-512.webp",
      kicker: { pt: "Documentário", en: "Documentary" }, title: { pt: "Abdou's Barber · o antes e o depois", en: "Abdou's Barber · the before and after" },
      chapters: [
        { t: 0, pt: "Um dia na barbearia", en: "A day at the shop" },
        { t: 155, pt: "A conversa com o dono", en: "The talk with the owner" },
        { t: 397, pt: "Como era antes do sistema?", en: "What was it like before?" },
        { t: 441, pt: "O real impacto no dia a dia", en: "The real impact" },
        { t: 500, pt: "O contato com o cliente hoje", en: "Talking to clients today" },
        { t: 536, pt: "Na visão do cliente", en: "The client's view" },
        { t: 579, pt: "Área do cliente e fila de espera", en: "Client area and waiting list" },
        { t: 628, pt: "Mensalidades e planos", en: "Memberships and plans" },
        { t: 684, pt: "O que mais impactou", en: "What changed the most" },
        { t: 809, pt: "Créditos e bastidores", en: "Credits and behind the scenes" }
      ]
    },
    com: { key: "com-60", src: "https://matheus-machado-media.netlify.app/comercial/comercial-1080.mp4", poster: "assets/img/projetos/abdous/comercial-poster.webp", vertical: true, kicker: { pt: "Comercial", en: "Commercial" }, title: { pt: "Abdou's Barber", en: "Abdou's Barber" }, chapters: [] }
  };
  var loopVid = $(".film-loop");
  function playVideo(id, start) {
    var v = VIDEOS[id];
    if (!v || !window.MMPlayer) return;
    if (loopVid) loopVid.pause();
    window.MMPlayer.open({
      key: v.key, src: v.src, poster: v.poster, vertical: v.vertical, chapters: v.chapters, start: start,
      kicker: v.kicker[lang], title: v.title[lang],
      onOpen: function () { updFab(); }, onClose: function () { root.classList.remove("lock"); updFab(); }
    });
  }
  $$("[data-play]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      var b = e.target.closest("[data-t]");
      if (b && b !== el && !el.contains(b)) return;
      e.stopPropagation();
      playVideo(el.dataset.play, b ? +b.dataset.t : (el.dataset.t ? +el.dataset.t : undefined));
    });
  });
  // Comercial roda sem som no quadro quando aparece na tela (só no computador, pra poupar dados no celular).
  if (loopVid && finePointer && !reduceMotion && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var busy = window.MMPlayer && window.MMPlayer.isOpen();
        if (e.isIntersecting && !busy) {
          if (!loopVid.getAttribute("src")) loopVid.src = "https://matheus-machado-media.netlify.app/comercial/comercial-720-loop.mp4";
          var p = loopVid.play(); if (p && p.catch) p.catch(function () {});
          loopVid.classList.add("is-on");
        } else { loopVid.pause(); }
      });
    }, { threshold: .4 }).observe(loopVid);
  }

  /* ---------- Copiar e-mail ---------- */
  var toast = $("#toast"), toastT = null;
  function showToast(msg) { toast.textContent = msg; toast.classList.add("is-on"); clearTimeout(toastT); toastT = setTimeout(function () { toast.classList.remove("is-on"); }, 2600); }
  $("#copy-email").addEventListener("click", function () {
    var email = "matheus.machaado.dev@gmail.com";
    var fallback = function () {
      var el = $(".email-text"), r = document.createRange(); r.selectNodeContents(el);
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      showToast(t("copyFail"));
    };
    try { navigator.clipboard.writeText(email).then(function () { showToast(t("copied")); }, fallback); } catch (e) { fallback(); }
  });

  /* ---------- Teclado ---------- */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (window.MMPlayer && window.MMPlayer.isOpen()) return;
      if (!lb.hidden) return closeLb();
      if (!pd.hidden) return $("#pd-close").click();
      if (!menu.hidden) return setMenu(false);
    }
    if (!lb.hidden && (e.key === "ArrowRight" || e.key === "ArrowLeft")) showLb(lbIdx + (e.key === "ArrowRight" ? 1 : -1));
  });

  /* ---------- Início ---------- */
  applyLang(lang, false);
  onScroll();
  route();
})();
