from database import get_conn
from settard import get_quote_symbol
from sqlalchemy import text
from datetime import datetime

with get_conn() as conn:
    result = conn.execute(text('SELECT * FROM "Stock"'))
    
    for row in result.mappings():
        symbol = row["symbol"]
        quote = get_quote_symbol(symbol)

        now = datetime.utcnow()
        data = {
            **quote,
            "createdAt": now,
            "updatedAt": now
        }

        query = text("""
        INSERT INTO "Stock" (
            "symbol", "instrumentType", "high", "low", "last", "average", "change", "percentChange",
            "totalVolume", "totalBuyVolume", "totalSellVolume", "totalNoSideVolume",
            "status", "marketStatus", "securityType", "eps", "pe", "pbv", "percentYield",
            "maturityDate", "exercisePrice", "underlying", "underlyingPrice",
            "theoretical", "moneyness", "lastTradingDate", "toLastTrade", "exerciseRatio",
            "intrinsicValue", "impliedVolatility", "exchange", "aumSize", "inav",
            "createdAt", "updatedAt"
        ) VALUES (
            :symbol, :instrumentType, :high, :low, :last, :average, :change, :percentChange,
            :totalVolume, :totalBuyVolume, :totalSellVolume, :totalNoSideVolume,
            :status, :marketStatus, :securityType, :eps, :pe, :pbv, :percentYield,
            :maturityDate, :exercisePrice, :underlying, :underlyingPrice,
            :theoretical, :moneyness, :lastTradingDate, :toLastTrade, :exerciseRatio,
            :intrinsicValue, :impliedVolatility, :exchange, :aumSize, :inav,
            :createdAt, :updatedAt
        )
        ON CONFLICT ("symbol") DO UPDATE SET
            "instrumentType" = EXCLUDED."instrumentType",
            "high" = EXCLUDED."high",
            "low" = EXCLUDED."low",
            "last" = EXCLUDED."last",
            "average" = EXCLUDED."average",
            "change" = EXCLUDED."change",
            "percentChange" = EXCLUDED."percentChange",
            "totalVolume" = EXCLUDED."totalVolume",
            "totalBuyVolume" = EXCLUDED."totalBuyVolume",
            "totalSellVolume" = EXCLUDED."totalSellVolume",
            "totalNoSideVolume" = EXCLUDED."totalNoSideVolume",
            "status" = EXCLUDED."status",
            "marketStatus" = EXCLUDED."marketStatus",
            "securityType" = EXCLUDED."securityType",
            "eps" = EXCLUDED."eps",
            "pe" = EXCLUDED."pe",
            "pbv" = EXCLUDED."pbv",
            "percentYield" = EXCLUDED."percentYield",
            "maturityDate" = EXCLUDED."maturityDate",
            "exercisePrice" = EXCLUDED."exercisePrice",
            "underlying" = EXCLUDED."underlying",
            "underlyingPrice" = EXCLUDED."underlyingPrice",
            "theoretical" = EXCLUDED."theoretical",
            "moneyness" = EXCLUDED."moneyness",
            "lastTradingDate" = EXCLUDED."lastTradingDate",
            "toLastTrade" = EXCLUDED."toLastTrade",
            "exerciseRatio" = EXCLUDED."exerciseRatio",
            "intrinsicValue" = EXCLUDED."intrinsicValue",
            "impliedVolatility" = EXCLUDED."impliedVolatility",
            "exchange" = EXCLUDED."exchange",
            "aumSize" = EXCLUDED."aumSize",
            "inav" = EXCLUDED."inav",
            "updatedAt" = EXCLUDED."updatedAt"
        """)

        conn.execute(query, data)
        conn.commit()
        print(f"Inserted/Updated data for symbol: {symbol}")
