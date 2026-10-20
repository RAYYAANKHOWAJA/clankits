// Verifies a Cloudflare Turnstile token. Needs env var TURNSTILE_SECRET on Vercel.
module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ success: false });
  const token = req.body && req.body.token;
  if (!token || !process.env.TURNSTILE_SECRET) return res.status(400).json({ success: false });
  try {
    const body = new URLSearchParams({
      secret: process.env.TURNSTILE_SECRET,
      response: token,
      remoteip: (req.headers["x-forwarded-for"] || "").split(",")[0].trim(),
    });
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const d = await r.json();
    return res.status(200).json({ success: !!d.success });
  } catch (e) {
    return res.status(500).json({ success: false });
  }
};
