import { Router } from "express";
import { handleMessage } from "../services/chat.service";

const router = Router();

router.post("/message", async (req, res) => {
  const { message, sessionId } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: "Message cannot be empty" });
  }

  if (message.length > 1000) {
    return res.status(400).json({ error: "Message too long" });
  }

  const result = await handleMessage(message, sessionId);
  res.json(result);
});

export default router;
