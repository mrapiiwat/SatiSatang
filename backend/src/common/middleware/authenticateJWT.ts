import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { verifyAccessToken } from "../utils/jwt";

export interface AuthRequest extends Request { userId?: number; }

export function authenticateJWT(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;
        let token;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        } else {
            token = req.cookies?.token;
        }
        if (!token) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "No token" });
        }
        const decoded = verifyAccessToken(token!);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        return res.status(httpStatus.UNAUTHORIZED).json({ error: "Invalid or expired access token" });
    }
}