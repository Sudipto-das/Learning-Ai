import "dotenv/config";
import readline from "readline";
import { createCollection, storeEmbeddings } from "./src/storeVector.js";
import { ragQuery } from "./src/callLLM.js";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const setup = async () => {
    console.log("=== RAG Pipeline Setup ===\n");

    console.log("1. Creating Qdrant collection...");
    await createCollection();

    console.log("2. Generating embeddings & storing vectors...");
    await storeEmbeddings();

    console.log("\n=== Setup Complete ===\n");
};

const askQuestion = () => {
    rl.question(
        "Ask a question (or 'quit' to exit, 'filter:category' to filter):\n> ",
        async (input) => {
            const trimmed = input.trim();

            if (trimmed.toLowerCase() === "quit") {
                console.log("Goodbye!");
                rl.close();
                process.exit(0);
            }

            let category = null;
            let query = trimmed;

            if (trimmed.toLowerCase().startsWith("filter:")) {
                const parts = trimmed.split(":");
                category = parts[1]?.trim();
                query = parts.slice(2).join(":").trim();
                console.log(`\nFiltering by category: "${category}"`);
            }

            if (!query) {
                console.log("Please enter a question.\n");
                askQuestion();
                return;
            }

            try {
                console.log("\nSearching knowledge base...");
                const result = await ragQuery(query, category);

                console.log("\n--- Answer ---");
                console.log(result.answer);

                if (result.sources.length > 0) {
                    console.log("\n--- Sources ---");
                    result.sources.forEach((s, i) => {
                        console.log(
                            `  [${i + 1}] (${s.category}) ${s.source} | Score: ${s.score.toFixed(4)}`
                        );
                    });
                }
                console.log("");
            } catch (error) {
                console.error("Error:", error.message);
            }

            askQuestion();
        }
    );
};

const main = async () => {
    try {
        await setup();
        askQuestion();
    } catch (error) {
        console.error("Startup error:", error.message);
        process.exit(1);
    }
};

main();
