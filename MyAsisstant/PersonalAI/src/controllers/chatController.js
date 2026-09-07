import { generateAnswer } from "../service/generateAnswer.js";
import { retrieveRelevantChunks } from "../service/vectorStore.js";
import { Chat } from '../models/chat.js';

export const chatWithAssistant = async (req, res) => {
    try {
        const { question, sessionId } = req.body;

        if (!question || !sessionId) {
            return res.status(400).json({ message: "question and sessionId are required" });
        }

        const relevantChunks = await retrieveRelevantChunks(question, 3);

        if (!relevantChunks || relevantChunks.length === 0) {
            return res.status(404).json({ message: "No knowledge base found. Please upload a document first." });
        }

        const context = relevantChunks.join('\n\n');

        let chat = await Chat.findOne({ sessionId });
        if (!chat) {
            chat = await Chat.create({ sessionId, messages: [] });
        }

        const answer = await generateAnswer(context, chat.messages, question);

        chat.messages.push({ role: "user", content: question });
        chat.messages.push({ role: "assistant", content: answer });
        await chat.save();

        res.status(200).json({ answer });
    } catch (error) {
        res.status(500).json({ message: "Error generating answer", error: error.message });
    }
};
