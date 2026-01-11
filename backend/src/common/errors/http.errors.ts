import { StatusCodes } from "http-status-codes";
import { AppError } from "./base.error";

export class NotFoundError extends AppError {
  statusCode = StatusCodes.NOT_FOUND;
  serialize() {
    return { success: false, error: "NOT_FOUND", message: this.message };
  }
}

export class BadRequestError extends AppError {
  statusCode = StatusCodes.BAD_REQUEST;
  serialize() {
    return { success: false, error: "BAD_REQUEST", message: this.message };
  }
}

export class InternalServerError extends AppError {
  statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  serialize() {
    return {
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: this.message,
    };
  }
}

export class ValidationError extends AppError {
  statusCode = StatusCodes.UNPROCESSABLE_ENTITY;
  serialize() {
    return { success: false, error: "VALIDATION_ERROR", message: this.message };
  }
}

export class UnauthorizedError extends AppError {
  statusCode = StatusCodes.UNAUTHORIZED;
  serialize() {
    return { success: false, error: "UNAUTHORIZED", message: this.message };
  }
}

export class TooManyRequestsError extends AppError {
  statusCode = StatusCodes.TOO_MANY_REQUESTS;
  serialize() {
    return {
      success: false,
      error: "TOO_MANY_REQUESTS",
      message: this.message,
    };
  }
}
