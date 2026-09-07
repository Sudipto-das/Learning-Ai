import multer from 'multer';
import { PDFParse } from 'pdf-parse';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractResumeData } from '../service/extractResume.js';
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
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const dataBuffer = fs.readFileSync(req.file.path);
    const parser = new PDFParse({ data: dataBuffer });
    const result = await parser.getText();
    const resumeText = result.text;
    await parser.destroy();

    fs.unlinkSync(req.file.path);

    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({ message: "Could not extract text from PDF" });
    }

    const extractedData = await extractResumeData(resumeText);

    const knowledgeBaseContent = JSON.stringify(extractedData, null, 2);
    const vectorResult = await buildKnowledgeBaseIndex(knowledgeBaseContent, 'resume.pdf');

    res.json({
      success: true,
      message: "Resume processed and stored in vector database",
      data: {
        extractedData,
        vectorStorage: vectorResult
      }
    });

  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: "Error parsing PDF", error: error.message });
  }
};

export { upload, uploadResume };
