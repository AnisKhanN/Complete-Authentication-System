import { Router } from "express";
import * as authController from "../controllers/authController.js";
import { verifyAuth } from "../middlewares/authMiddleware.js";

const router = Router();

// Core Authentication
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/get-me", verifyAuth, authController.getMe);
router.post("/refresh-token", authController.refreshToken);
router.get("/logout", authController.logout);
router.post("/logout", authController.logout);
router.get("/logout-all", verifyAuth, authController.logoutAll);
router.post("/logout-all", verifyAuth, authController.logoutAll);
router.get("/get-devices", verifyAuth, authController.getDevices);
router.post("/get-devices", verifyAuth, authController.getDevices);

// OTP & Password Reset
router.post("/send-otp", authController.sendOtp);
router.post("/verify-otp", authController.verifyOtp);
router.post("/reset-password", authController.resetPassword);

export default router;
