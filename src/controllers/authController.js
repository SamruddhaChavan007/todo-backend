const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");
const { generateRawToken, sha256Hex } = require("../utils/token");

function getDeviceName(req) {
  return req.header("X-Device-Name") || req.header("User-Agent") || null;
}

async function register(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const existing = await pool.query(
      'SELECT id FROM public.users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const userId = uuidv4();

    await pool.query(
      `INSERT INTO public.users (id, email, password_hash, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [userId, email.toLowerCase(), passwordHash]
    );

    const rawToken = generateRawToken();
    const tokenHash = sha256Hex(rawToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await pool.query(
      `INSERT INTO public.user_tokens
       (user_id, token_hash, expires_at, device_name, last_used_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [userId, tokenHash, expiresAt, getDeviceName(req)]
    );

    return res.status(201).json({ token: rawToken, userId });
  } catch (e) {
    console.error("REGISTER ERROR:", e);
    return res.status(500).json({ error: e.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const { rows } = await pool.query(
      'SELECT id, password_hash FROM public.users WHERE email = $1 LIMIT 1',
      [email.toLowerCase()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, rows[0].password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const rawToken = generateRawToken();
    const tokenHash = sha256Hex(rawToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await pool.query(
      `INSERT INTO public.user_tokens
       (user_id, token_hash, expires_at, device_name, last_used_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [rows[0].id, tokenHash, expiresAt, getDeviceName(req)]
    );

    return res.status(200).json({ token: rawToken, userId: rows[0].id });
  } catch (e) {
    console.error("LOGIN ERROR:", e);
    return res.status(500).json({ error: e.message });
  }
}

async function logout(req, res) {
  try {
    const rawToken = req.header("X-Token");
    if (!rawToken) {
      return res.status(400).json({ error: "Missing X-Token" });
    }

    const tokenHash = sha256Hex(rawToken);
    await pool.query(
      'UPDATE public.user_tokens SET revoked = true WHERE token_hash = $1',
      [tokenHash]
    );

    return res.status(200).json({ status: "OK" });
  } catch (e) {
    console.error("LOGOUT ERROR:", e);
    return res.status(500).json({ error: e.message });
  }
}

module.exports = { register, login, logout };