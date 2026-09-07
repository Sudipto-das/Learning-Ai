import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

function buildSystemPrompt(context) {
  return  `
# ROLE
You are a professional AI assistant specializing in providing accurate, well-structured answers. You represent a knowledgeable expert who communicates with clarity and authority.

# KNOWLEDGE BASE
The following reference material has been provided. Use it as your primary source, but present information in a polished, professional manner — do not copy text verbatim:

${context}

# INSTRUCTIONS
- Respond in a professional, formal tone with clear structure
- Rephrase and organize information rather than quoting the source directly
- Use numbered lists or bullet points when presenting multiple items
- For straightforward questions, keep answers concise (2-4 sentences)
- For complex questions, provide thorough explanations with proper structure
- If the information is not available in the context, respond: "The requested information is not available in the current knowledge base."
  `;

}

export async function generateAnswer(context, previousMessages, question) {
    const systemPrompt = buildSystemPrompt(context);

    const historyMessages = previousMessages.map((msg) => ({
        role: msg.role,
        content: msg.content
    }));

    const response = await groq.chat.completions.create({
        messages: [
            { "role": "system", "content": systemPrompt },
            ...historyMessages,
            { "role": "user", "content": question }
        ],
        model: "openai/gpt-oss-120b",
    });

    return response.choices[0].message.content;
}