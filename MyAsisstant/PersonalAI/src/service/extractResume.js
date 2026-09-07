import Groq from 'groq-sdk'
import { z } from 'zod'
import { ResumeSchema } from '../schema/resumeSchema.js'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const jsonSchema = z.toJSONSchema(ResumeSchema, { target: "draft-07" })

const EXTRACTION_PROMPT = `
You are a resume parser. Extract data from the resume text below and return ONLY valid JSON matching this exact structure:

${JSON.stringify(jsonSchema,null,2)}

Rules:
- Return ONLY the JSON object, no markdown, no preamble, no explanation.
- All fields must be present. If a field is not found, use an empty string "" or empty array [].
- Do not hallucinate any information not present in the resume text.
`;


export async function extractResumeData(resumeText) {

    const response = await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages: [
            { "role": "system", "content": EXTRACTION_PROMPT },
            { "role": "user", "content": resumeText }
        ],
        response_format: {
        type: "json_schema",
        json_schema: {
            name: "resume",
            schema: z.toJSONSchema(ResumeSchema, { target: "draft-07" })
        }
    }
    })

    const raw_data = response.choices[0].message.content;

    const persed = JSON.parse(raw_data);
    const result = ResumeSchema.safeParse(persed);


    if (!result.success) {
        console.error("Validation failed:", result.error.issues);
        throw new Error("Resume extraction did not match schema");
    }


    return result.data

} 