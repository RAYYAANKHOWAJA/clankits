// Public endpoint the website reads. Returns the last data sent by the server.
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

module.exports = async (req, res) => {
  try {
    if (!URL_ || !TOKEN) throw new Error("no storage");
    const r = await fetch(URL_, {
      method: "POST",
      headers: { Authorization: "Bearer " + TOKEN },
      body: JSON.stringify(["GET", "clankits:leaderboard"]),
    });
    const d = await r.json();
    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=120");
    return res.status(200).json(d.result ? JSON.parse(d.result) : {});
  } catch (e) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({});
  }
};
