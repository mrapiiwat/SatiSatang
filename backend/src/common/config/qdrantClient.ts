import { QdrantClient } from '@qdrant/js-client-rest';

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL ?? 'http://localhost:6333',
});

export async function ensureQdrantConnection(): Promise<void> {
  try {
    await qdrant.getCollections();

    const collections = await qdrant.getCollections();
    const existingNames = collections.collections.map((c) => c.name);

    const requiredCollections = [process.env.CHAT_COLLECTION!, process.env.STOCK_COLLECTION!];

    for (const name of requiredCollections) {
      if (!existingNames.includes(name)) {
        await qdrant.createCollection(name, {
          vectors: {
            size: 1536,
            distance: 'Cosine',
          },
        });
        console.log(`Created Qdrant collection: ${name}`);
      } else {
        console.log(`Qdrant collection ready: ${name}`);
      }
    }

    console.log('Connected to Qdrant successfully!');
  } catch (error: unknown) {
    console.error('Failed to connect to Qdrant:', error);
    process.exit(1);
  }
}


ensureQdrantConnection().catch((err) => {
  console.error('Qdrant init error:', err);
});

export default qdrant;
