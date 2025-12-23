import sqlite3 from "sqlite3";

const db = new sqlite3.Database("chat.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      created_at TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT,
      sender TEXT,
      text TEXT,
      created_at TEXT
    )
  `);
});

export default db;
