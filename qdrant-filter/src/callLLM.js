import Groq from "groq-sdk";
import { getEmbedder } from "./embeddings.js";
import { searchVectors } from "./storeVector.js";

let groqClient = null;

const getGroqClient = () => {
    if (!groqClient) {
        groqClient = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });
    }
    return groqClient;
};

const SYSTEM_PROMPT = `You are a helpful assistant for an educational institution. 
Answer questions based ONLY on the provided context. 
If the answer is not in the context, say "I don't have information about that in my knowledge base."
Keep answers concise and professional.
Always mention the source when referencing information.`;

export const ragQuery = async (userQuery, category = null) => {
    const embedder = await getEmbedder();
    const output = await embedder(userQuery, {
        pooling: "mean",
        normalize: "true",
    });
    const queryVector = Array.from(output.data);

    const results = await searchVectors(queryVector, category, 3);

    if (results.length === 0) {
        return {
            answer: "I couldn't find any relevant information in the knowledge base.",
            sources: [],
        };
    }

    const context = results
        .map(
            (r, i) =>
                `[${i + 1}] Category: ${r.payload.category} | Source: ${r.payload.source}\n${r.payload.text}`
        )
        .join("\n\n");

    const userMessage = `Context:\n${context}\n\nQuestion: ${userQuery}\n\nAnswer based on the context above:`;

    const client = getGroqClient();
    const completion = await client.chat.completions.create({
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userMessage },
        ],
        model: "openai/gpt-oss-120b",
        temperature: 0.3,
        max_tokens: 500,
    });

    return {
        answer: completion.choices[0].message.content,
        sources: results.map((r) => ({
            text: r.payload.text,
            category: r.payload.category,
            source: r.payload.source,
            score: r.score,
        })),
    };
};
