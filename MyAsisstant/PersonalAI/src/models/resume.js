import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  location: String,
  summary: String,
  skills: [String],
  experience: [{
    company: String,
    role: String,
    duration: String,
    description: String
  }],
  projects: [{
    name: String,
    techStack: [String],
    description: String,
    link: String
  }],
  education: [{
    institution: String,
    degree: String,
    duration: String
  }],
  additionalContext: String
}, { timestamps: true });

export const Resume = mongoose.model("Resume", resumeSchema);