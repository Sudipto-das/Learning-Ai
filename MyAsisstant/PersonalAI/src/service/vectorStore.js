import { qdrant } from './qdrantClient.js';
import { generateEmbedding } from './embeddings.js';
import { chunkText } from './chunker.js';

const COLLECTION_NAME = 'knowledge_base';
const VECTOR_SIZE = 384;

export async function createCollection() {
    const collections = await qdrant.getCollections();
    const exists = collections.collections.some((c) => c.name === COLLECTION_NAME);

    if (!exists) {
        await qdrant.createCollection(COLLECTION_NAME, {
            vectors: { size: VECTOR_SIZE, distance: "Cosine" }
        });
    }
}

export async function buildKnowledgeBaseIndex(text, sourceFile) {
    await createCollection();

    const chunks = chunkText(text);

    const points = [];
    for (let i = 0; i < chunks.length; i++) {
        const vector = await generateEmbedding(chunks[i]);
        points.push({
            id: crypto.randomUUID(),
            vector,
            payload: { text: chunks[i], source: sourceFile, chunkIndex: i }
        });
    }

    if (points.length > 0) {
        await qdrant.upsert(COLLECTION_NAME, { points });
    }

    return { chunksCount: points.length, source: sourceFile };
}

export async function retrieveRelevantChunks(question, topK = 3) {
    const queryVector = await generateEmbedding(question);

    const results = await qdrant.query(COLLECTION_NAME, {
        query: queryVector,
        limit: topK,
        with_payload: true
    });
    return results.points.map((r) => r.payload.text);
} 