import * as readline from "readline";
import { queryRAG } from "./src/AI/query.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("Order Support Bot - Type your question (Ctrl+C to exit)\n");

rl.question("You: ", async function handleInput(question) {
  if (!question.trim()) {
    rl.question("You: ", handleInput);
    return;
  }

  console.log("\nSearching...\n");

  try {
    const result = await queryRAG(question);
    console.log("Bot:", result.answer, "\n");
  } catch (err) {
    console.error("Error:", err.message, "\n");
  }

  rl.question("You: ", handleInput);
});
