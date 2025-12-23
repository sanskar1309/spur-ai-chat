import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import chatRouter from "./routes/chat.route";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/chat", chatRouter);

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
