// Gerado por C:/projetos/marca-matheus/v3-noite/visitas/build.mjs. Não editar aqui.
// Recebe um evento do portfólio e guarda como uma chave no Netlify Blobs.
// Sem IP, sem cookie, sem identificador de pessoa: só dia, evento, projeto, canal e idioma.
// A chave inteira é o dado (contar = listar chaves), então dois acessos ao mesmo tempo nunca
// se atropelam como aconteceria com um contador lido e regravado.
import { getStore } from "./blobs.mjs";

const CANAIS = ["whatsapp", "linkedin", "link", "nativo"];
const ORIGENS = ["direto", "google", "busca", "linkedin", "whatsapp", "instagram", "github", "outro"];
const IDS = ["abdous-barber","to-na-porta","psy-trekking","casa-cheia"];
// robôs e prévias de link não contam como visita (inclui o navegador de teste sem tela)
const ROBO = /bot|crawl|spider|slurp|facebookexternalhit|WhatsApp\/|HeadlessChrome|Lighthouse/i;

const vazio = (status) => new Response(null, { status });

function valido(e, p, m) {
  if (e === "visita") return p === "-" && ORIGENS.includes(m);
  if (!IDS.includes(p)) return false;
  if (e === "projeto") return m === "-";
  if (e === "compartilhou" || e === "chegou") return CANAIS.includes(m);
  return false;
}

export default async (req) => {
  if (req.method !== "POST") return vazio(405);
  if (ROBO.test(req.headers.get("user-agent") || "")) return vazio(204);
  let b;
  try {
    const txt = await req.text();
    if (txt.length > 300) return vazio(413);
    b = JSON.parse(txt);
  } catch {
    return vazio(400);
  }
  const e = String(b.e || ""), p = String(b.p || "-"), m = String(b.m || "-"), l = b.l === "en" ? "en" : "pt";
  if (!valido(e, p, m)) return vazio(400);
  const dia = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
  const sufixo = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  // t: 1 grava fora do ev/ (conferência depois de publicar, não entra na contagem)
  const pasta = b.t === 1 ? "teste" : "ev";
  await getStore("visitas").set(`${pasta}/${dia}/${e}/${p}/${m}/${l}/${sufixo}`, "1");
  return vazio(204);
};

export const config = { path: "/api/visita" };
