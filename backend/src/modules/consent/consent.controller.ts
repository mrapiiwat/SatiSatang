import { Elysia } from "elysia";
import { StatusCodes } from "http-status-codes";
import { authenticateJWT } from "@/common/middlewares/auth.middleware";
import { ConsentService } from "./consent.service";

const consentService = new ConsentService();

export const consentController = new Elysia({
  prefix: "/consent",
  tags: ["CONSENT"],
})
  .use(authenticateJWT)
  .get("/status", async ({ set, user }) => {
    const userId = Number(user.id);
    const status = await consentService.getConsentStatus(userId);

    set.status = StatusCodes.OK;
    return status;
  })
  .post("/accept", async ({ set, user, headers }) => {
    const userId = Number(user.id);
    const userAgent = headers["user-agent"] || "unknown";
    const ipAddress =
      headers["x-forwarded-for"] || headers["x-real-ip"] || "unknown";

    const result = await consentService.acceptConsents(
      userId,
      ipAddress,
      userAgent
    );

    set.status = StatusCodes.CREATED;
    return result;
  });
