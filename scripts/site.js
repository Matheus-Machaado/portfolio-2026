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
    pt: { client: "Cliente", own: "Projeto próprio", screen: "Tela", of: "de", copied: "E-mail copiado", copyFail: "Não deu pra copiar. O e-mail está selecionado.", noScreens: "Sem telas nesta resolução.", close: "Fechar", prev: "Anterior", next: "Próxima", desktop: "Desktop", phone: "Celular" },
    en: { client: "Client", own: "Own product", screen: "Screen", of: "of", copied: "Email copied", copyFail: "Couldn't copy. The email is selected.", noScreens: "No screens at this size.", close: "Close", prev: "Previous", next: "Next", desktop: "Desktop", phone: "Phone" }
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
    $$(".cv-link").forEach(function (a) { a.href = "assets/curriculos/" + (lang === "en" ? "curriculo_english.pdf" : "curriculo.pdf"); });
    if (persist) { try { localStorage.setItem("mm-lang", lang); } catch (e) {} }
    renderWork();
    renderCerts();
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

  /* ---------- Intro ---------- */
  var introTimer = null;
  function endIntro() {
    if (!root.classList.contains("intro")) return;
    clearTimeout(introTimer);
    root.classList.add("intro-done");
    root.classList.remove("intro", "play");
    try { sessionStorage.setItem("mm-intro", "1"); } catch (e) {}
    ["keydown", "wheel", "touchstart"].forEach(function (ev) { window.removeEventListener(ev, endIntro); });
  }
  if (root.classList.contains("intro")) {
    var start = function () {
      root.classList.add("play");
      introTimer = setTimeout(endIntro, 3300);
      ["keydown", "wheel", "touchstart"].forEach(function (ev) { window.addEventListener(ev, endIntro, { passive: true }); });
    };
    var started = false;
    var go = function () { if (!started) { started = true; requestAnimationFrame(start); } };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
    setTimeout(go, 700);
    $("#skip-intro").addEventListener("click", endIntro);
  }

  /* ---------- Relógio ---------- */
  var clock = $("#clock");
  function tick() { try { clock.textContent = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" }).format(new Date()); } catch (e) {} }
  tick(); setInterval(tick, 30000);

  /* ---------- Nav ---------- */
  var nav = $("#nav"), lastY = window.scrollY, hero = $(".hero");
  function onNavScroll() {
    var y = window.scrollY;
    nav.classList.toggle("is-solid", y > 30);
    var pastHero = y > hero.offsetHeight * .6;
    if (!menu.hidden) { nav.classList.remove("is-hidden"); }
    else if (pastHero && y > lastY + 4) nav.classList.add("is-hidden");
    else if (y < lastY - 4 || !pastHero) nav.classList.remove("is-hidden");
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
    ["sobre", "case", "servicos", "projetos", "trajetoria", "contato"].forEach(function (id) { var s = document.getElementById(id); if (s) secObs.observe(s); });
  }

  /* ---------- Menu (celular) ---------- */
  var menu = $("#menu"), menuBtn = $("#menu-btn");
  function setMenu(open) {
    menu.hidden = !open;
    menu.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    root.classList.toggle("lock", open);
    menuBtn.innerHTML = open ? (lang === "en" ? "Close" : "Fechar") : (lang === "en" ? "Menu" : "Menu");
  }
  menuBtn.addEventListener("click", function () { setMenu(menu.hidden); });
  $$("#menu a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });

  /* ---------- Revelar no scroll ---------- */
  var revealEls = $$("[data-reveal]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    // Títulos que entram com recorte ficam 100% recortados no início; o navegador não os
    // considera visíveis, então observamos o bloco pai deles.
    var revealMap = new Map();
    var rObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        (revealMap.get(e.target) || []).forEach(function (el) { el.classList.add("is-in"); });
        rObs.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: .08 });
    revealEls.forEach(function (el) {
      var target = el.classList.contains("display") ? el.parentElement : el;
      if (!revealMap.has(target)) revealMap.set(target, []);
      revealMap.get(target).push(el);
      rObs.observe(target);
    });
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
    counters.forEach(function (c) { c.textContent = "0" + (c.dataset.suffix || ""); cObs.observe(c); });
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

  /* ---------- Loop de scroll ---------- */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; onNavScroll(); updateSteps(); });
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
      var techs = (p.technologies || []).slice(0, 4).map(function (x) { return "<li>" + (lang === "en" && x === "IA" ? "AI" : x) + "</li>"; }).join("");
      return '<li><a class="wk" href="#p-' + p.id + '">' +
        '<span class="wk-cover"><img src="' + p.coverImage + '" alt="" loading="lazy" width="1200" height="900"><span class="wk-type label">' + typeLabel(p) + "</span></span>" +
        '<span class="wk-body"><span class="wk-name">' + p.title + "</span>" +
        '<span class="wk-arrow">' + arrowSvg + "</span>" +
        '<span class="wk-ctx"><b>' + field(p, "company") + "</b>" + field(p, "description") + "</span>" +
        '<ul class="chips">' + techs + "</ul></span></a></li>";
    }).join("");
  }

  /* ---------- Detalhe do projeto ---------- */
  var pd = $("#pd"), pdMain = $("#pd-main"), gallery = $("#pd-gallery"), seg = $("#pd-seg");
  var current = null, view = "desktop", lastFocus = null;
  function byId(id) { for (var i = 0; i < DATA.projects.length; i++) if (DATA.projects[i].id === id) return DATA.projects[i]; return null; }
  function images(p, v) { return (v === "mobile" ? p.mobileImages : p.desktopImages) || []; }
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
  function setView(v) {
    view = v;
    $$("button", seg).forEach(function (b) { b.setAttribute("aria-selected", String(b.dataset.view === v)); });
    renderGallery(); moveSeg();
    pdMain.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }
  function renderProject(p, v) {
    current = p;
    $("#pd-company").textContent = field(p, "company");
    $("#pd-title").textContent = p.title;
    $("#pd-type").textContent = typeLabel(p);
    $("#pd-desc").innerHTML = (field(p, "fullDescription") || field(p, "description")).split(/\n\n+/).map(function (para) { return "<p>" + para + "</p>"; }).join("");
    $("#pd-tags").innerHTML = (p.technologies || []).map(function (x) { return "<li>" + (lang === "en" && x === "IA" ? "AI" : x) + "</li>"; }).join("");
    var live = $("#pd-live");
    live.hidden = !p.liveUrl; if (p.liveUrl) live.href = p.liveUrl;
    var nd = images(p, "desktop").length, nm = images(p, "mobile").length;
    $("#pd-n-desktop").textContent = nd; $("#pd-n-mobile").textContent = nm;
    seg.querySelector('[data-view="desktop"]').hidden = !nd;
    seg.querySelector('[data-view="mobile"]').hidden = !nm;
    var idx = DATA.projects.indexOf(p), nx = DATA.projects[(idx + 1) % DATA.projects.length];
    $("#pd-next").href = "#p-" + nx.id; $("#pd-next-name").textContent = nx.title;
    var want = v || (p.id === "abdous-barber" ? "mobile" : (nd ? "desktop" : "mobile"));
    if (want === "mobile" && !nm) want = "desktop";
    if (want === "desktop" && !nd) want = "mobile";
    setView(want);
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
  gallery.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-i]");
    if (!b) return;
    lbList = images(current, view);
    lb.hidden = false; showLb(+b.dataset.i); $("#lb-close").focus();
  });
  function closeLb() { lb.hidden = true; }
  $("#lb-prev").addEventListener("click", function () { showLb(lbIdx - 1); });
  $("#lb-next").addEventListener("click", function () { showLb(lbIdx + 1); });
  $("#lb-close").addEventListener("click", closeLb);
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
  var tx = null;
  lb.addEventListener("touchstart", function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) { if (tx === null) return; var dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) showLb(lbIdx + (dx < 0 ? 1 : -1)); tx = null; });

  /* ---------- Certificados ---------- */
  var certs = $("#certs"), certGrid = $("#cert-grid"), certCat = "all";
  function renderCerts() {
    if (!certGrid) return;
    certGrid.innerHTML = DATA.certificates.filter(function (c) { return certCat === "all" || c.cat === certCat; }).map(function (c) {
      return '<li><a href="' + c.pdf + '" target="_blank" rel="noopener"><img src="' + c.img + '" alt="" loading="lazy" width="836" height="563"><span>' + c.name + "</span></a></li>";
    }).join("");
  }
  $$("#cert-chips button").forEach(function (b) {
    b.addEventListener("click", function () {
      certCat = b.dataset.cat;
      $$("#cert-chips button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      renderCerts();
    });
  });
  var certOpener = null;
  $("#open-certs").addEventListener("click", function (e) { certOpener = e.currentTarget; certs.hidden = false; root.classList.add("lock"); $("#certs-close").focus(); });
  function closeCerts() { certs.hidden = true; if (pd.hidden) root.classList.remove("lock"); if (certOpener) certOpener.focus(); }
  $("#certs-close").addEventListener("click", closeCerts);
  certs.addEventListener("click", function (e) { if (e.target === certs) closeCerts(); });

  /* ---------- Vídeos do case ---------- */
  var vp = $("#vp"), vpFrame = $("#vp-frame");
  $$(".film").forEach(function (f) {
    var src = (f.dataset.video || "").trim();
    if (!src) return;
    f.classList.add("is-playable"); f.tabIndex = 0; f.setAttribute("role", "button");
    var open = function () {
      vpFrame.innerHTML = src.indexOf("yt:") === 0
        ? '<iframe src="https://www.youtube-nocookie.com/embed/' + src.slice(3) + '?autoplay=1&rel=0" allow="autoplay; fullscreen" allowfullscreen title="' + f.dataset["title" + (lang === "en" ? "En" : "Pt")] + '"></iframe>'
        : '<video src="' + src + '" controls autoplay playsinline></video>';
      vp.hidden = false; $("#vp-close").focus();
    };
    f.addEventListener("click", open);
    f.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
  });
  function closeVp() { vp.hidden = true; vpFrame.innerHTML = ""; }
  $("#vp-close").addEventListener("click", closeVp);
  vp.addEventListener("click", function (e) { if (e.target === vp) closeVp(); });

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
      if (!vp.hidden) return closeVp();
      if (!lb.hidden) return closeLb();
      if (!certs.hidden) return closeCerts();
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
