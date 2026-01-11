import { jwt } from "@elysiajs/jwt";
import { Elysia } from "elysia";

export const setup = new Elysia({ name: "setup" }).use(
  jwt({
    name: "jwt",
    secret: process.env.JWT_SECRET!,
    exp: process.env.ACCESS_TOKEN_EXPIRES,
  })
);
