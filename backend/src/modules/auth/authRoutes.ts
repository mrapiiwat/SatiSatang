import { Router } from "express";
import * as authController from "./authController";
import passport from "passport";
import { authenticateJWT } from "../../common/middleware/authenticateJWT";

const router = Router();

//local auth
router.post("/check-email", authController.checkEmail);
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/verify-email", authController.verifyEmail);

//logout
router.get("/logout", authenticateJWT, authController.logout);


//google oauth
router.get("/google", passport.authenticate("google", {
    scope: ["profile", "email"],
    accessType: "offline",
    prompt: "consent",
}));
router.get("/google/callback", authController.googleAuthCallback);

//facebook oauth
router.get("/facebook", passport.authenticate("facebook", { scope: ["email"] }));
router.get("/facebook/callback", authController.facebookAuthCallback);

//Refresh Token
router.get("/refreshToken", authController.refreshToken)

export default router;
