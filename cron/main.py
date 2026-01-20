import os
import time
import uuid
from datetime import datetime

import yfinance as yf
from dotenv import load_dotenv
from openai import OpenAI
from qdrant_client import QdrantClient
from qdrant_client.http.models import PointStruct, VectorParams
from sqlalchemy import text

from database import get_conn

load_dotenv()

QDRANT_HOST = os.getenv("QDRANT_HOST")
QDRANT_PORT = os.getenv("QDRANT_PORT")
COLLECTION_NAME = os.getenv("COLLECTION_NAME")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


MAX_RETRIES = 5
RETRY_DELAY = 5

for attempt in range(MAX_RETRIES):
    try:
        qdrant_client = QdrantClient(host=QDRANT_HOST, port=int(QDRANT_PORT))
        qdrant_client.get_collections()
        break
    except Exception as e:
        print(f"Qdrant not ready (attempt {attempt+1}): {e}")
        time.sleep(RETRY_DELAY)
else:
    raise RuntimeError("Qdrant not ready after retries")


qdrant_client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)
openai_client = OpenAI(api_key=OPENAI_API_KEY)

existing_collections = [c.name for c in qdrant_client.get_collections().collections]
if COLLECTION_NAME not in existing_collections:
    qdrant_client.recreate_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=1536, distance="Cosine"),
    )
    print(f"Created Qdrant collection: {COLLECTION_NAME}")


def get_embedding(text: str):
    res = openai_client.embeddings.create(model="text-embedding-3-small", input=text)
    return res.data[0].embedding


with get_conn() as conn:
    result = conn.execute(text('SELECT "symbol" FROM "Stock"'))
    symbols = [row["symbol"] for row in result.mappings()]

    for symbol in symbols:
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            now = datetime.utcnow()
            description = info.get("longBusinessSummary") or ""
            
            data = {
                "symbol": symbol,
                "name": info.get("shortName") or info.get("longName") or "",
                "quoteType": info.get("quoteType") or "",
                "currency": info.get("currency") or "THB",
                "market": info.get("exchange") or "SET",
                "regularMarketPrice": info.get("regularMarketPrice") or 0.0,
                "regularMarketOpen": info.get("regularMarketOpen") or 0.0,
                "regularMarketHigh": info.get("regularMarketDayHigh") or 0.0,
                "regularMarketLow": info.get("regularMarketDayLow") or 0.0,
                "previousClose": info.get("previousClose") or 0.0,
                "dayHigh": info.get("dayHigh") or 0.0,
                "dayLow": info.get("dayLow") or 0.0,
                "volume": info.get("volume") or 0,
                "averageVolume": info.get("averageVolume") or 0,
                "fiftyDayAverage": info.get("fiftyDayAverage") or 0.0,
                "twoHundredDayAverage": info.get("twoHundredDayAverage") or 0.0,
                "fiftyTwoWeekLow": info.get("fiftyTwoWeekLow") or 0.0,
                "fiftyTwoWeekHigh": info.get("fiftyTwoWeekHigh") or 0.0,
                "fiftyTwoWeekChangePercent": info.get("52WeekChange") or 0.0,
                "regularMarketChange": info.get("regularMarketChange") or 0.0,
                "regularMarketChangePercent": info.get("regularMarketChangePercent")
                or 0.0,
                "marketState": info.get("marketState") or "",
                "tradeable": info.get("tradeable") or False,
                "lastUpdated": now,
                "createdAt": now,
                "updatedAt": now,
                "description": description
            }

            query = text(
                """
            INSERT INTO "Stock" (
                "symbol", "name", "quoteType", "currency", "market",
                "regularMarketPrice", "regularMarketOpen", "regularMarketHigh", "regularMarketLow",
                "previousClose", "dayHigh", "dayLow", "volume", "averageVolume",
                "fiftyDayAverage", "twoHundredDayAverage", "fiftyTwoWeekLow", "fiftyTwoWeekHigh",
                "fiftyTwoWeekChangePercent", "regularMarketChange", "regularMarketChangePercent",
                "marketState", "tradeable", "lastUpdated", "createdAt", "updatedAt", "description"
            ) VALUES (
                :symbol, :name, :quoteType, :currency, :market,
                :regularMarketPrice, :regularMarketOpen, :regularMarketHigh, :regularMarketLow,
                :previousClose, :dayHigh, :dayLow, :volume, :averageVolume,
                :fiftyDayAverage, :twoHundredDayAverage, :fiftyTwoWeekLow, :fiftyTwoWeekHigh,
                :fiftyTwoWeekChangePercent, :regularMarketChange, :regularMarketChangePercent,
                :marketState, :tradeable, :lastUpdated, :createdAt, :updatedAt, :description
            )
            ON CONFLICT ("symbol") DO UPDATE SET
                "name" = EXCLUDED."name",
                "quoteType" = EXCLUDED."quoteType",
                "currency" = EXCLUDED."currency",
                "market" = EXCLUDED."market",
                "regularMarketPrice" = EXCLUDED."regularMarketPrice",
                "regularMarketOpen" = EXCLUDED."regularMarketOpen",
                "regularMarketHigh" = EXCLUDED."regularMarketHigh",
                "regularMarketLow" = EXCLUDED."regularMarketLow",
                "previousClose" = EXCLUDED."previousClose",
                "dayHigh" = EXCLUDED."dayHigh",
                "dayLow" = EXCLUDED."dayLow",
                "volume" = EXCLUDED."volume",
                "averageVolume" = EXCLUDED."averageVolume",
                "fiftyDayAverage" = EXCLUDED."fiftyDayAverage",
                "twoHundredDayAverage" = EXCLUDED."twoHundredDayAverage",
                "fiftyTwoWeekLow" = EXCLUDED."fiftyTwoWeekLow",
                "fiftyTwoWeekHigh" = EXCLUDED."fiftyTwoWeekHigh",
                "fiftyTwoWeekChangePercent" = EXCLUDED."fiftyTwoWeekChangePercent",
                "regularMarketChange" = EXCLUDED."regularMarketChange",
                "regularMarketChangePercent" = EXCLUDED."regularMarketChangePercent",
                "marketState" = EXCLUDED."marketState",
                "tradeable" = EXCLUDED."tradeable",
                "lastUpdated" = EXCLUDED."lastUpdated",
                "updatedAt" = EXCLUDED."updatedAt",
                "description" = EXCLUDED."description"
            """
            )
            conn.execute(query, data)
            conn.commit()
            print(f"Inserted/Updated in PostgreSQL: {symbol}")

            text_for_embedding = f"Symbol: {data['symbol']} | Name: {data['name']} | Business Description: {description}"
            vector = get_embedding(text_for_embedding)

            point_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, symbol))

            point = PointStruct(id=point_id, vector=vector, payload=data)
            qdrant_client.upsert(collection_name=COLLECTION_NAME, points=[point])
            print(f"Upserted in Qdrant: {symbol}")

        except Exception as e:
            conn.rollback()
            print(f"Error fetching/updating {symbol}: {e}")
