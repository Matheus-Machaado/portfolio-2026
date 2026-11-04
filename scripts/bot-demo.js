/* Atendimento com IA (#atendimento-ia): conversa de exemplo que roda sozinha quando aparece na tela.
   Regras e preços são os do assistente real da Abdou's Barber (corte R$ 45, Corte Ilimitado R$ 84,99). */
(function () {
  "use strict";

  var sec = document.getElementById("atendimento-ia");
  if (!sec) return;
  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || sec).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || sec).querySelectorAll(s)); };
  var lang = function () { return root.getAttribute("data-lang") === "en" ? "en" : "pt"; };

  var list = $(".bc-list"), status = $(".bc-status"), stage = $(".bot-stage");
  var T = {
    pt: { online: "online", typing: "digitando…", rec: "gravando áudio…", today: "HOJE", wait: "Aguardando", run: "Fazendo…", ai: "Assistente · IA", tr: "Transcrição", payT: "Assinar Corte Ilimitado", payS: "R$ 84,99/mês · cartão ou Pix", okT: "Pagamento aprovado", okS: "Corte Ilimitado ativo", booked: "Gabriel · Corte", plan: "Corte Ilimitado", cash: "R$ 84,99" },
    en: { online: "online", typing: "typing…", rec: "recording audio…", today: "TODAY", wait: "Waiting", run: "Working…", ai: "Assistant · AI", tr: "Transcript", payT: "Subscribe to Unlimited Haircut", payS: "R$ 84.99/month · card or Pix", okT: "Payment approved", okS: "Unlimited Haircut active", booked: "Gabriel · Haircut", plan: "Unlimited Haircut", cash: "R$ 84.99" }
  };
  var t = function (k) { return T[lang()][k]; };

  // Roteiro: cada passo é uma mensagem no chat, uma etapa do painel ou uma mudança no sistema.
  var SCRIPT = [
    { k: "in", at: "23:47", pt: "boa noite, tem horário amanhã às 10?", en: "hi, any slot tomorrow at 10?" },
    { k: "step", id: "ouvir", pt: "Texto · pede amanhã às 10:00", en: "Text · wants tomorrow at 10:00" },
    { k: "step", id: "agenda", run: 1100, slots: ["1000", "0930", "1030"], pt: "10:00 ocupado · livres 9:30 e 10:30", en: "10:00 taken · 9:30 and 10:30 free" },
    { k: "out", at: "23:47", pt: "Boa noite, Gabriel! Às 10:00 o Alexandre já está ocupado. Tenho 9:30 ou 10:30, qual fica melhor?", en: "Evening, Gabriel! Alexandre is booked at 10:00. I have 9:30 or 10:30, which works better?" },
    { k: "audio", at: "23:48", dur: "0:06", pt: "pode ser dez e meia. e quanto fica o plano de corte?", en: "10:30 works. and how much is the haircut plan?" },
    { k: "step", id: "ouvir", pt: "Áudio de 0:06 transcrito", en: "0:06 voice note transcribed" },
    { k: "step", id: "reserva", run: 900, book: true, pt: "Amanhã, 10:30, com o Alexandre", en: "Tomorrow, 10:30, with Alexandre" },
    { k: "out", at: "23:48", pt: "Reservado: amanhã, 10:30, corte com o Alexandre. O Corte Ilimitado sai R$ 84,99 por mês, com cortes ilimitados. Quer assinar?", en: "Booked: tomorrow, 10:30, haircut with Alexandre. The Unlimited Haircut plan is R$ 84.99 a month, unlimited cuts. Want to subscribe?" },
    { k: "step", id: "plano", pt: "Corte Ilimitado · R$ 84,99/mês", en: "Unlimited Haircut · R$ 84.99/month" },
    { k: "in", at: "23:49", pt: "quero sim", en: "yes please" },
    { k: "step", id: "cobranca", run: 900, pt: "Link gerado · cartão ou Pix", en: "Link created · card or Pix" },
    { k: "link", at: "23:49", pt: "Aqui está o link. Assim que o pagamento cair, te aviso por aqui.", en: "Here's the link. I'll let you know here as soon as the payment goes through." },
    { k: "pause", ms: 1800 },
    { k: "ok", at: "23:51" },
    { k: "out", at: "23:51", pt: "Pagamento aprovado, plano ativo! Te espero amanhã às 10:30. A tolerância é de 10 minutos 💚", en: "Payment approved, your plan is active! See you tomorrow at 10:30. We hold the slot for 10 minutes 💚" },
    { k: "step", id: "lembrete", pt: "Aviso antes do horário, com confirmação", en: "Reminder before the slot, with confirmation" },
    { k: "end" }
  ];

  /* ---------- Tempo que só corre com a seção na tela ---------- */
  var visible = false, runId = 0, STOP = {};
  function sleep(ms, id) {
    return new Promise(function (ok, fail) {
      var left = ms;
      (function tick() {
        if (id !== runId) return fail(STOP);
        if (visible && !document.hidden) left -= 100;
        if (left <= 0) ok(); else setTimeout(tick, 100);
      })();
    });
  }

  /* ---------- Peças do chat ---------- */
  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var tick = '<i class="tk"><svg viewBox="0 0 16 11"><path d="M1 6l3 3 6-7M6 9l1 1 6-8"/></svg></i>';
  function bubble(step) {
    var L = lang();
    if (step.k === "in") return '<div class="bm bm-in"><p>' + esc(step[L]) + '</p><time>' + step.at + '</time></div>';
    if (step.k === "out") return '<div class="bm bm-out"><span class="bm-ai">' + t("ai") + '</span><p>' + esc(step[L]) + '</p><time>' + step.at + tick + '</time></div>';
    if (step.k === "audio") {
      var bars = "";
      for (var i = 0; i < 30; i++) bars += '<i style="--n:' + i + ';--h:' + Math.min(100, 22 + Math.round(Math.abs(Math.sin(i * 1.7) * 60 + Math.cos(i * .6) * 18))) + '%"></i>';
      return '<div class="bm bm-in bm-audio"><div class="au"><span class="au-play"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg></span><span class="au-wave">' + bars + '</span><span class="au-dur">' + step.dur + '</span></div>' +
        '<p class="au-tr"><span>' + t("tr") + '</span>' + esc(step[L]) + '</p><time>' + step.at + '</time></div>';
    }
    if (step.k === "link") return '<div class="bm bm-out"><span class="bm-ai">' + t("ai") + '</span><span class="bm-link"><span class="bl-ic"><svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18"/></svg></span><span><b>' + t("payT") + '</b><small>' + t("payS") + '</small><small class="bl-url">abdousbarber.com.br</small></span></span><p>' + esc(step[L]) + '</p><time>' + step.at + tick + '</time></div>';
    if (step.k === "ok") return '<div class="bm bm-sys"><span class="sys-ic"><svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></span><span><b>' + t("okT") + '</b><small>' + t("okS") + ' · ' + step.at + '</small></span></div>';
    if (step.k === "typing") return '<div class="bm bm-' + step.side + ' bm-typing"><span class="dots"><i></i><i></i><i></i></span></div>';
    if (step.k === "day") return '<div class="bm bm-day">' + t("today") + '</div>';
    return "";
  }
  function push(html, instant) {
    var w = document.createElement("div");
    w.className = "bc-m" + (instant ? " is-in" : "");
    w.innerHTML = '<div class="bc-mi">' + html + '</div>';
    list.appendChild(w);
    if (!instant) { void w.offsetHeight; w.classList.add("is-in"); }
    // Mensagens que já subiram para fora da tela saem do DOM.
    while (list.children.length > 12) list.removeChild(list.firstChild);
    return w;
  }
  function drop(w) { if (w && w.parentNode) w.parentNode.removeChild(w); }

  /* ---------- Painel e sistema ---------- */
  function setStep(id, state, note) {
    var li = $('[data-step="' + id + '"]');
    if (!li) return;
    li.classList.remove("is-run", "is-done");
    if (state) li.classList.add("is-" + state);
    $("small", li).textContent = note || (state === "run" ? t("run") : t("wait"));
  }
  function flagSlots(ids) {
    $$(".ba-slots li").forEach(function (li) { li.classList.toggle("is-look", ids.indexOf(li.dataset.slot) > -1); });
  }
  function book(on) {
    var li = $('[data-slot="1030"]');
    li.classList.toggle("is-booked", on);
    $("span", li).textContent = on ? t("booked") : (lang() === "en" ? "Free" : "Livre");
  }
  function kpi(on) {
    $('[data-kpi="plano"] b').textContent = on ? t("plan") : "-";
    $('[data-kpi="caixa"] b').textContent = on ? t("cash") : "-";
    $$(".bot-kpis > div").forEach(function (d) { d.classList.toggle("is-on", on); });
  }
  function reset() {
    list.innerHTML = "";
    stage.classList.remove("is-done");
    SCRIPT.forEach(function (s) { if (s.k === "step") setStep(s.id, "", ""); });
    flagSlots([]); book(false); kpi(false);
    status.textContent = t("online");
  }

  /* ---------- Execução ---------- */
  async function play(id) {
    reset();
    push(bubble({ k: "day" }), true);
    await sleep(700, id);
    for (var i = 0; i < SCRIPT.length; i++) {
      var s = SCRIPT[i], L = lang();
      if (s.k === "in" || s.k === "audio") {
        status.textContent = s.k === "audio" ? t("rec") : t("typing");
        await sleep(s.k === "audio" ? 1500 : 1100, id);
        status.textContent = t("online");
        push(bubble(s));
        await sleep(s.k === "audio" ? 1400 : 700, id);
      } else if (s.k === "out" || s.k === "link") {
        var ty = push(bubble({ k: "typing", side: "out" }));
        await sleep(Math.min(2300, 700 + s[L].length * 14), id);
        drop(ty);
        push(bubble(s));
        await sleep(900, id);
      } else if (s.k === "step") {
        if (s.run) {
          setStep(s.id, "run");
          if (s.slots) flagSlots(s.slots);
          await sleep(s.run, id);
        }
        if (s.book) { flagSlots([]); book(true); }
        setStep(s.id, "done", s[L]);
        await sleep(450, id);
      } else if (s.k === "ok") {
        push(bubble(s));
        kpi(true);
        await sleep(900, id);
      } else if (s.k === "pause") {
        await sleep(s.ms, id);
      } else if (s.k === "end") {
        stage.classList.add("is-done");
        await sleep(7000, id);
      }
    }
  }
  // Estado final de uma vez (movimento reduzido): tudo visível, sem animação.
  function still() {
    reset();
    push(bubble({ k: "day" }), true);
    SCRIPT.forEach(function (s) {
      if (s.k === "step") { setStep(s.id, "done", s[lang()]); if (s.book) book(true); }
      else if (s.k === "ok") { push(bubble(s), true); kpi(true); }
      else if (s.k !== "pause" && s.k !== "end") push(bubble(s), true);
    });
    stage.classList.add("is-done");
  }
  function start() {
    var id = ++runId;
    if (reduceMotion) return still();
    (function loop() {
      play(id).then(loop, function (e) { if (e !== STOP) throw e; });
    })();
  }

  var started = false;
  $(".bot-replay").addEventListener("click", function () { started = true; start(); });
  // Troca de idioma recomeça a conversa no idioma novo.
  new MutationObserver(function () { if (started) start(); }).observe(root, { attributes: true, attributeFilter: ["data-lang"] });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible && !started) { started = true; start(); }
    }, { threshold: .3 }).observe(stage);
  } else { visible = true; start(); }
})();
