import { Router, Request, Response } from "express";
import { handleMessage, getConversationHistory } from "../services/chat.service";

const router = Router();

// GET endpoint to fetch conversation history by sessionId
router.get("/history/:sessionId", async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId || !sessionId.trim()) {
      return res.status(400).json({ error: "Session ID is required" });
    }

    const history = await getConversationHistory(sessionId);
    res.json({ messages: history });
  } catch (error) {
    console.error("Error fetching conversation history:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.post("/message", async (req: Request, res: Response) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    if (message.length > 1000) {
      return res.status(400).json({ error: "Message too long" });
    }

    const result = await handleMessage(message, sessionId);
    res.json(result);
  } catch (error) {
    console.error("Error handling message:", error);
    res.status(500).json({ 
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;
