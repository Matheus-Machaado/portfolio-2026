// Gerado por C:/projetos/marca-matheus/v3-noite/visitas/build.mjs. Não editar aqui.
// Devolve os eventos agregados por dia para o painel /visitas/. Exige a chave no header x-chave
// (só o hash dela fica no código publicado).
import { getStore } from "./blobs.mjs";

const HASH = "42451f458c78aa1718dad8cef5c70e25d5ab639f6b0442cdc2bee6d3f3e1e48b";
const fuso = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" });

async function sha256(txt) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(txt));
  return [...new Uint8Array(buf)].map((x) => x.toString(16).padStart(2, "0")).join("");
}

export default async (req) => {
  const chave = req.headers.get("x-chave") || "";
  if (!chave || (await sha256(chave)) !== HASH) return new Response(null, { status: 401 });

  const store = getStore("visitas");
  if (new URL(req.url).searchParams.get("teste") === "1") {
    const { blobs } = await store.list({ prefix: "teste/" });
    return Response.json({ teste: blobs.length }, { headers: { "cache-control": "no-store" } });
  }

  const dias = Math.min(365, Math.max(1, parseInt(new URL(req.url).searchParams.get("dias"), 10) || 30));
  const hoje = fuso.format(new Date());
  const desde = fuso.format(new Date(Date.now() - (dias - 1) * 864e5));

  // lista só os meses do período (as chaves começam com ev/AAAA-MM-DD)
  const meses = [];
  for (let d = new Date(desde.slice(0, 7) + "-01T12:00:00Z"); d.toISOString().slice(0, 7) <= hoje.slice(0, 7); d.setUTCMonth(d.getUTCMonth() + 1)) {
    meses.push(d.toISOString().slice(0, 7));
  }
  const soma = {};
  for (const mes of meses) {
    for await (const pagina of store.list({ prefix: `ev/${mes}`, paginate: true })) {
      for (const { key } of pagina.blobs) {
        const [, dia, e, p, m, l] = key.split("/");
        if (dia < desde) continue;
        const k = [dia, e, p, m, l].join("|");
        soma[k] = (soma[k] || 0) + 1;
      }
    }
  }
  const linhas = Object.entries(soma).map(([k, n]) => {
    const [dia, e, p, m, l] = k.split("|");
    return { dia, e, p, m, l, n };
  });
  return Response.json({ desde, hoje, linhas }, { headers: { "cache-control": "no-store" } });
};

export const config = { path: "/api/visitas" };
