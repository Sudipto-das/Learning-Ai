import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildKnowledgeBaseIndex } from '../service/vectorStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['text/plain', 'text/markdown', 'text/csv', 'application/json'];
  const allowedExts = ['.txt', '.md', '.csv', '.json'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(file.mimetype) || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only .txt, .md, .csv, .json files are allowed"), false);
  }
};

export const uploadKB = multer({ storage, fileFilter });

export const uploadKnowledgeBase = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = req.file.path;
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const fileName = req.file.originalname;

    fs.unlinkSync(filePath);

    if (!fileContent || fileContent.trim().length === 0) {
      return res.status(400).json({ message: "File is empty" });
    }

    const result = await buildKnowledgeBaseIndex(fileContent, fileName);

    res.json({
      success: true,
      message: `Knowledge base "${fileName}" processed and stored in vector database`,
      data: {
        source: fileName,
        chunksCount: result.chunksCount
      }
    });

  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: "Error processing knowledge base file", error: error.message });
  }
};
