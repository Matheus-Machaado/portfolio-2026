/* Player de vídeo do portfólio: controles próprios, capítulos, retomar de onde parou. */
(function () {
  "use strict";

  var ICON = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor"/></svg>',
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 7 6 12l5 5M6 12h9a4 4 0 0 1 0 8h-2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    fwd: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m13 7 5 5-5 5M18 12H9a4 4 0 0 0 0 8h2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    vol: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" fill="currentColor"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    mute: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" fill="currentColor"/><path d="m16 9.5 5 5M21 9.5l-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    list: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    full: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
  };

  function fmt(s) {
    s = Math.max(0, Math.floor(s || 0));
    var m = Math.floor(s / 60), r = s % 60;
    return m + ":" + (r < 10 ? "0" : "") + r;
  }
  function lang() { return document.documentElement.getAttribute("data-lang") === "en" ? "en" : "pt"; }
  var TXT = {
    pt: { play: "Reproduzir", pause: "Pausar", back: "Voltar 10 segundos", fwd: "Avançar 10 segundos", mute: "Sem som", unmute: "Com som", chapters: "Capítulos", full: "Tela cheia", close: "Fechar vídeo", speed: "Velocidade", resume: "Continuar de onde parou", restart: "Começar do início", at: "em" },
    en: { play: "Play", pause: "Pause", back: "Back 10 seconds", fwd: "Forward 10 seconds", mute: "Mute", unmute: "Unmute", chapters: "Chapters", full: "Fullscreen", close: "Close video", speed: "Speed", resume: "Resume where you left off", restart: "Start over", at: "at" }
  };
  function t(k) { return TXT[lang()][k]; }

  var el, video, opts, hideT = null, lastFocus = null, dragging = false;

  function build() {
    el = document.createElement("div");
    el.className = "pl";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.hidden = true;
    el.innerHTML =
      '<div class="pl-stage">' +
        '<video class="pl-video" playsinline preload="metadata"></video>' +
        '<button type="button" class="pl-hit" tabindex="-1" aria-hidden="true"></button>' +
        '<div class="pl-flash" aria-hidden="true"></div>' +
        '<div class="pl-spin" aria-hidden="true"></div>' +
        '<div class="pl-resume" hidden><p class="label"></p><div><button type="button" class="pl-chip" data-act="resume"></button><button type="button" class="pl-chip ghost" data-act="restart"></button></div></div>' +
        '<header class="pl-top"><div><span class="label pl-kicker"></span><strong class="pl-title"></strong></div><button type="button" class="pl-btn pl-x" data-act="close">' + ICON.close + '</button></header>' +
        '<div class="pl-bottom">' +
          '<div class="pl-bar" role="slider" tabindex="0" aria-valuemin="0">' +
            '<div class="pl-track"><i class="pl-buf"></i><i class="pl-fill"></i><div class="pl-ticks"></div></div>' +
            '<i class="pl-knob"></i>' +
            '<div class="pl-tip"><b></b><span></span></div>' +
          '</div>' +
          '<div class="pl-row">' +
            '<button type="button" class="pl-btn pl-pp" data-act="toggle">' + ICON.play + '</button>' +
            '<button type="button" class="pl-btn" data-act="back">' + ICON.back + '</button>' +
            '<button type="button" class="pl-btn" data-act="fwd">' + ICON.fwd + '</button>' +
            '<div class="pl-vol"><button type="button" class="pl-btn" data-act="mute">' + ICON.vol + '</button><input type="range" class="pl-volr" min="0" max="1" step="0.05" value="1"></div>' +
            '<span class="pl-time label"><b class="pl-cur">0:00</b> / <span class="pl-dur">0:00</span></span>' +
            '<span class="pl-chap label"></span>' +
            '<span class="pl-sp"></span>' +
            '<div class="pl-q"><button type="button" class="pl-btn pl-speed label" data-act="quality" aria-haspopup="true">Auto</button><ul class="pl-qmenu" hidden></ul></div>' +
            '<button type="button" class="pl-btn pl-speed label" data-act="speed">1x</button>' +
            '<button type="button" class="pl-btn pl-chbtn" data-act="chapters">' + ICON.list + '</button>' +
            '<button type="button" class="pl-btn" data-act="full">' + ICON.full + '</button>' +
          '</div>' +
        '</div>' +
        '<aside class="pl-list" hidden><p class="label"></p><ol></ol></aside>' +
      '</div>';
    document.body.appendChild(el);
    video = el.querySelector(".pl-video");
    wire();
  }

  function $(s) { return el.querySelector(s); }
  function chapterAt(time) {
    var ch = (opts && opts.chapters) || [], cur = null;
    for (var i = 0; i < ch.length; i++) if (time >= ch[i].t) cur = ch[i];
    return cur;
  }
  function chTitle(c) { return c ? (lang() === "en" ? c.en : c.pt) : ""; }

  function labels() {
    $(".pl-x").setAttribute("aria-label", t("close"));
    el.querySelector('[data-act="back"]').setAttribute("aria-label", t("back"));
    el.querySelector('[data-act="fwd"]').setAttribute("aria-label", t("fwd"));
    el.querySelector('[data-act="full"]').setAttribute("aria-label", t("full"));
    el.querySelector('[data-act="chapters"]').setAttribute("aria-label", t("chapters"));
    el.querySelector('[data-act="speed"]').setAttribute("aria-label", t("speed"));
    $(".pl-volr").setAttribute("aria-label", "Volume");
    $(".pl-list .label").textContent = t("chapters");
    $(".pl-resume [data-act=resume]").textContent = t("resume");
    $(".pl-resume [data-act=restart]").textContent = t("restart");
    syncPlay(); syncMute();
  }

  function syncPlay() {
    var b = $(".pl-pp"), playing = !video.paused && !video.ended;
    b.innerHTML = playing ? ICON.pause : ICON.play;
    b.setAttribute("aria-label", playing ? t("pause") : t("play"));
    el.classList.toggle("is-playing", playing);
  }
  function syncMute() {
    var b = el.querySelector('[data-act="mute"]'), m = video.muted || video.volume === 0;
    b.innerHTML = m ? ICON.mute : ICON.vol;
    b.setAttribute("aria-label", m ? t("unmute") : t("mute"));
    $(".pl-volr").value = m ? 0 : video.volume;
  }
  function flash(icon) {
    var f = $(".pl-flash");
    f.innerHTML = icon; f.classList.remove("on"); void f.offsetWidth; f.classList.add("on");
  }
  function showUi() {
    el.classList.add("ui");
    clearTimeout(hideT);
    hideT = setTimeout(function () { if (!video.paused && !dragging && $(".pl-list").hidden) el.classList.remove("ui"); }, 2600);
  }

  function render() {
    var d = video.duration || 0, c = video.currentTime || 0;
    $(".pl-fill").style.width = (d ? c / d * 100 : 0) + "%";
    $(".pl-knob").style.left = (d ? c / d * 100 : 0) + "%";
    $(".pl-cur").textContent = fmt(c);
    var bar = $(".pl-bar");
    bar.setAttribute("aria-valuemax", Math.round(d)); bar.setAttribute("aria-valuenow", Math.round(c));
    bar.setAttribute("aria-valuetext", fmt(c) + " / " + fmt(d));
    try { if (video.buffered.length) $(".pl-buf").style.width = (video.buffered.end(video.buffered.length - 1) / d * 100) + "%"; } catch (e) {}
    var ch = chapterAt(c);
    $(".pl-chap").textContent = ch ? chTitle(ch) : "";
    $$(".pl-list li").forEach(function (li) { li.classList.toggle("on", ch && +li.dataset.t === ch.t); });
    if (opts && opts.key && d && c > 5 && d - c > 20) { try { localStorage.setItem("mm-pl-" + opts.key, String(Math.floor(c))); } catch (e) {} }
  }
  function $$(s) { return Array.prototype.slice.call(el.querySelectorAll(s)); }

  function ticks() {
    var d = video.duration || 0, w = $(".pl-ticks"), list = $(".pl-list ol");
    var ch = (opts && opts.chapters) || [];
    w.innerHTML = d ? ch.filter(function (c) { return c.t > 0; }).map(function (c) { return '<i style="left:' + (c.t / d * 100) + '%"></i>'; }).join("") : "";
    if (list.dataset.key !== (opts && opts.key) + lang()) list.innerHTML = ch.map(function (c, i) {
      return '<li data-t="' + c.t + '"><button type="button"><span class="label">' + String(i + 1).padStart(2, "0") + '</span><b>' + chTitle(c) + '</b><time>' + fmt(c.t) + "</time></button></li>";
    }).join("");
    list.dataset.key = (opts && opts.key) + lang();
    el.classList.toggle("has-ch", ch.length > 0);
  }

  function seekFromEvent(e) {
    var r = $(".pl-bar").getBoundingClientRect();
    var x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    var p = Math.max(0, Math.min(1, x / r.width));
    return p * (video.duration || 0);
  }

  function wire() {
    el.addEventListener("click", function (e) {
      var b = e.target.closest("[data-act]");
      if (!b) return;
      var a = b.dataset.act;
      if (a === "close") close();
      else if (a === "toggle") toggle();
      else if (a === "back") { video.currentTime = Math.max(0, video.currentTime - 10); flash(ICON.back); }
      else if (a === "fwd") { video.currentTime = Math.min(video.duration, video.currentTime + 10); flash(ICON.fwd); }
      else if (a === "mute") { video.muted = !video.muted; if (!video.muted && video.volume === 0) video.volume = 1; syncMute(); }
      else if (a === "quality") { var qm = $(".pl-qmenu"); qm.hidden = !qm.hidden; showUi(); }
      else if (a === "q") { setLevel(+b.dataset.level); $(".pl-qmenu").hidden = true; }
      else if (a === "speed") { var s = [1, 1.25, 1.5, 2], i = (s.indexOf(video.playbackRate) + 1) % s.length; video.playbackRate = s[i]; b.textContent = s[i] + "x"; }
      else if (a === "chapters") { var l = $(".pl-list"); l.hidden = !l.hidden; el.classList.toggle("list-open", !l.hidden); showUi(); }
      else if (a === "full") fullscreen();
      else if (a === "resume") { $(".pl-resume").hidden = true; video.currentTime = +$(".pl-resume").dataset.t || 0; video.play(); }
      else if (a === "restart") { $(".pl-resume").hidden = true; video.currentTime = 0; video.play(); }
    });
    $(".pl-hit").addEventListener("click", function () {
      if (window.matchMedia("(hover: none)").matches && !el.classList.contains("ui")) { showUi(); return; }
      toggle();
    });
    var lastTap = 0;
    $(".pl-hit").addEventListener("touchend", function (e) {
      var now = Date.now(), x = e.changedTouches[0].clientX, w = window.innerWidth;
      if (now - lastTap < 300) {
        e.preventDefault();
        if (x < w * .4) { video.currentTime = Math.max(0, video.currentTime - 10); flash(ICON.back); }
        else if (x > w * .6) { video.currentTime = Math.min(video.duration, video.currentTime + 10); flash(ICON.fwd); }
      }
      lastTap = now;
    });
    $(".pl-list").addEventListener("click", function (e) {
      var li = e.target.closest("li[data-t]");
      if (!li) return;
      $(".pl-resume").hidden = true;
      video.currentTime = +li.dataset.t; video.play();
      if (window.innerWidth < 900) { $(".pl-list").hidden = true; el.classList.remove("list-open"); }
    });
    $(".pl-volr").addEventListener("input", function () { video.volume = +this.value; video.muted = +this.value === 0; syncMute(); });

    var bar = $(".pl-bar"), tip = $(".pl-tip");
    function hover(e) {
      var tt = seekFromEvent(e), d = video.duration || 0, r = bar.getBoundingClientRect();
      tip.style.left = Math.max(60, Math.min(r.width - 60, (d ? tt / d : 0) * r.width)) + "px";
      tip.querySelector("b").textContent = fmt(tt);
      tip.querySelector("span").textContent = chTitle(chapterAt(tt));
      bar.classList.add("hov");
    }
    bar.addEventListener("pointermove", hover);
    bar.addEventListener("pointerleave", function () { if (!dragging) bar.classList.remove("hov"); });
    bar.addEventListener("pointerdown", function (e) {
      dragging = true; bar.setPointerCapture(e.pointerId); $(".pl-resume").hidden = true;
      video.currentTime = seekFromEvent(e); hover(e); render();
    });
    bar.addEventListener("pointermove", function (e) { if (dragging) { video.currentTime = seekFromEvent(e); render(); } });
    bar.addEventListener("pointerup", function () { dragging = false; bar.classList.remove("hov"); showUi(); });
    bar.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { video.currentTime += 5; e.preventDefault(); }
      if (e.key === "ArrowLeft") { video.currentTime -= 5; e.preventDefault(); }
    });

    ["play", "pause", "ended"].forEach(function (ev) { video.addEventListener(ev, function () { syncPlay(); showUi(); }); });
    video.addEventListener("timeupdate", render);
    video.addEventListener("progress", render);
    video.addEventListener("loadedmetadata", function () { $(".pl-dur").textContent = fmt(video.duration); ticks(); render(); });
    video.addEventListener("waiting", function () { el.classList.add("loading"); });
    ["playing", "canplay"].forEach(function (ev) { video.addEventListener(ev, function () { el.classList.remove("loading"); }); });
    video.addEventListener("volumechange", syncMute);
    el.addEventListener("pointermove", showUi);
    document.addEventListener("keydown", function (e) {
      if (el.hidden) return;
      if (e.target.closest && (e.target.closest(".pl-bar") || e.target.matches("input"))) return;
      var k = e.key.toLowerCase();
      if (k === " " || k === "k") { e.preventDefault(); toggle(); }
      else if (k === "arrowright" || k === "l") { video.currentTime += 10; flash(ICON.fwd); }
      else if (k === "arrowleft" || k === "j") { video.currentTime -= 10; flash(ICON.back); }
      else if (k === "m") { video.muted = !video.muted; }
      else if (k === "f") fullscreen();
      else if (k === "escape") { if (!$(".pl-qmenu").hidden) { $(".pl-qmenu").hidden = true; } else if (!$(".pl-list").hidden) { $(".pl-list").hidden = true; el.classList.remove("list-open"); } else if (!document.fullscreenElement) close(); }
      else if (k === "tab") trap(e);
      showUi();
    });
  }

  function trap(e) {
    var f = $$("button:not([hidden]):not([tabindex='-1']), input, [tabindex='0']").filter(function (x) { return x.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  function toggle() {
    $(".pl-resume").hidden = true;
    if (video.paused || video.ended) { var p = video.play(); if (p && p.catch) p.catch(function () {}); flash(ICON.play); }
    else { video.pause(); flash(ICON.pause); }
  }
  function fullscreen() {
    var stage = $(".pl-stage");
    try {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (stage.requestFullscreen) stage.requestFullscreen();
      else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
    } catch (e) {}
  }

  var hls = null;
  function qLabel(h) { return h >= 1080 ? "1080p HD" : h + "p"; }
  function renderLevels(levels) {
    var qm = $(".pl-qmenu"), qb = el.querySelector('[data-act="quality"]');
    if (!levels || levels.length < 2) { qb.parentElement.hidden = true; return; }
    qb.parentElement.hidden = false;
    var cur = hls ? hls.autoLevelEnabled ? -1 : hls.currentLevel : -1;
    var items = [{ i: -1, t: "Auto" }].concat(levels.map(function (l, i) { return { i: i, t: qLabel(l.height), h: l.height }; }).sort(function (a, b) { return b.h - a.h; }));
    qm.innerHTML = items.map(function (it) { return '<li><button type="button" data-act="q" data-level="' + it.i + '" class="' + (it.i === cur ? "on" : "") + '">' + it.t + "</button></li>"; }).join("");
  }
  function setLevel(i) {
    if (!hls) return;
    if (i === -1) { hls.currentLevel = -1; } else { hls.currentLevel = i; }
    renderLevels(hls.levels); syncQ();
  }
  function syncQ() {
    var qb = el.querySelector('[data-act="quality"]');
    if (!hls) return;
    var lv = hls.levels[hls.currentLevel];
    qb.textContent = (hls.autoLevelEnabled ? "Auto" : "") + (lv ? (hls.autoLevelEnabled ? " · " : "") + qLabel(lv.height) : "");
  }
  function loadSource(src) {
    if (hls) { hls.destroy(); hls = null; }
    var qWrap = el.querySelector(".pl-q"); qWrap.hidden = true;
    if (/\.m3u8($|\?)/.test(src) && window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ capLevelToPlayerSize: true, startLevel: -1, maxBufferLength: 30, enableWorker: false });
      hls.loadSource(src); hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function (e, d) { renderLevels(d.levels); syncQ(); });
      hls.on(window.Hls.Events.LEVEL_SWITCHED, function () { syncQ(); });
      hls.on(window.Hls.Events.ERROR, function (e, d) {
        if (!d.fatal) return;
        if (d.type === window.Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad();
        else if (d.type === window.Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
      });
    } else {
      video.src = src;
    }
  }

  function open(o) {
    if (!el) build();
    opts = o || {};
    lastFocus = document.activeElement;
    el.classList.toggle("vertical", !!opts.vertical);
    el.setAttribute("aria-label", opts.title || "");
    $(".pl-kicker").textContent = opts.kicker || "";
    $(".pl-title").textContent = opts.title || "";
    $(".pl-list").hidden = true; el.classList.remove("list-open");
    video.poster = opts.poster || "";
    loadSource(opts.src);
    video.playbackRate = 1; el.querySelector('[data-act="speed"]').textContent = "1x";
    $(".pl-dur").textContent = "0:00"; $(".pl-fill").style.width = "0"; $(".pl-buf").style.width = "0";
    labels(); ticks();
    var saved = 0;
    try { saved = +localStorage.getItem("mm-pl-" + opts.key) || 0; } catch (e) {}
    var res = $(".pl-resume");
    if (saved > 15) {
      res.dataset.t = saved;
      res.querySelector("p").textContent = (lang() === "en" ? "You stopped at " : "Você parou em ") + fmt(saved);
      res.hidden = false;
      video.currentTime = 0;
    } else {
      res.hidden = true;
      var p = video.play(); if (p && p.catch) p.catch(function () {});
    }
    if (typeof opts.start === "number") { res.hidden = true; video.currentTime = opts.start; var p2 = video.play(); if (p2 && p2.catch) p2.catch(function () {}); }
    el.hidden = false;
    requestAnimationFrame(function () { el.classList.add("in"); });
    document.documentElement.classList.add("lock");
    showUi();
    setTimeout(function () { (res.hidden ? $(".pl-pp") : res.querySelector("button")).focus({ preventScroll: true }); }, 50);
    if (opts.onOpen) opts.onOpen();
  }
  function close() {
    if (!el || el.hidden) return;
    video.pause();
    if (document.fullscreenElement) { try { document.exitFullscreen(); } catch (e) {} }
    el.classList.remove("in");
    setTimeout(function () {
      el.hidden = true; if (hls) { hls.destroy(); hls = null; } video.removeAttribute("src"); video.load();
      if (opts && opts.onClose) opts.onClose();
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    }, 300);
  }

  window.MMPlayer = { open: open, close: close, isOpen: function () { return !!el && !el.hidden; } };
})();
