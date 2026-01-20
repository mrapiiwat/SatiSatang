import type { Elysia } from "elysia";
import { StatusCodes } from "http-status-codes";
import {
  AppError,
  BadRequestError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@/common/errors";

export const errorMiddleware = (app: Elysia) =>
  app.onError(({ code, error, set }) => {
    if (error instanceof AppError) {
      set.status = error.statusCode;
      return error.serialize();
    }

    if (code === "VALIDATION") {
      const validationError = new ValidationError("Validation failed");
      set.status = StatusCodes.UNPROCESSABLE_ENTITY;
      return {
        ...validationError.serialize(),
        errors: error.all,
      };
    }

    if (code === "NOT_FOUND") {
      const notFound = new NotFoundError("Path not found");
      set.status = notFound.statusCode;
      return notFound.serialize();
    }

    if (code === "PARSE") {
      const badRequest = new BadRequestError("Invalid JSON format");
      set.status = StatusCodes.BAD_REQUEST;
      return badRequest.serialize();
    }

    if (code === "INVALID_COOKIE_SIGNATURE") {
      const unauthorized = new UnauthorizedError("Invalid cookie signature");
      set.status = unauthorized.statusCode;
      return unauthorized.serialize();
    }

    if (error instanceof Error) {
      set.status = StatusCodes.BAD_REQUEST;
      return {
        message: "Something went wrong!",
        errors: error.message,
      };
    }

    const internalError = new InternalServerError(
      "Internal Server Error - Something went wrong!"
    );
    set.status = StatusCodes.INTERNAL_SERVER_ERROR;
    console.error("🔥 System Error:", error);
    return internalError.serialize();
  });
