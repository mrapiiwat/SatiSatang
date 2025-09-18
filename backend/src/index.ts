import express, { Request, Response } from "express";
import prisma from "./common/config/prismaClient";
import morgan from "morgan";

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080;

app.use(morgan("dev"));
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
