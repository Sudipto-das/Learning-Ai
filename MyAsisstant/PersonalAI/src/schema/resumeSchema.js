import {z} from 'zod'

export const ResumeSchema = z.object({
  name: z.string().default(""),
  email: z.string().default(""),
  phone: z.string().default(""),
  location: z.string().default(""),
  summary: z.string().default(""),
  skills: z.array(z.string()).default([]),
  experience: z.array(z.object({
    company: z.string(),
    role: z.string(),
    duration: z.string(),
    description: z.string()
  })).default([]),
  projects: z.array(z.object({
    name: z.string(),
    techStack: z.array(z.string()),
    description: z.string(),
    link: z.string().default("")
  })).default([]),
  education: z.array(z.object({
    institution: z.string(),
    degree: z.string(),
    duration: z.string()
  })).default([]),
  additionalContext: z.string().default("")
})