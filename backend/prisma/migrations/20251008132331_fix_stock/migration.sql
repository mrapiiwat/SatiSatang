-- AlterTable
ALTER TABLE "public"."Stock" ADD COLUMN     "exchange" TEXT,
ADD COLUMN     "impliedVolatility" DOUBLE PRECISION,
ADD COLUMN     "intrinsicValue" DOUBLE PRECISION;
