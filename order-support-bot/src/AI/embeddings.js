import { pipeline } from "@xenova/transformers";

let embedder = null;

async function loadModel() {
  if (!embedder) {
    console.log("Loading embedding model (Xenova/all-MiniLM-L6-v2)...");
    embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    console.log("Model loaded successfully!");
  }
  return embedder;
}

export async function getEmbedding(text) {
  const model = await loadModel();
  const result = await model(text, { pooling: "mean", normalize: true });
  return Array.from(result.data);
}

export async function getBatchEmbeddings(texts) {
  const model = await loadModel();
  const embeddings = [];
  for (const text of texts) {
    const result = await model(text, { pooling: "mean", normalize: true });
    embeddings.push(Array.from(result.data));
  }
  return embeddings;
}
