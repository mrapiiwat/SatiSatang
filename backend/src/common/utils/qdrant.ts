import qdrant from '../config/qdrantClient';
import { generateUUIDFromString } from './uuid';
import { embedding } from '../config/openai';
import { Stock } from '@prisma/client';

const CHAT_COLLECTION = process.env.CHAT_COLLECTION ?? 'memory';
const STOCK_COLLECTION = process.env.STOCK_COLLECTION ?? 'stock_data';

export async function ensureCollection(collectionName: string): Promise<void> {
  try {
    await qdrant.createCollection(collectionName, {
      vectors: { size: 1536, distance: 'Cosine' },
      on_disk_payload: true,
    });

    await qdrant.createPayloadIndex(collectionName, {
      field_name: 'userId',
      field_schema: 'keyword',
    });
    await qdrant.createPayloadIndex(collectionName, { field_name: 'text', field_schema: 'text' });

    console.log(`Qdrant collection & indexes ready: ${collectionName}`);
  } catch (error: unknown) {
    if (
      error &&
      typeof error === 'object' &&
      'status' in error &&
      error.status === 'already_exists'
    ) {
      console.log(`Collection already exists: ${collectionName}`);
    } else {
      console.error('ensureCollection error:', error);
    }
  }
}

export async function addMemory(userId: string, content: string, role: 'user' | 'assistant') {
  try {
    const vector = await embedding(content);

    await qdrant.upsert(CHAT_COLLECTION, {
      points: [
        {
          id: generateUUIDFromString(userId + content),
          vector,
          payload: { userId, content, role },
        },
      ],
    });
  } catch (error) {
    console.error('addMemory error:', error);
  }
}

export async function searchMemory(userId: string, query: string, topK = 5) {
  try {
    const vector = await embedding(query);

    const result = await qdrant.search(process.env.CHAT_COLLECTION!, {
      vector,
      limit: topK,
      filter: {
        must: [{ key: 'userId', match: { value: userId } }],
      },
    });

    return (result as Array<{ payload?: Record<string, unknown> }>)
      .map((r) => {
        const payload = r.payload as { content?: string; role?: string } | undefined;
        return {
          content: payload?.content ?? '',
          role: payload?.role ?? 'assistant',
        };
      })
      .filter((r) => r.content.trim() !== '');
  } catch (error) {
    console.error('searchMemory error:', error);
    return [];
  }
}

export async function searchStock(query: string, limit = 3): Promise<Record<string, Stock>[]> {
  try {
    const vector = await embedding(query);
    const result = await qdrant.search(STOCK_COLLECTION, { vector, limit });
    return result.map((r) => r.payload).filter(Boolean) as Record<string, Stock>[];
  } catch (error) {
    console.error('searchStock error:', error);
    return [];
  }
}

export async function listCollections() {
  const res = await qdrant.getCollections();
  return res.collections;
}
