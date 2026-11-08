/* Vídeos reais do Jarvis (2018) no "Onde tudo começou": play com som, um por vez, legenda em PT ou EN com quem fala.
   Os arquivos saem de marca-matheus/v3-noite/robo-2018/videos-site.py; as falas foram transcritas e o falante
   conferido pela voz (a do robô é grave e chapada). */
(function () {
  "use strict";

  // [início, fim, quem (m = Matheus, j = Jarvis, "" = música), pt, en]
  var CAPS = {
    conversa: [
      [1.2, 2.15, "m", "Jarvis.", "Jarvis."],
      [2.2, 3.35, "j", "Precisa de algo?", "Need anything?"],
      [3.5, 5.05, "m", "Você me acha legal?", "Do you think I'm cool?"],
      [5.15, 6.62, "j", "Posso ser sincero?", "Can I be honest?"],
      [6.66, 7.65, "m", "Sim.", "Yes."],
      [7.75, 11.2, "j", "Você gosta de mandar, mas é legal.", "You like being in charge, but you're cool."]
    ],
    musica: [
      [0.55, 1.75, "m", "Jarvis?", "Jarvis?"],
      [1.8, 2.65, "j", "Sim?", "Yes?"],
      [2.7, 3.8, "m", "Continue.", "Keep going."],
      [3.9, 6.85, "", "tocando música", "playing music"],
      [6.9, 8.6, "m", "Mais alto.", "Louder."],
      [8.8, 10.6, "m", "Mais alto!", "Louder!"]
    ]
  };
  var T = {
    pt: { play: "Assistir", pause: "Pausar", again: "Ver de novo" },
    en: { play: "Watch", pause: "Pause", again: "Watch again" }
  };
  var ICON = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor"/></svg>',
    again: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12a7 7 0 1 0 2.1-5M5 4.5V9h4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };
  var root = document.documentElement;
  function lang() { return root.getAttribute("data-lang") === "en" ? "en" : "pt"; }
  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

  var cards = [].slice.call(document.querySelectorAll(".mv[data-mv]"));
  if (!cards.length) return;

  var players = cards.map(function (fig) {
    var v = fig.querySelector("video"), btn = fig.querySelector(".mv-hit"), ic = fig.querySelector(".mv-ic");
    var cap = fig.querySelector(".mv-cap"), bar = fig.querySelector(".mv-bar i"), name = fig.querySelector(".mv-name");
    var lines = CAPS[fig.dataset.mv] || [], shown = -1, state = "play";

    function setState(s) {
      state = s;
      ic.innerHTML = ICON[s];
      btn.setAttribute("aria-label", T[lang()][s] + ": " + name.textContent);
      fig.classList.toggle("is-playing", s === "pause");
    }
    function drawCap(force) {
      var t = v.currentTime, i = -1;
      for (var k = 0; k < lines.length; k++) if (t >= lines[k][0] && t < lines[k][1]) { i = k; break; }
      if (i === shown && !force) return;
      shown = i;
      if (i < 0) { cap.classList.remove("on"); return; }
      var l = lines[i], txt = esc(l[lang() === "en" ? 4 : 3]);
      cap.innerHTML = l[2] ? '<b class="' + l[2] + '">' + (l[2] === "j" ? "Jarvis" : "Matheus") + "</b>" + txt : '<span class="note">♪</span>' + txt;
      cap.classList.add("on");
    }
    function tick() {
      bar.style.setProperty("--p", v.duration ? (v.currentTime / v.duration).toFixed(4) : 0);
      drawCap(false);
      if (!v.paused) requestAnimationFrame(tick);
    }

    btn.addEventListener("click", function () {
      if (v.paused) {
        players.forEach(function (p) { if (p.v !== v) p.v.pause(); });
        if (state === "again") v.currentTime = 0;
        var pr = v.play(); if (pr && pr.catch) pr.catch(function () {});
      } else v.pause();
    });
    v.addEventListener("play", function () { fig.classList.add("is-started"); setState("pause"); requestAnimationFrame(tick); });
    v.addEventListener("pause", function () { if (!v.ended) setState("play"); });
    v.addEventListener("ended", function () { setState("again"); shown = -1; cap.classList.remove("on"); bar.style.setProperty("--p", 1); });
    setState("play");
    return { v: v, fig: fig, relabel: function () { setState(state); if (shown >= 0) drawCap(true); } };
  });

  // Sai da tela: pausa (ninguém fica ouvindo um vídeo que não está vendo).
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (!e.isIntersecting) e.target.querySelector("video").pause(); });
    }, { threshold: 0.15 });
    players.forEach(function (p) { io.observe(p.fig); });
  }
  // Troca de idioma: legenda e rótulos acompanham.
  new MutationObserver(function () { players.forEach(function (p) { p.relabel(); }); })
    .observe(root, { attributes: true, attributeFilter: ["data-lang"] });

  // Link do post (/#jarvis): depois que tudo carrega, garante que a seção fique no topo.
  if (location.hash === "#jarvis") window.addEventListener("load", function () {
    var el = document.getElementById("jarvis");
    if (el) el.scrollIntoView({ block: "start" });
  });
})();
