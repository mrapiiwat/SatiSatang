import { openai } from "@/common/config/openai";
import { qdrantClient } from "@/common/config/qdrant";
import type { ChatMessage } from "@/common/service/openai";
import { generateUUIDFromString } from "@/common/utils/uuid";

const CHAT_COLLECTION = Bun.env.CHAT_COLLECTION ?? "memory";
const STOCK_COLLECTION = Bun.env.STOCK_COLLECTION ?? "stocks";

export interface StockData {
  symbol: string;
  name: string;
  price?: number;
  description?: string;
  // biome-ignore lint/suspicious/noExplicitAny: Allow dynamic properties for external stock data
  [key: string]: any;
}
const MODEL_NAME = "gpt-5-nano";
const EMBEDDING_MODEL = "text-embedding-3-small";

export class RAGService {
  async ensureCollections(): Promise<void> {
    const collections = [CHAT_COLLECTION, STOCK_COLLECTION];

    for (const name of collections) {
      try {
        await qdrantClient.getCollection(name);
      } catch (_error) {
        console.log(`[RAG] Creating collection: ${name}...`);

        await qdrantClient.createCollection(name, {
          vectors: {
            size: 1536,
            distance: "Cosine",
          },
        });

        if (name === CHAT_COLLECTION) {
          await qdrantClient.createPayloadIndex(name, {
            field_name: "userId",
            field_schema: "keyword",
          });
        }
      }
    }
  }

  private async getEmbedding(text: string) {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text,
    });
    return response.data[0].embedding;
  }

  async contextualizeQuery(
    latestQuestion: string,
    chatHistory: ChatMessage[]
  ): Promise<string> {
    if (chatHistory.length === 0) return latestQuestion;

    const prompt = `
    Given a chat history and the latest user question which might reference context in the chat history, 
    formulate a standalone question which can be understood without the chat history. 
    Do NOT answer the question, just reformulate it if needed and otherwise return it as is.
    
    Chat History:
    ${chatHistory.map((m) => `${m.role}: ${m.content}`).join("\n")}
    
    Latest User Question: ${latestQuestion}
    
    Standalone Question:`;

    try {
      const response = await openai.chat.completions.create({
        model: MODEL_NAME,
        messages: [{ role: "system", content: prompt }],
      });

      const newQuery = response.choices[0].message.content || latestQuestion;
      return newQuery;
    } catch (e) {
      console.error("[RAG] Rewriter failed:", e);
      return latestQuestion;
    }
  }

  async searchMemory(userId: number, query: string, topK = 5) {
    try {
      const vector = await this.getEmbedding(query);

      const result = await qdrantClient.search(CHAT_COLLECTION, {
        vector,
        limit: topK,
        filter: {
          must: [{ key: "userId", match: { value: userId.toString() } }],
        },
      });

      return result
        .filter((r) => r.score > 0.65)
        .map((r) => r.payload?.content as string)
        .filter(Boolean);
    } catch (error) {
      console.error("[RAG] Search memory error:", error);
      return [];
    }
  }

  async searchStock(query: string, limit = 3): Promise<StockData[]> {
    try {
      const vector = await this.getEmbedding(query);
      const result = await qdrantClient.search(STOCK_COLLECTION, {
        vector,
        limit,
      });

      const highQuality = result.filter((r) => r.score > 0.6);
      if (highQuality.length > 0) {
        return highQuality.map((r) => r.payload as unknown as StockData);
      }

      const mediumQuality = result.filter((r) => r.score > 0.4);
      if (mediumQuality.length > 0) {
        return mediumQuality.map((r) => r.payload as unknown as StockData);
      }

      if (result.length > 0) {
        return result.slice(0, 2).map((r) => r.payload as unknown as StockData);
      }

      return [];
    } catch (error) {
      console.error("[RAG] Search stock error:", error);
      return [];
    }
  }

  async addMemory(userId: number, content: string, role: "user" | "assistant") {
    this.getEmbedding(content)
      .then(async (vector) => {
        const strUserId = userId.toString();
        await qdrantClient.upsert(CHAT_COLLECTION, {
          points: [
            {
              id: generateUUIDFromString(strUserId + content),
              vector,
              payload: { userId: strUserId, content, role },
            },
          ],
        });
      })
      .catch((e) => console.error("[RAG] Add memory failed:", e));
  }
}
