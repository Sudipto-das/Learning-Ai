# Order Support Assistant

A RAG (Retrieval-Augmented Generation) powered customer support chatbot for small D2C e-commerce sellers. Built for **Sudipto's Fashion Store** — a fictional store used as the demo store.

Customers can ask questions about product details, store FAQs, and policies (returns, shipping, payments, etc.), and the bot responds in natural English or Hinglish by retrieving the most relevant context from a vector database and generating an answer via an LLM.

## Objective

Small D2C sellers frequently answer repetitive customer queries (product availability, sizing, return policies, delivery timelines) across WhatsApp and DMs. This project provides an **automated, always-available support bot** that:

- Reduces repetitive manual support work for sellers
- Gives customers instant, accurate answers 24/7
- Falls back to the seller's WhatsApp support when the bot can't answer
- Demonstrates a production-ready RAG architecture using modern tooling

## Solution

The bot uses a **Retrieval-Augmented Generation (RAG)** pipeline:

1. **Data Ingestion** — Product catalog (25 products), FAQs (15 pairs), and store policies (10 sections) are chunked, embedded, and stored in **Qdrant** (vector database).
2. **Retrieval** — When a customer asks a question, their query is embedded and the top 5 most relevant chunks are retrieved from Qdrant via cosine similarity search.
3. **Generation** — The retrieved context is passed to an LLM (**Groq API**, `openai/gpt-oss-120b`) which generates a concise, conversational answer.
4. **Streaming** — Responses stream back in real-time via Server-Sent Events (SSE) to the React chat UI.

### Architecture

```
Customer (Browser)
    │
    ▼
React Chat UI (port 3000) ──proxy──▶ Express API (port 3001)
                                          │
                                   POST /api/query/stream
                                          │
                                   RAG Query Engine
                                    ╱             ╲
                                   ▼               ▼
                          Qdrant Cloud       Groq LLM API
                         (vector search)   (answer generation)
```

### Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ES Modules) |
| Backend | Express 5.2.1 |
| Vector DB | Qdrant Cloud (`@qdrant/js-client-rest`) |
| LLM | Groq API (`groq-sdk`) — `openai/gpt-oss-120b` |
| Embeddings | `@xenova/transformers` — `Xenova/all-MiniLM-L6-v2` (384-dim) |
| Frontend | React 18.2 (Create React App) |
| Styling | Plain CSS (dark theme, WhatsApp-style) |

## Setup

### Prerequisites

- **Node.js** (v18+ recommended, ES Module support)
- **Groq API key** — get one at [console.groq.com](https://console.groq.com)
- **Qdrant Cloud** instance — free tier at [cloud.qdrant.io](https://cloud.qdrant.io)

### 1. Clone and install

```bash
git clone <repo-url>
cd order-support-bot

# Backend
npm install

# Frontend
cd client
npm install
cd ..
```

### 2. Configure environment

Create a `.env` file in the project root:

```env
GROQ_API_KEY=your_groq_api_key
QDRANT_URL=https://your-cluster.qdrant.cloud:6333
QDRANT_API_KEY=your_qdrant_api_key
```

### 3. Ingest data into Qdrant

```bash
npm run ingest
```

This reads `data/products.csv`, `data/faqs.txt`, and `data/policies.txt`, generates embeddings locally, and upserts ~50 chunks into the `order_support` Qdrant collection. The collection is recreated on each run.

### 4. Start the application

Open two terminals:

```bash
# Terminal 1 — Backend (port 3001)
npm run dev

# Terminal 2 — Frontend (port 3000)
npm run client
```

Then open **http://localhost:3000** in your browser.

### Quick CLI test (no frontend needed)

```bash
node test-query.js
```

This runs an interactive terminal prompt where you can type questions and see bot responses directly.

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/query` | POST | Accepts `{ "question": "..." }`, returns `{ "answer": "...", "sources": [...] }` |
| `/api/query/stream` | POST | Streaming SSE — sends tokens as `data: {"token": "..."}` events |
| `/api/health` | GET | Returns `{ "status": "ok" }` |

## Project Structure

```
order-support-bot/
├── data/                          # Knowledge base source files
│   ├── products.csv               # 25 products (fashion, footwear, etc.)
│   ├── faqs.txt                   # 15 Q&A pairs
│   └── policies.txt               # 10 policy sections
├── src/
│   ├── server.js                  # Express API server
│   └── AI/
│       ├── config.js              # Qdrant + Groq client setup
│       ├── embeddings.js          # Local embedding model
│       ├── ingest.js              # Data ingestion pipeline
│       └── query.js               # RAG query engine
├── client/                        # React frontend
│   ├── public/index.html
│   └── src/
│       ├── App.js                 # Chat UI with SSE streaming
│       └── App.css                # Dark-themed styling
├── test-query.js                  # CLI test tool
├── .env                           # API keys (gitignored)
└── package.json                   # Backend scripts and deps
```

## Sample Queries

- "Is the Classic Leather Sneaker available in size 9?"
- "What is the return policy?"
- "Do you accept COD?"
- "How long does delivery take?"
- "Tell me about the Basic Cotton T-Shirt"
- "What payment methods are accepted?"

## License

MIT
