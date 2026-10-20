// Receives leaderboard data from the Minecraft server (Skript) and stores it in Upstash Redis.
// Env vars: LEADERBOARD_SECRET, plus KV_REST_API_URL / KV_REST_API_TOKEN (added by the Upstash integration).
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

function clean(list) {
  if (!Array.isArray(list)) return [];
  return list.slice(0, 10).map(r => ({
    name: String((r && r.name) || "Unknown").slice(0, 32),
    value: Number(r && r.value) || 0,
  }));
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ ok: false });
  const secret = process.env.LEADERBOARD_SECRET;
  if (!secret || req.headers.authorization !== "Bearer " + secret) return res.status(401).json({ ok: false });
  if (!URL_ || !TOKEN) return res.status(500).json({ ok: false, error: "storage not configured" });
  let b = req.body;
  if (typeof b === "string") { try { b = JSON.parse(b); } catch (e) { return res.status(400).json({ ok: false }); } }
  if (!b || typeof b !== "object") return res.status(400).json({ ok: false });
  const data = {
    updated: Date.now(),
    money: clean(b.money), coins: clean(b.coins), kills: clean(b.kills), deaths: clean(b.deaths),
  };
  try {
    const r = await fetch(URL_, {
      method: "POST",
      headers: { Authorization: "Bearer " + TOKEN },
      body: JSON.stringify(["SET", "clankits:leaderboard", JSON.stringify(data)]),
    });
    if (!r.ok) throw new Error("redis " + r.status);
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(502).json({ ok: false });
  }
};
