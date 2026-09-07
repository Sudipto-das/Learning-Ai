require('dotenv').config();
const Groq = require('groq-sdk');

const client = new Groq({ api_key: process.env.GROQ_API_KEY })


async function callLLM(systemPrompt, userPrompt) {
  const response = await client.chat.completions.create({
    model: "openai/gpt-oss-120b",
    temperature: 0,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });
  return response.choices[0].message.content.trim();
}

const rawCommits = `
fix: resolve null pointer in login handler
feat: add dark mode toggle to settings page
chore: bump dependencies to latest versions
fix: correct typo in error message
feat: implement CSV export for reports
refactor: simplify auth middleware logic
`;


async function generateChangeLog(commits) {

    console.log("STEP 1: Categorizing commits...\n");

    const step1Output = await callLLM(
        "You are a git commit classifier. Group commits into three categories: Features, Fixes, Chores. Output as clean bullet points under each heading. Do not explain, do not add extra commentary.",
        commits
    );
    console.log(step1Output);
    console.log("\n" + "-".repeat(50) + "\n");

    console.log("STEP 2: Rewriting in user-friendly language...\n");

    const step2Output = await callLLM(
        "You are a technical writer. Rewrite these categorized commit messages into short, user-friendly changelog entries. Keep the same headings and structure. Avoid developer jargon.",
        step1Output
    );

    console.log(step2Output);
    console.log("\n" + "-".repeat(50) + "\n");

    const step3Output = await callLLM(
        "You are a release notes editor. Take this changelog draft and polish it: add a version-style heading, tighten the wording, and format it in clean markdown ready to publish.",
        step2Output
    );

    console.log(step3Output);
    console.log("\n" + "=".repeat(50));
    console.log("FINAL CHANGELOG READY");
    console.log("=".repeat(50));

    return step3Output;


}

generateChangeLog(rawCommits)