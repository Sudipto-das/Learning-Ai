const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;
const DELIMITERS = ['\n\n', '\n', '. ', ' '];

export function chunkText(text, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
    if (!text || text.trim().length === 0) return [];

    const chunks = [];
    let remaining = text;

    while (remaining.length > 0) {
        if (remaining.length <= chunkSize) {
            chunks.push(remaining.trim());
            break;
        }

        let cutPoint = -1;
        for (const delimiter of DELIMITERS) {
            const idx = remaining.lastIndexOf(delimiter, chunkSize);
            if (idx > chunkSize / 2) {
                cutPoint = idx + delimiter.length;
                break;
            }
        }

        if (cutPoint === -1) {
            cutPoint = chunkSize;
        }

        chunks.push(remaining.slice(0, cutPoint).trim());
        remaining = remaining.slice(cutPoint - overlap);
    }

    return chunks.filter(chunk => chunk.length > 0);
}
