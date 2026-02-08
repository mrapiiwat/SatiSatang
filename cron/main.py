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
    result = conn.execute(text("SELECT symbol FROM stocks"))
    symbols = [row.symbol for row in result.mappings()]

    for symbol in symbols:
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            now = datetime.utcnow()
            description = info.get("longBusinessSummary") or ""

            data = {
                "symbol": symbol,
                "name": info.get("shortName") or info.get("longName") or "",
                "quote_type": info.get("quoteType") or "",
                "currency": info.get("currency") or "THB",
                "market": info.get("exchange") or "SET",
                "regular_market_price": info.get("regularMarketPrice") or 0.0,
                "regular_market_open": info.get("regularMarketOpen") or 0.0,
                "regular_market_high": info.get("regularMarketDayHigh") or 0.0,
                "regular_market_low": info.get("regularMarketDayLow") or 0.0,
                "previous_close": info.get("previousClose") or 0.0,
                "day_high": info.get("dayHigh") or 0.0,
                "day_low": info.get("dayLow") or 0.0,
                "volume": info.get("volume") or 0,
                "average_volume": info.get("averageVolume") or 0,
                "fifty_day_average": info.get("fiftyDayAverage") or 0.0,
                "two_hundred_day_average": info.get("twoHundredDayAverage") or 0.0,
                "fifty_two_week_low": info.get("fiftyTwoWeekLow") or 0.0,
                "fifty_two_week_high": info.get("fiftyTwoWeekHigh") or 0.0,
                "fifty_two_week_change_percent": info.get("52WeekChange") or 0.0,
                "regular_market_change": info.get("regularMarketChange") or 0.0,
                "regular_market_change_percent": info.get("regularMarketChangePercent")
                or 0.0,
                "market_state": info.get("marketState") or "",
                "tradeable": info.get("tradeable") or False,
                "last_updated": now,
                "created_at": now,
                "updated_at": now,
                "description": description,
            }

            query = text(
                """
            INSERT INTO stocks (
                symbol, name, quote_type, currency, market,
                regular_market_price, regular_market_open, regular_market_high, regular_market_low,
                previous_close, day_high, day_low, volume, average_volume,
                fifty_day_average, two_hundred_day_average, fifty_two_week_low, fifty_two_week_high,
                fifty_two_week_change_percent, regular_market_change, regular_market_change_percent,
                market_state, tradeable, last_updated, created_at, updated_at, description
            ) VALUES (
                :symbol, :name, :quote_type, :currency, :market,
                :regular_market_price, :regular_market_open, :regular_market_high, :regular_market_low,
                :previous_close, :day_high, :day_low, :volume, :average_volume,
                :fifty_day_average, :two_hundred_day_average, :fifty_two_week_low, :fifty_two_week_high,
                :fifty_two_week_change_percent, :regular_market_change, :regular_market_change_percent,
                :market_state, :tradeable, :last_updated, :created_at, :updated_at, :description
            )
            ON CONFLICT (symbol) DO UPDATE SET
                name = EXCLUDED.name,
                quote_type = EXCLUDED.quote_type,
                currency = EXCLUDED.currency,
                market = EXCLUDED.market,
                regular_market_price = EXCLUDED.regular_market_price,
                regular_market_open = EXCLUDED.regular_market_open,
                regular_market_high = EXCLUDED.regular_market_high,
                regular_market_low = EXCLUDED.regular_market_low,
                previous_close = EXCLUDED.previous_close,
                day_high = EXCLUDED.day_high,
                day_low = EXCLUDED.day_low,
                volume = EXCLUDED.volume,
                average_volume = EXCLUDED.average_volume,
                fifty_day_average = EXCLUDED.fifty_day_average,
                two_hundred_day_average = EXCLUDED.two_hundred_day_average,
                fifty_two_week_low = EXCLUDED.fifty_two_week_low,
                fifty_two_week_high = EXCLUDED.fifty_two_week_high,
                fifty_two_week_change_percent = EXCLUDED.fifty_two_week_change_percent,
                regular_market_change = EXCLUDED.regular_market_change,
                regular_market_change_percent = EXCLUDED.regular_market_change_percent,
                market_state = EXCLUDED.market_state,
                tradeable = EXCLUDED.tradeable,
                last_updated = EXCLUDED.last_updated,
                updated_at = EXCLUDED.updated_at,
                description = EXCLUDED.description
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
