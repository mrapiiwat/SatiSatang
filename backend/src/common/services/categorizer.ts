import { and, eq, isNotNull } from "drizzle-orm";
import natural from "natural";
import { redis } from "@/common/config/redis";
import { db } from "@/db";
import { transaction } from "@/db/schema";

export class SmartCategorizer {
  private segmenter = new Intl.Segmenter("th", { granularity: "word" });

  private getRedisKey(userId: number) {
    return `ml:category_model:${userId}`;
  }

  private tokenize(text: string): string[] {
    if (!text) return [];
    return Array.from(this.segmenter.segment(text))
      .filter((seg) => seg.isWordLike)
      .map((seg) => seg.segment);
  }

  async trainModel(userId: number) {
    const history = await db
      .select({
        description: transaction.description,
        categoryId: transaction.categoryId,
      })
      .from(transaction)
      .where(
        and(
          eq(transaction.userId, userId),
          isNotNull(transaction.description),
          isNotNull(transaction.categoryId)
        )
      );

    if (history.length === 0) return;

    const classifier = new natural.BayesClassifier();
    let docCount = 0;

    history.forEach((tx) => {
      if (tx.description && tx.categoryId) {
        const tokens = this.tokenize(tx.description);

        if (tokens.length > 0) {
          classifier.addDocument(tokens, tx.categoryId.toString());
          docCount++;
        }
      }
    });

    if (docCount === 0) {
      console.log(`User ${userId} has no valid training data.`);
      return;
    }

    classifier.train();

    const modelJson = JSON.stringify(classifier);
    const key = this.getRedisKey(userId);

    await redis.set(key, modelJson, "EX", 60 * 60 * 24 * 7);
    console.log(`Saved model to Redis: ${key}`);
  }

  async predict(description: string, userId: number): Promise<number | null> {
    if (!description) return null;

    const key = this.getRedisKey(userId);

    try {
      let modelJson = await redis.get(key);
      let classifier: natural.BayesClassifier;

      if (!modelJson) {
        console.log("Model not found in Redis, training new one...");
        await this.trainModel(userId);
        modelJson = await redis.get(key);
        if (!modelJson) return null;
      }

      classifier = natural.BayesClassifier.restore(JSON.parse(modelJson));

      try {
        const tokens = this.tokenize(description);
        if (tokens.length === 0) return null;

        const predictedCategoryId = classifier.classify(tokens);
        return predictedCategoryId ? parseInt(predictedCategoryId, 10) : null;
      } catch (innerError) {
        console.error(`Model corrupted. Clearing cache...`, innerError);
        await redis.del(key);
        return null;
      }
    } catch (error) {
      console.error("Predict Error:", error);
      return null;
    }
  }
}
