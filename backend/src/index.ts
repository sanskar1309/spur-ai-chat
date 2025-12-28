import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import chatRouter from "./routes/chat.route";

// Validate required environment variables
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
if (!OPENROUTER_API_KEY) {
  console.error("❌ ERROR: OPENROUTER_API_KEY is not set in environment variables");
  console.error("Please create a .env file in the backend directory with:");
  console.error("OPENROUTER_API_KEY=your_api_key_here");
  process.exit(1);
}

const app = express();

// CORS configuration - allow all origins in development, restrict in production
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3004", "http://localhost:3000"];

app.use(cors({
  origin: process.env.NODE_ENV === "production" 
    ? allowedOrigins 
    : true, // Allow all in development
  credentials: true
}));
app.use(express.json());

app.use("/chat", chatRouter);

// Health check endpoint
app.get("/health", (req: express.Request, res: express.Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
  console.log(`✅ OpenRouter API key loaded: ${OPENROUTER_API_KEY ? "Yes" : "No"}`);
});
