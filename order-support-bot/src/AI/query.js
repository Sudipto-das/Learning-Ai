import { getEmbedding } from "./embeddings.js";
import { COLLECTION, qdrant, groq } from "./config.js";

function buildContext(results) {
  return results
    .map((r) => r.payload?.text)
    .filter(Boolean)
    .join("\n\n");
}

function getSystemPrompt(context) {
  return `You are a friendly and professional Order Support Assistant for an e-commerce platform. Your job is to help customers with their order-related queries.

RULES:
1. ALWAYS answer based on the provided context. Do NOT make up information.
2. You can reply in ENGLISH or HINGLISH (Hindi written in English script). Do NOT reply in Hindi (Devanagari script).
3. Do NOT simply copy-paste the raw context as your answer. Instead, UNDERSTAND the context and GENERATE a clear, helpful, and natural response.
4. If the context does not contain enough information to answer the question, politely say: "Sorry, I don't have enough information to answer that. Please contact our support team for more help."
5. Keep your answers concise, polite, and to the point.
6. If the user asks about order status, delivery, returns, or refunds, extract the relevant details from the context and explain them clearly.
7. Use a friendly tone. Greet the user if they say hello, and thank them at the end if appropriate.
8. Do NOT use markdown formatting like **bold** or bullet points. Write in plain text with clear paragraphs and line breaks.

CONTEXT:\n${context}`;
}

async function searchContext(userQuestion) {
  const questionEmbedding = await getEmbedding(userQuestion);

  const { points: results } = await qdrant.query(COLLECTION, {
    query: questionEmbedding,
    limit: 5,
    with_payload: true,
  });

  const context = buildContext(results);
  const sources = results.map((r) => ({
    text: r.payload?.text,
    score: r.score,
    metadata: r.payload,
  }));

  return { context, sources };
}

export async function queryRAG(userQuestion) {
  const { context, sources } = await searchContext(userQuestion);

  const chatCompletion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: getSystemPrompt(context) },
      { role: "user", content: userQuestion },
    ],
    model: "openai/gpt-oss-120b",
    temperature: 0.3,
    max_tokens: 1024,
  });

  return { answer: chatCompletion.choices[0].message.content, sources };
}

export async function queryRAGStream(userQuestion, onToken) {
  const { context, sources } = await searchContext(userQuestion);

  const stream = await groq.chat.completions.create({
    messages: [
      { role: "system", content: getSystemPrompt(context) },
      { role: "user", content: userQuestion },
    ],
    model: "openai/gpt-oss-120b",
    temperature: 0.3,
    max_tokens: 1024,
    stream: true,
  });

  for await (const chunk of stream) {
    const token = chunk.choices[0]?.delta?.content;
    if (token) onToken(token);
  }

  return { sources };
}
