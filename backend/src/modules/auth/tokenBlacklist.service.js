import { db } from "../../config/db.js";

export async function addToBlacklist(token, userId, expiresAt) {
  try {
    await db.query(
      `INSERT INTO token_blacklist (token, user_id, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (token) DO NOTHING;`,
      [token, userId, new Date(expiresAt * 1000)]
    );
  } catch (err) {
    console.error("[tokenBlacklist] Failed to add token to blacklist:", err);
  }
}

export async function isBlacklisted(token) {
  try {
    const result = await db.query(
      `SELECT id FROM token_blacklist WHERE token = $1 AND expires_at > NOW()`,
      [token]
    );
    return result.rows.length > 0;
  } catch (err) {
    console.error("[tokenBlacklist] Failed to check blacklist:", err);
    return false;
  }
}

export async function cleanupExpiredTokens() {
  try {
    const result = await db.query(
      `DELETE FROM token_blacklist WHERE expires_at <= NOW()`
    );
    console.log(`[tokenBlacklist] Cleaned up ${result.rowCount} expired tokens`);
  } catch (err) {
    console.error("[tokenBlacklist] Failed to cleanup tokens:", err);
  }
}
