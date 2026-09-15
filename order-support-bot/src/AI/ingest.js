import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { v4 as uuid } from "uuid";
import { getBatchEmbeddings } from "../AI/embeddings.js";
import { COLLECTION, qdrant } from "../AI/config.js";

const DATA_DIR = path.join(process.cwd(), "data");



function loadProducts() {
  const csv = fs.readFileSync(path.join(DATA_DIR, "products.csv"), "utf-8");
  const records = parse(csv, { columns: true, skip_empty_lines: true });

  return records.map((row) => ({
    text: `Product: ${row.name}. Category: ${row.category}. Price: ₹${row.price}. Sizes: ${row.sizes}. Colors: ${row.colors}. Material: ${row.material}. Stock: ${row.stock}. Description: ${row.description}`,
    source: "products.csv",
    product_id: Number(row.id),
    category: row.category,
  }));
}

function loadFAQs() {
  const raw = fs.readFileSync(path.join(DATA_DIR, "faqs.txt"), "utf-8");
  const blocks = raw.split(/\n\n+/).filter(Boolean);

  return blocks.map((block) => {
    const lines = block.trim().split("\n");
    const question = lines[0].replace(/^Q:\s*/, "");
    const answer = lines
      .slice(1)
      .join(" ")
      .replace(/^A:\s*/, "");
    return {
      text: `FAQ: ${question} Answer: ${answer}`,
      source: "faqs.txt",
      category: "faq",
    };
  });
}

function loadPolicies() {
  const raw = fs.readFileSync(path.join(DATA_DIR, "policies.txt"), "utf-8");
  const sections = raw.split(/^## /m).filter(Boolean);

  return sections.map((section) => {
    const lines = section.trim().split("\n");
    const title = lines[0].trim();
    const body = lines
      .slice(1)
      .map((l) => l.replace(/^- /, "").trim())
      .join(". ");
    return {
      text: `Policy - ${title}: ${body}`,
      source: "policies.txt",
      category: title.toLowerCase().replace(/\s+/g, "_"),
    };
  });
}

function loadAllChunks() {
  const products = loadProducts();
  const faqs = loadFAQs();
  const policies = loadPolicies();
  const all = [...products, ...faqs, ...policies];
  console.log(
    `Chunks loaded: ${products.length} products, ${faqs.length} FAQs, ${policies.length} policies = ${all.length} total`
  );
  return all;
}

async function ensureCollection() {
  const collections = await qdrant.getCollections();
  const exists = collections.collections.some((c) => c.name === COLLECTION);

  if (exists) {
    console.log(`Collection "${COLLECTION}" exists, deleting...`);
    await qdrant.deleteCollection(COLLECTION);
  }

  console.log(`Creating collection "${COLLECTION}"...`);
  await qdrant.createCollection(COLLECTION, {
    vectors: { size: 384, distance: "Cosine" },
  });
}

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

async function ingest() {
  console.log("=== Starting Ingestion ===\n");

  const chunks = loadAllChunks();

  console.log("\nGenerating embeddings...");
  const texts = chunks.map((c) => c.text);
  const batchedTexts = chunkArray(texts, 10);
  const embeddings = [];

  for (let i = 0; i < batchedTexts.length; i++) {
    console.log(
      `  Batch ${i + 1}/${batchedTexts.length} (${batchedTexts[i].length} texts)`
    );
    const vecs = await getBatchEmbeddings(batchedTexts[i]);
    embeddings.push(...vecs);
  }

  console.log(`  Total embeddings: ${embeddings.length}`);

  await ensureCollection();

  console.log("\nUpserting vectors to Qdrant...");
  const points = chunks.map((chunk, i) => ({
    id: uuid(),
    vector: embeddings[i],
    payload: {
      text: chunk.text,
      source: chunk.source,
      category: chunk.category,
      ...(chunk.product_id && { product_id: chunk.product_id }),
    },
  }));

  const batchedPoints = chunkArray(points, 10);
  for (let i = 0; i < batchedPoints.length; i++) {
    await qdrant.upsert(COLLECTION, { points: batchedPoints[i] });
    console.log(`  Upserted batch ${i + 1}/${batchedPoints.length}`);
  }
  console.log(`\nDone! ${points.length} chunks ingested into "${COLLECTION}".`);
}

ingest().catch(console.error);
