import { Response } from "express";
import { AuthRequest } from "../../common/middleware/authenticateJWT";
import httpStatus from "http-status";
import prisma from "../../common/config/prismaClient";


export const me = async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
        res.status(httpStatus.BAD_REQUEST).json({
            error:
                "Oops! We couldn't find your user info. Please log in again to continue.",
        });
        return;
    }
    const user = await prisma.user.findUnique({ where: { id: req.userId }, include: { oauthAccounts: true } });
    if (!user) return res.status(404).json({ error: "Not found" });
    res.json({ id: user.id, email: user.email, name: user.name, oauthAccounts: user.oauthAccounts });
};

