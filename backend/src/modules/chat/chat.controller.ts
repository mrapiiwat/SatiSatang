import { Elysia } from "elysia";
import { StatusCodes } from "http-status-codes";
import { authenticateJWT } from "@/common/middlewares/auth.middleware";
import * as chatSchema from "./chat.schema";
import { ChatService } from "./chat.service";

const chatService = new ChatService();

export const chatController = new Elysia()
  .use(authenticateJWT)
  .get(
    "/:botType/session",
    async ({ params: { botType }, query, user, set }) => {
      if (botType !== "sati" && botType !== "satang") {
        set.status = StatusCodes.BAD_REQUEST;
        return { message: "Invalid bot type. Use 'Sati' or 'Satang'." };
      }

      const userId = Number(user.id);
      const result = await chatService.getOrCreateSession(
        userId,
        botType as chatSchema.BotType,
        query.cursor,
        query.limit
      );

      set.status = result.isNewSession ? StatusCodes.CREATED : StatusCodes.OK;

      return {
        message: result.isNewSession
          ? `New ${botType} session created`
          : `Existing ${botType} session fetched`,
        data: result,
      };
    },
    {
      query: chatSchema.getSessionQuery,
    }
  )

  .post(
    "/sati/check-message",
    async ({ body, user, set }) => {
      const result = await chatService.processSatiMessage(
        Number(user.id),
        body.content
      );

      if (!result) {
        set.status = StatusCodes.BAD_REQUEST;
        return {
          message: "Invalid data format. Unable to process JSON.",
          data: null,
        };
      }

      set.status = StatusCodes.OK;
      return {
        message: "Successfully parsed message",
        data: result,
      };
    },
    {
      body: chatSchema.checkMessage,
    }
  )

  .post(
    "/sati/log",
    async ({ body, user, set }) => {
      const userId = Number(user.id);
      const result = await chatService.chatWithSati(userId, body);

      set.status = StatusCodes.CREATED;
      return result;
    },
    {
      body: chatSchema.satiLog,
    }
  )

  .post(
    "/satang",
    async function* ({ body, user }) {
      const stream = chatService.chatWithSatang(Number(user.id), body.content);

      for await (const chunk of stream) {
        yield chunk;
      }
    },
    {
      body: chatSchema.chatMessage,
    }
  );
