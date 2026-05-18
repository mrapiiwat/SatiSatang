import { Elysia } from "elysia";
import { StatusCodes } from "http-status-codes";
import { authenticateJWT } from "@/common/middlewares/auth.middleware";
import { limit } from "@/common/middlewares/limit.middleware";
import { cached } from "@/common/utils/cache";
import { clearBudgetCache } from "../budget/budget.cache";
import { clearGoalCache } from "../goal/goal.cache";
import { clearTransactionCache, transactionCache } from "./transaction.cache";
import * as transactionSchema from "./transaction.schema";
import { TransactionService } from "./transaction.service";

const transactionService = new TransactionService();
const invalidateAllFinancialData = async (userId: number) => {
  await Promise.all([
    clearTransactionCache(userId),
    clearBudgetCache(userId),
    clearGoalCache(userId),
  ]);
};

export const transactionController = new Elysia({
  prefix: "/transaction",
  tags: ["TRANSACTION"],
})
  .use(authenticateJWT)
  .guard(
    {
      detail: {
        security: [{ JwtAuth: [] }],
      },
    },
    (app) =>
      app
        .get(
          "/",
          async ({ query, user, set }) => {
            const userId = Number(user.id);
            const cacheKey = transactionCache.list(userId, query);

            const { data, status } = await cached(
              cacheKey,
              () => transactionService.getTransactions(userId, query),
              "30m"
            );

            set.headers["X-Cache"] = status;
            set.status = StatusCodes.OK;
            return {
              message: "Transactions fetched successfully",
              ...data,
            };
          },
          {
            query: transactionSchema.getTransactionsQuery,
            detail: {
              summary: "ดึงรายการธุรกรรมทั้งหมด",
              description: "ดึงรายการธุรกรรม รายรับ-รายจ่าย ตามเงื่อนไขที่กำหนด",
            },
          }
        )

        .get(
          "/total-amount",
          async ({ query, user, set }) => {
            const userId = Number(user.id);
            const cacheKey = transactionCache.total(userId, query);

            const { data, status } = await cached(
              cacheKey,
              () => transactionService.getTotalAmount(userId, query),
              "10m"
            );

            set.headers["X-Cache"] = status;
            set.status = StatusCodes.OK;
            return {
              message: "Total amount calculated successfully",
              ...data,
            };
          },
          {
            query: transactionSchema.getTotalAmountQuery,
            detail: {
              summary: "คำนวณยอดรวมธุรกรรม",
              description: "คำนวณยอดรวมของธุรกรรมตามประเภทและเงื่อนไขที่กำหนด",
            },
          }
        )

        .post(
          "/",
          async ({ body, user, set }) => {
            const userId = Number(user.id);

            const result = await transactionService.createTransaction(
              body,
              userId
            );
            await invalidateAllFinancialData(userId);

            set.status = StatusCodes.CREATED;

            return {
              message:
                result.type === "goal"
                  ? "Goal transaction created successfully"
                  : "Transaction created successfully",
              data: result.data,
            };
          },
          {
            body: transactionSchema.createTransaction,
            beforeHandle: limit({
              max: 30,
              window: 60,
              prefix: "tx-create",
            }),
            detail: {
              summary: "สร้างรายการธุรกรรมใหม่",
              description: "เพิ่มรายการธุรกรรม รายรับ หรือ รายจ่าย เข้าสู่ระบบ",
            },
          }
        )

        .put(
          "/reorder",
          async ({ body, user, set }) => {
            const userId = Number(user.id);

            await transactionService.reorderTransactions(body.items, userId);
            await invalidateAllFinancialData(userId);

            set.status = StatusCodes.OK;

            return {
              message: "Transactions reordered successfully",
            };
          },
          {
            body: transactionSchema.reorderTransactions,
            beforeHandle: limit({
              max: 20,
              window: 60,
              prefix: "tx-reorder",
            }),
            detail: {
              summary: "จัดเรียงลำดับธุรกรรมใหม่",
              description:
                "อัปเดตลำดับการแสดงผลของธุรกรรมเมื่อมีการลากย้ายตำแหน่งในวันเดียวกัน",
            },
          }
        )

        .post(
          "/predict-category",
          async ({ body, user, set }) => {
            const userId = Number(user.id);
            const result = await transactionService.predictCategory(
              body.description,
              userId
            );

            set.status = StatusCodes.OK;

            return result;
          },
          {
            body: transactionSchema.predictCategory,
            beforeHandle: limit({
              max: 20,
              window: 60,
              prefix: "tx-ai",
            }),
            detail: {
              summary: "ทำนายหมวดหมู่ธุรกรรม",
              description: "ใช้ AI ทำนายหมวดหมู่ที่เหมาะสมที่สุดจากคำอธิบายรายการ",
            },
          }
        )

        .post(
          "/upload",
          async ({ body, user, set }) => {
            const userId = Number(user.id);

            const results = await transactionService.transactionByUpload(
              body.receipt,
              userId
            );

            set.status = StatusCodes.OK;

            const successCount = results.filter(
              (r) => r.status === "success"
            ).length;

            return {
              message: `ประมวลผลเสร็จสิ้น สำเร็จ ${successCount} จาก ${results.length} รายการ`,
              results: results,
            };
          },
          {
            body: transactionSchema.uploadReceipt,
            beforeHandle: limit({
              max: 5,
              window: 60,
              prefix: "tx-upload",
            }),
            detail: {
              summary: "อัปโหลดและประมวลผลสลิป",
              description: "อัปโหลดรูปภาพสลิปธนาคารเพื่อประมวลผลข้อมูลธุรกรรมโดยอัตโนมัติ",
            },
          }
        )

        .put(
          "/:id",
          async ({ params: { id }, body, user, set }) => {
            const userId = Number(user.id);

            const result = await transactionService.updateTransaction(
              Number(id),
              body,
              userId
            );
            await invalidateAllFinancialData(userId);

            set.status = StatusCodes.OK;

            return {
              message: "Transaction updated successfully",
              data: result,
            };
          },
          {
            params: transactionSchema.paramsId,
            beforeHandle: limit({
              max: 20,
              window: 60,
              prefix: "tx-update",
            }),
            body: transactionSchema.updateTransaction,
            detail: {
              summary: "แก้ไขข้อมูลธุรกรรม",
              description: "อัปเดตข้อมูลรายการธุรกรรมที่มีอยู่เดิม",
            },
          }
        )

        .delete(
          "/:id",
          async ({ params: { id }, user, set }) => {
            const userId = Number(user.id);
            const result = await transactionService.deleteTransaction(
              Number(id),
              userId
            );
            await invalidateAllFinancialData(userId);

            set.status = StatusCodes.OK;
            return result;
          },
          {
            params: transactionSchema.paramsId,
            beforeHandle: limit({
              max: 20,
              window: 60,
              prefix: "tx-delete",
            }),
            detail: {
              summary: "ลบรายการธุรกรรม",
              description: "ลบข้อมูลรายการธุรกรรมออกจากระบบ",
            },
          }
        )
  );
