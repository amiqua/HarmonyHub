import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: './.env' });

async function check() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to DB");

    const usersRes = await client.query('SELECT id, email, username FROM users');
    console.log("Users:", usersRes.rows);

    const songsCountRes = await client.query('SELECT user_id, COUNT(*) as count FROM songs GROUP BY user_id');
    console.log("Songs per user:", songsCountRes.rows);

    const totalSongs = await client.query('SELECT COUNT(*) FROM songs');
    console.log("Total songs in DB:", totalSongs.rows[0].count);

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

check();
