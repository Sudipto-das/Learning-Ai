# Order Support Assistant — Implementation Plan

> **Goal:** RAG-based chatbot jo chhote D2C sellers ke product catalog, FAQs aur policies se customer questions ka instant answer de.

---

## Tech Stack (Already Installed)

| Layer | Tool | Purpose |
|-------|------|---------|
| Runtime | Node.js (ES Modules) | Server + scripts |
| Web | Express 5.2.1 | API endpoints + static files |
| Vector DB | Qdrant Cloud | Embeddings store & search |
| LLM | Groq API (groq-sdk) | Answer generation |
| Embeddings | @xenova/transformers | Local HuggingFace embedding model |
| CSV Parser | csv-parse | products.csv read karne ke liye |
| Dev | Nodemon | Auto-reload during development |

---

## Project Structure (Final)

```
order-support-bot/
├── data/
│   ├── products.csv          ✅ Ready (25 products)
│   ├── faqs.txt              ✅ Ready (15 Q&A pairs)
│   └── policies.txt          ✅ Ready (10 policy sections)
├── src/
│   ├── ai/
│   │   ├── ingest.js         ❌ Step 1 — Data ingestion script
│   │   ├── embeddings.js     ❌ Step 2 — Embedding generation utility
│   │   └── query.js          ❌ Step 3 — RAG query engine
│   └── server.js             ❌ Step 4 — Express API server
├── public/
│   └── index.html            ❌ Step 5 — WhatsApp-style chat UI
├── .env                      ✅ Ready (API keys configured)
├── package.json              ✅ Ready (dependencies installed)
└── PLAN.md                   ✅ This file
```

---

## Step-by-Step Build Plan

---

### Step 1: `src/ai/embeddings.js` — Embedding Utility

**Kya karega:**
- `@xenova/transformers` se `Xenova/all-MiniLM-L6-v2` model load karega (sirf pehli baar download hoga, uske baad local cache se)
- Ek function dega `getEmbedding(text)` — input text ka 384-dimension vector return karega
- Batch mein bhi embeddings generate kar sake (multiple texts ek saath)

**Functions:**
```
getEmbedding(text: string) → number[]
getBatchEmbeddings(texts: string[]) → number[][]
```

**Key Points:**
- Model sirf ek baar load ho (reuse across calls)
- Text ko truncate kare agar 512 tokens se zyada ho
- Error handling for model load failure

---

### Step 2: `src/ai/ingest.js` — Data Ingestion Script

**Kya karega:**
1. **Read Data** — `data/products.csv`, `data/faqs.txt`, `data/policies.txt` ko parse karega
2. **Chunking** — Har data type ko meaningful chunks mein convert karega:

#### Chunking Strategy:

| Source | Chunk Format | Example |
|--------|-------------|---------|
| `products.csv` | Ek product = Ek chunk | `"Product: Cotton Round Neck T-Shirt. Category: men-tops. Price: ₹499. Sizes: S, M, L, XL. Colors: Black, White, Navy. Material: 100% Cotton. Description: Comfortable everyday wear..."` |
| `faqs.txt` | Ek Q&A pair = Ek chunk | `"FAQ: COD available hai kya? Answer: Haan, COD available hai ₹2000 tak ke orders pe. ₹40 COD charge lagta hai..."` |
| `policies.txt` | Ek section = Ek chunk (split by headings) | `"Policy - Return Policy: 7 din ke andar return kar sakte ho. Item unused hona chahiye..."` |

3. **Embeddings Generate** — Har chunk ka `getEmbedding()` call karke vector banaye
4. **Qdrant mein Store** — Collection create kare `order_support` naam se, vectors upsert kare with metadata

**Qdrant Collection Config:**
```
Collection Name: order_support
Vector Size: 384 (all-MiniLM-L6-v2)
Distance: Cosine
Payload Fields: text, source, category (optional)
```

**Metadata har chunk ke saath store hoga:**
```json
{
  "text": "Product: Cotton Round Neck T-Shirt...",
  "source": "products.csv",
  "product_id": 1,
  "category": "men-tops"
}
```

**Script Commands:**
```bash
npm run ingest    # package.json mein already configured
```

---

### Step 3: `src/ai/query.js` — RAG Query Engine

**Kya karega:**
1. **User Question ka Embedding** banaye (`getEmbedding()`)
2. **Qdrant Search** — Top 3-5 most similar chunks retrieve kare (cosine similarity)
3. **Context Build** — Retrieved chunks ko ek formatted string mein assemble kare
4. **Groq LLM Call** — System prompt + context + user question Groq API ko bheje
5. **Response** — LLM ka answer return kare

**System Prompt (Preset):**
```
Tum "Sudipto's Fashion Store" ka order support assistant ho.

Instructions:
- Sirf diye gaye context se answer do
- Agar context mein answer na ho, to bolo "Iske baare mein seedha seller se baat karo: +91-9876543210"
- Hinglish mein jawab do (Hindi + English mix) — friendly tone
- Product-specific questions ke liye exact details do (price, size, color, stock)
- Policy questions ke liye clearly steps batao
- Answer short aur helpful rakho (2-4 sentences max)
```

**Query Function Signature:**
```
askQuestion(question: string) → { answer: string, sources: string[] }
```

**Error Handling:**
- Qdrant connection fail → "Service temporarily unavailable"
- Groq API fail → Fallback message with seller contact
- No relevant chunks found → "Seller se directly baat karo"

---

### Step 4: `src/server.js` — Express API Server

**Kya karega:**
- Express server start karega port `3000` pe
- CORS enable kare (frontend ke liye)
- Static files serve kare `public/` folder se

**API Endpoints:**

| Method | Endpoint | Body | Response | Description |
|--------|----------|------|----------|-------------|
| `POST` | `/api/chat` | `{ "message": "COD available hai?" }` | `{ "answer": "...", "sources": [...] }` | Customer ka question process kare |
| `GET` | `/api/health` | — | `{ "status": "ok" }` | Server health check |
| `POST` | `/api/ingest` | — | `{ "message": "Data ingested successfully", "chunks": 45 }` | Re-ingest data (admin use) |

**Server Setup:**
```javascript
const PORT = process.env.PORT || 3000;
// Serve static files from 'public' directory
// JSON body parser
// CORS middleware
// Route handlers
```

---

### Step 5: `public/index.html` — Chat Frontend

**Kya karega:**
- WhatsApp jaisa clean chat interface
- Header mein store name + online status indicator
- Message bubbles — user (right side, green) + bot (left side, white)
- Typing indicator jab bot soch raha ho
- Auto-scroll to latest message
- Enter key se message bhejo
- Responsive design (mobile + desktop)

**UI Layout:**
```
┌──────────────────────────────────┐
│  🛍 Sudipto's Fashion Store  🟢 │  ← Header
├──────────────────────────────────┤
│                                  │
│     [Bot]: Namaste! Kya madad    │  ← Bot messages
│            chahiye?              │     (left aligned)
│                                  │
│            COD available hai? ── │  ← User messages
│                                  │     (right aligned)
│     [Bot]: Haan, COD available   │
│            hai ₹2000 tak...      │
│                                  │
├──────────────────────────────────┤
│  Type your message...    [Send]  │  ← Input bar
└──────────────────────────────────┘
```

**Features:**
- Welcome message automatically dikhe jab page khule
- Quick reply buttons (Optional): "Return Policy", "Delivery Time", "COD", "Size Guide"
- Loading spinner while bot generates response
- Error message agar API fail ho

---

## Data Flow (End-to-End)

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Customer   │────▶│   Frontend   │────▶│  Express API │
│  (Browser)   │     │ (index.html) │     │  (server.js) │
└─────────────┘     └──────────────┘     └──────┬──────┘
                                                │
                                        ┌───────▼───────┐
                                        │  query.js     │
                                        │  (RAG Engine) │
                                        └───┬───────┬───┘
                                            │       │
                                   ┌────────▼┐  ┌───▼────────┐
                                   │ Qdrant  │  │ Groq LLM   │
                                   │(Search) │  │(Generate)  │
                                   └─────────┘  └────────────┘
```

**Request Flow:**
1. Customer types: "Blue shirt available hai kya?"
2. Frontend sends POST `/api/chat` with message
3. `server.js` calls `query.js` → `askQuestion("Blue shirt available hai kya?")`
4. `query.js` generates embedding → searches Qdrant → gets top 3 matching chunks
5. Chunks + question sent to Groq LLM with system prompt
6. LLM returns: "Haan, Formal Linen Shirt available hai Blue color mein ₹899. Sizes: S to XL. Order karne ke liye WhatsApp karo!"
7. Response comes back to frontend → displayed in chat bubble

---

## Ingestion Data Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Data Files  │────▶│  ingest.js   │────▶│   Qdrant    │
│ (.csv/.txt)  │     │  (Chunk +    │     │  (Vectors   │
│              │     │   Embed)     │     │   Stored)   │
└─────────────┘     └──────────────┘     └─────────────┘
```

**One-time process:** `npm run ingest` run karo → saara data Qdrant mein load ho jaayega

---

## Key Configuration (.env)

```
GROQ_API_KEY=gsk_...          → LLM API access
QDRANT_API_KEY=eyJ...         → Vector DB authentication
QDRANT_URL=https://...        → Vector DB endpoint
```

---

## Expected Chunk Count

| Source | Approximate Chunks |
|--------|-------------------|
| products.csv | 25 (1 per product) |
| faqs.txt | 15 (1 per Q&A) |
| policies.txt | 10 (1 per section) |
| **Total** | **~50 chunks** |

---

## Build Order (Execution Sequence)

| Order | File | Depends On | Est. Difficulty |
|-------|------|------------|-----------------|
| 1st | `src/ai/embeddings.js` | Nothing | Easy |
| 2nd | `src/ai/ingest.js` | embeddings.js | Medium |
| 3rd | `src/ai/query.js` | embeddings.js | Medium |
| 4th | `src/server.js` | query.js | Easy |
| 5th | `public/index.html` | server.js | Easy-Medium |

**After all files:**
```bash
npm run ingest       # Data Qdrant mein load karo
npm run dev          # Server start karo
# Browser mein http://localhost:3000 kholo
```

---

## Testing Plan

| Test | How | Expected Result |
|------|-----|-----------------|
| Ingestion | `npm run ingest` | "50 chunks ingested successfully" |
| Health Check | `GET /api/health` | `{"status": "ok"}` |
| Product Query | "T-shirt ka price kya hai?" | Accurate price + details from products.csv |
| Policy Query | "Return policy kya hai?" | 7-day return policy details from policies.txt |
| FAQ Query | "COD available hai?" | COD info with ₹40 charge from faqs.txt |
| Out of Scope | "Weather kaisa hai?" | Fallback: "Seller se baat karo" message |
| Frontend | Open localhost:3000 | Chat UI loads, messages work |

---

## Future Enhancements (Baad mein — Abhi Nahi)

- [ ] Order tracking integration
- [ ] Multi-language support (pure Hindi, pure English)
- [ ] Voice input support
- [ ] Seller dashboard for updating data
- [ ] Conversation history / context memory
- [ ] WhatsApp Business API integration

---

*Plan created: September 2026*
*Project: Order Support Assistant*
*Author: Sudipto*
