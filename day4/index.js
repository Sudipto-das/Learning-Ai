require('dotenv').config();
const Groq = require('groq-sdk');

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Tools
function getWeather(city) {
  const weatherData = {
    delhi: "32°C, Cloudy",
    mumbai: "34°C, Humid",
    bangalore: "25°C, Pleasant",
    kolkata: "33°C, Rainy",
  };
  const cityLower = city.toLowerCase().trim();
  if (weatherData[cityLower]) {
    return `${city} ka weather: ${weatherData[cityLower]}`;
  }
  return `${city} ka weather data nahi mila`;
}

const TOOLS = {
  weather: getWeather,
};

// ReAct prompt
function reactPrompt(question) {
  const toolsDescription = `Available Tools:
1. weather(city) - Weather check karne ke liye. Example: weather(Delhi)`;

  return `You are a helpful assistant. You MUST follow this exact format:

Thought: [Socho kya karna hai]
Action: tool_name(arguments)
Observation: [Tool ka result yahan aayega - mat likho, mujhe milega]
... (repeat Thought/Action/Observation jab tak answer na mile)
Thought: Ab mujhe sab kuch pata hai
Final Answer: [Final answer yahan likho]

${toolsDescription}

IMPORTANT RULES:
- Har step me sirf EK Action do
- Action me tool ka naam aur arguments do
- Format EXACTLY aisa hona chahiye: Action: calculator(2 + 2)
- Observation mat likho, wo auto aayega
- Jab answer mil jaaye to Final Answer me likho

Question: ${question}`;
}

// Action parser
function parseAction(text) {
  const match = text.match(/Action:\s*(\w+)\((.+?)\)/);
  if (match) {
    const toolName = match[1];
    const toolArgs = match[2].replace(/['"]/g, '').trim();
    return { toolName, toolArgs };
  }
  return { toolName: null, toolArgs: null };
}

// Main ReAct loop
async function runReact(question, maxIterations = 5) {
  const messages = [
    { role: "system", content: "You are a helpful ReAct agent. Follow the Thought/Action/Observation format strictly." }
  ];

  const prompt = reactPrompt(question);
  messages.push({ role: "user", content: prompt });

  for (let i = 0; i < maxIterations; i++) {
    // LLM call
    const response = await client.chat.completions.create({
      messages,
      model: "openai/gpt-oss-120b",
      temperature: 0,
    });

    const llmOutput = response.choices[0].message.content;
    console.log(`\nLLM Output:\n${llmOutput}`);

    const { toolName, toolArgs } = parseAction(llmOutput);

    // Pehle Action check karo, fir Final Answer
    if (toolName && TOOLS[toolName]) {
      console.log(`\n>> Calling Tool: ${toolName}(${toolArgs})`);
      const toolResult = TOOLS[toolName](toolArgs);
      console.log(`>> Result: ${toolResult}`);

      messages.push({ role: "assistant", content: llmOutput });
      messages.push({ role: "user", content: `Observation: ${toolResult}` });
    } else if (llmOutput.includes("Final Answer")) {
      const finalAnswer = llmOutput.split("Final Answer:").pop().trim();
      console.log(`\n${"=".repeat(50)}`);
      console.log(`ANSWER: ${finalAnswer}`);
      console.log("=".repeat(50));
      return finalAnswer;
    } else {
      console.log(`\n>> Tool '${toolName}' nahi mila!`);
      messages.push({ role: "assistant", content: llmOutput });
      messages.push({ role: "user", content: "Observation: Tool not found. Please use available tools." });
    }
  }

  return "Max iterations ho gaye, answer nahi mil paya.";
}

// Run
const questions = [
  "Delhi ka weather kaisa hai?",
  "Mumbai ka weather kaisa hai?",
];

(async () => {
  for (const q of questions) {
    await runReact(q);
    console.log("\n");
  }
})();
