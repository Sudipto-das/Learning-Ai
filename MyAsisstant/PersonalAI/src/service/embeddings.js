import { pipeline } from "@xenova/transformers"


let embedder = null

export async function getEmbedder() {
  if (!embedder) {
    // Pehli baar call hone pe model download + load hota hai (~90MB, one-time)
    embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return embedder; // baad me sirf yahi cached instance reuse hoga
}


export async function generateEmbedding(text) {
  const model = await getEmbedder();
  const output = await model(text, { pooling: "mean", normalize: true });
  return Array.from(output.data); // 384-length number array
}

