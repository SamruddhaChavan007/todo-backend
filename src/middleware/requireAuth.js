const pool = require("../config/db");
const { sha256Hex } = require("../utils/token");

async function requireAuth(req, res, next) {
  try {
    const rawToken = req.header("X-Token");
    if (!rawToken) {
      return res.status(401).json({ error: "Missing X-Token" });
    }

    const tokenHash = sha256Hex(rawToken);

    const { rows } = await pool.query(
      `
      SELECT user_id
      FROM public.user_tokens
      WHERE token_hash = $1
        AND revoked = false
        AND expires_at > NOW()
      LIMIT 1
      `,
      [tokenHash]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    req.userId = rows[0].user_id;
    req.tokenHash = tokenHash;

    // Best effort update (do not break request if it fails)
    pool
      .query(`UPDATE public.user_tokens SET last_used_at = NOW() WHERE token_hash = $1`, [tokenHash])
      .catch(() => {});

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = requireAuth;