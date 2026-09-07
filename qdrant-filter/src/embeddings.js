import { pipeline } from "@huggingface/transformers";
import { knowladge } from "./knowladgeData.js"

let embedder = null
export const getEmbedder = async () => {
    if (!embedder) {
        embedder = await pipeline('feature-extraction', 'onnx-community/all-MiniLM-L6-v2-ONNX')
    }
    return embedder;
}

export const genarateEmbeddings = async () => {

    const model = await getEmbedder()
    const results = []

    for (const entry of knowladge) {
        
        const output = await model(entry.text, { pooling: 'mean', normalize: "true" })
        results.push({
            id: entry.id,
            vector: Array.from(output.data),
            text: entry.text,
            category: entry.category,
            source: entry.source,
        });

    }
    return results

}


