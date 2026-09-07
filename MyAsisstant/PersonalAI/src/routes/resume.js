import express from 'express';
import { upload, uploadResume } from '../controllers/resumeController.js';

const router = express.Router();

router.post("/upload-resume", upload.single("resume"), uploadResume);

export default router;
