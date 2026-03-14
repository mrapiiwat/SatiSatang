import { openai } from "@/common/config/openai";
import { qdrantClient } from "@/common/config/qdrant";
import type { ChatMessage } from "@/common/services/openai.service";
import { generateUUIDFromString } from "@/common/utils/uuid";

const CHAT_COLLECTION = Bun.env.CHAT_COLLECTION ?? "memory";
const STOCK_COLLECTION = Bun.env.STOCK_COLLECTION ?? "stocks";
const TRANSACTION_COLLECTION = Bun.env.TRANSACTION_COLLECTION ?? "transaction";

export interface StockData {
  symbol: string;
  name: string;
  price?: number;
  description?: string;
  // biome-ignore lint/suspicious/noExplicitAny: Allow dynamic properties for external stock data
  [key: string]: any;
}

export interface TransactionIndexData {
  id: number;
  type: string;
  amount: number;
  description: string | null;
  userId: number;
  date: number;
}

const MODEL_NAME = "gpt-4o-mini";
const EMBEDDING_MODEL = "text-embedding-3-small";

export class RAGService {
  async ensureCollections(): Promise<void> {
    const collections = [
      CHAT_COLLECTION,
      STOCK_COLLECTION,
      TRANSACTION_COLLECTION,
    ];

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

        if (name === CHAT_COLLECTION || name === TRANSACTION_COLLECTION) {
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

  async searchMemory(userId: number, query: string) {
    try {
      const vector = await this.getEmbedding(query);
      const result = await qdrantClient.search(CHAT_COLLECTION, {
        vector,
        limit: 3,
        filter: {
          must: [{ key: "userId", match: { value: userId.toString() } }],
        },
      });
      return result.map((r) => r.payload?.content as string).filter(Boolean);
    } catch (e) {
      console.error(e);
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

  async addTransactionIndex(tx: TransactionIndexData) {
    const content = `Transaction ${tx.type}: ${tx.amount} THB. Description: ${tx.description}`;
    const vector = await this.getEmbedding(content);
    await qdrantClient.upsert(TRANSACTION_COLLECTION, {
      points: [
        {
          id: generateUUIDFromString(`tx-${tx.id}`),
          vector,
          payload: {
            userId: tx.userId.toString(),
            type: tx.type,
            amount: tx.amount,
            description: tx.description,
            date: tx.date,
          },
        },
      ],
    });
  }

  async searchTransactions(
    userId: number,
    query: string,
    startDate?: string,
    endDate?: string
  ) {
    try {
      const vector = await this.getEmbedding(query);

      type QdrantFilter =
        | { key: string; match: { value: string | number | boolean } }
        | { key: string; range: { gte?: number; lte?: number } };

      const mustFilters: QdrantFilter[] = [
        { key: "userId", match: { value: userId } },
      ];

      if (startDate || endDate) {
        const rangeBody: { gte?: number; lte?: number } = {};

        if (startDate) {
          rangeBody.gte = new Date(startDate).getTime();
        }

        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          rangeBody.lte = end.getTime();
        }

        if (Object.keys(rangeBody).length > 0) {
          mustFilters.push({
            key: "date",
            range: rangeBody,
          });
        }
      }

      console.log(
        "[RAG] Filters payload:",
        JSON.stringify(mustFilters, null, 2)
      );

      const result = await qdrantClient.search(TRANSACTION_COLLECTION, {
        vector,
        limit: 5,
        filter: { must: mustFilters },
      });

      return result.map(
        (r) =>
          `[${new Date(r.payload?.date as number).toLocaleDateString()}] ${r.payload?.description}: ${r.payload?.amount}`
      );
    } catch (e) {
      console.error("[RAG] Search error:", e);
      return [];
    }
  }

  async deleteTransactionIndex(transactionId: number) {
    try {
      await qdrantClient.delete(TRANSACTION_COLLECTION, {
        points: [generateUUIDFromString(`tx-${transactionId}`)],
      });
    } catch (e) {
      console.error(`[RAG] Failed to delete transaction ${transactionId}:`, e);
    }
  }
}

export const ragService = new RAGService();
