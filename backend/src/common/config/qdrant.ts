import { QdrantClient } from "@qdrant/js-client-rest";

export const qdrantClient = new QdrantClient({
  url: Bun.env.QDRANT_URL ?? "http://localhost:6333",
  checkCompatibility: false,
});
