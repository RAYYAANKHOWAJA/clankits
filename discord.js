// Returns Discord member + online counts from the public invite API (no bot needed).
const CODE = "5vaBee3ygW";
module.exports = async (req, res) => {
  try {
    const r = await fetch(`https://discord.com/api/v10/invites/${CODE}?with_counts=true`);
    if (!r.ok) throw new Error("discord " + r.status);
    const d = await r.json();
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    return res.status(200).json({ members: d.approximate_member_count, online: d.approximate_presence_count });
  } catch (e) {
    return res.status(502).json({ error: "unavailable" });
  }
};
