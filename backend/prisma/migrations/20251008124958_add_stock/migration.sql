-- CreateTable
CREATE TABLE "public"."Stock" (
    "id" SERIAL NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT,
    "instrumentType" TEXT,
    "securityType" TEXT,
    "status" TEXT,
    "marketStatus" TEXT,
    "last" DOUBLE PRECISION,
    "high" DOUBLE PRECISION,
    "low" DOUBLE PRECISION,
    "average" DOUBLE PRECISION,
    "change" DOUBLE PRECISION,
    "percentChange" DOUBLE PRECISION,
    "percentYield" DOUBLE PRECISION,
    "pe" DOUBLE PRECISION,
    "pbv" DOUBLE PRECISION,
    "eps" DOUBLE PRECISION,
    "aumSize" DOUBLE PRECISION,
    "inav" DOUBLE PRECISION,
    "theoretical" DOUBLE PRECISION,
    "exercisePrice" DOUBLE PRECISION,
    "exerciseRatio" DOUBLE PRECISION,
    "maturityDate" TIMESTAMP(3),
    "lastTradingDate" TIMESTAMP(3),
    "toLastTrade" DOUBLE PRECISION,
    "totalBuyVolume" INTEGER,
    "totalSellVolume" INTEGER,
    "totalNoSideVolume" INTEGER,
    "totalVolume" INTEGER,
    "underlying" TEXT,
    "underlyingPrice" DOUBLE PRECISION,
    "moneyness" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Stock_symbol_key" ON "public"."Stock"("symbol");

-- CreateIndex
CREATE INDEX "Stock_symbol_idx" ON "public"."Stock"("symbol");
