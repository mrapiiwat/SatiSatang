import prisma from "../config/prismaClient";

export const stock = async () => {
    return await prisma.stock.findMany()
}
