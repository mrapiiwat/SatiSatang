import { jwt } from "@elysiajs/jwt";
import { Elysia } from "elysia";

export const setup = new Elysia({ name: "setup" }).use(
  jwt({
    name: "jwt",
    secret: Bun.env.JWT_SECRET!,
    exp: Bun.env.ACCESS_TOKEN_EXPIRES,
  })
);
