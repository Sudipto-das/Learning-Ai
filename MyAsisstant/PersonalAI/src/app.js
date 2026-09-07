import express from 'express';
import cors from 'cors';
import resumeRoutes from './routes/resume.js';
import chatRoutes from './routes/chat.js';
import knowledgeBaseRoutes from './routes/knowledgeBase.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "PersonalAI API is running" });
});

app.use("/api", resumeRoutes);
app.use("/api", chatRoutes);
app.use("/api", knowledgeBaseRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

export default app;
