import express from 'express';
import { uploadKB, uploadKnowledgeBase } from '../controllers/knowledgeBaseController.js';

const router = express.Router();

router.post("/upload-knowledge-base", uploadKB.single("file"), uploadKnowledgeBase);

export default router;
