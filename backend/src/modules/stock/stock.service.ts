import { and, asc, eq, ilike, or, type SQL } from "drizzle-orm";
import { NotFoundError } from "@/common/errors";
import { serializeBigInt } from "@/common/utils/serializer";
import { db } from "@/db";
import { stock } from "@/db/schema";
import type * as stockSchema from "./stock.schema";

export class StockService {
  async getStocks(query: stockSchema.GetStocksQuery) {
    const { search, page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];

    if (search) {
      const searchTerms = search.split(" ").filter(Boolean);
      if (searchTerms.length > 0) {
        const searchConditions = searchTerms.map((term) =>
          ilike(stock.symbol, `%${term}%`)
        );
        conditions.push(or(...searchConditions)!);
      }
    }

    const stocks = await db.query.stock.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [asc(stock.id)],
      limit: limit,
      offset: offset,
    });

    const safeStocks = serializeBigInt(stocks);

    return safeStocks;
  }

  async getStockById(id: number) {
    const data = await db.query.stock.findFirst({
      where: eq(stock.id, id),
    });

    if (!data) {
      throw new NotFoundError("Stock not found");
    }

    return {
      ...data,
      volume: data.volume?.toString() ?? null,
      averageVolume: data.averageVolume?.toString() ?? null,
    };
  }
}
