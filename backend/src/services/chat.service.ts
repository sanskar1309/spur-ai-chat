import db from "../db";
import { v4 as uuid } from "uuid";
import { generateReply } from "./llm.service";

/* ---------- small async helpers ---------- */
function run(query: string, params: any[] = []) {
  return new Promise<void>((resolve, reject) => {
    db.run(query, params, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function all(query: string, params: any[] = []) {
  return new Promise<any[]>((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

/* ---------- main handler ---------- */
export async function handleMessage(
  message: string,
  sessionId?: string
) {
  const conversationId = sessionId || uuid();
  const now = new Date().toISOString();

  // create conversation if new
  if (!sessionId) {
    await run(
      `INSERT INTO conversations (id, created_at) VALUES (?, ?)`,
      [conversationId, now]
    );
  }

  // save user message
  await run(
    `INSERT INTO messages (id, conversation_id, sender, text, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [uuid(), conversationId, "user", message, now]
  );

  // fetch last 10 messages
  const rows = await all(
  `SELECT sender, text FROM messages
   WHERE conversation_id = ?
   ORDER BY created_at DESC
   LIMIT 10`,
  [conversationId]
  );

  const history: { role: "user" | "assistant"; content: string }[] =
  rows.reverse().map((r: any) => ({
    role: r.sender === "user" ? "user" : "assistant",
    content: String(r.text),
  }));

  // generate AI reply
  const reply = await generateReply(history, message);

  // save AI reply
  await run(
    `INSERT INTO messages (id, conversation_id, sender, text, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [uuid(), conversationId, "ai", reply, new Date().toISOString()]
  );

  return { reply, sessionId: conversationId };
}

/* ---------- fetch conversation history ---------- */
export async function getConversationHistory(sessionId: string) {
  const rows = await all(
    `SELECT sender, text, created_at FROM messages
     WHERE conversation_id = ?
     ORDER BY created_at ASC`,
    [sessionId]
  );

  return rows.map((r: any) => ({
    sender: r.sender === "user" ? "user" : "ai",
    text: String(r.text),
    timestamp: new Date(r.created_at).getTime(),
  }));
}
