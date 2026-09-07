import { QdrantClient } from "@qdrant/js-client-rest";
import { genarateEmbeddings } from "./embeddings.js";

const COLLECTION_NAME = "knowledge_base";
const VECTOR_DIMENSION = 384; // MiniLM-L6-v2 dimension

let qdrantClient = null;

export const getQdrantClient = () => {
    if (!qdrantClient) {
        qdrantClient = new QdrantClient({
            url: process.env.QDRANT_URL,
            apiKey: process.env.QDRANT_API_KEY,
        });
    }
    return qdrantClient;
};

export const createCollection = async () => {
    const client = getQdrantClient();

    try {
        await client.getCollection(COLLECTION_NAME);
        console.log(`Collection "${COLLECTION_NAME}" already exists`);
    } catch (error) {
        if (error.status === 404 || error.message?.includes("not found")) {
            await client.createCollection(COLLECTION_NAME, {
                vectors: {
                    size: VECTOR_DIMENSION,
                    distance: "Cosine",
                },
            });
            console.log(`Collection "${COLLECTION_NAME}" created`);

            await client.createPayloadIndex(COLLECTION_NAME, {
                field_name: "category",
                field_schema: "keyword",
            });
            console.log("Index created on 'category' field");
        } else {
            throw error;
        }
    }
};

export const storeEmbeddings = async () => {
    const client = getQdrantClient();
    const embeddings = await genarateEmbeddings();

    const points = embeddings.map((item) => ({
        id: item.id,
        vector: item.vector,
        payload: {
            text: item.text,
            category: item.category,
            source: item.source,
        },
    }));

    await client.upsert(COLLECTION_NAME, {
        points,
    });

    console.log(`Stored ${points.length} vectors in Qdrant`);
    return points.length;
};

export const searchVectors = async (queryVector, category = null, limit = 3) => {
    const client = getQdrantClient();

    const searchParams = {
        query: queryVector,
        limit,
        with_payload: true,
    };

    if (category) {
        searchParams.filter = {
            must: [
                {
                    key: "category",
                    match: { value: category },
                },
            ],
        };
    }

    const results = await client.query(COLLECTION_NAME, searchParams);
    return results.points;
};
