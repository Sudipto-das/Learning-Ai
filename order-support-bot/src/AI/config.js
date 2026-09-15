import { QdrantClient } from "@qdrant/js-client-rest";
import Groq from "groq-sdk";
import "dotenv/config";


export const COLLECTION = "order_support";

export const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});


export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});
