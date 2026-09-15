import express from "express";
import cors from "cors";
import "dotenv/config";
import { queryRAG, queryRAGStream } from "./AI/query.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post("/api/query", async (req, res) => {
  const { question } = req.body;

  if (!question || !question.trim()) {
    return res.status(400).json({ error: "Question is required" });
  }

  try {
    const result = await queryRAG(question);
    res.json({ answer: result.answer, sources: result.sources });
  } catch (err) {
    console.error("Query error:", err.message);
    res.status(500).json({ error: "Failed to process your question" });
  }
});

app.post("/api/query/stream", async (req, res) => {
  const { question } = req.body;

  if (!question || !question.trim()) {
    return res.status(400).json({ error: "Question is required" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const { sources } = await queryRAGStream(question, (token) => {
      res.write(`data: ${JSON.stringify({ token })}\n\n`);
    });

    res.write(`data: ${JSON.stringify({ done: true, sources })}\n\n`);
    res.end();
  } catch (err) {
    console.error("Stream error:", err.message);
    res.write(`data: ${JSON.stringify({ error: "Failed to process your question" })}\n\n`);
    res.end();
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
