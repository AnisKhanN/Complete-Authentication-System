import userModel from "../models/UserModel.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import { extractAccessToken } from "../middlewares/authMiddleware.js";
import { sendOtpEmail } from "../services/emailService.js";
import sessionModel from "../models/sessionModel.js";

// Helper: Hash password (SHA256 for backwards compatibility)
const hashPassword = (password) => {
  return crypto.createHash("sha256").update(password).digest("hex");
};

// Helper: Generate Access and Refresh JWT Tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId, type: "access" },
    config.JWT_SECRET,
    { expiresIn: "10m" },
  );
  const refreshToken = jwt.sign(
    { id: userId, type: "refresh" },
    config.JWT_SECRET,
    { expiresIn: "7d" },
  );
  return { accessToken, refreshToken };
};

// Helper: Set Tokens in httpOnly Cookies
const setTokenCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === "production";
  const sameSiteMode = isProduction ? "strict" : "lax";

  if (accessToken) {
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: sameSiteMode,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
  }
  if (refreshToken) {
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: sameSiteMode,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
};

// Helper: Clear Auth Cookies
const clearTokenCookies = (res) => {
  const isProduction = process.env.NODE_ENV === "production";
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
  };
  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);
};

// Helper: Sanitize User Document (remove sensitive fields)
const sanitizeUser = (user) => {
  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.password;
  delete userObj.refreshTokens;
  delete userObj.resetOtp;
  delete userObj.resetOtpExpires;
  return userObj;
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await userModel.findOne({
      $or: [{ email: normalizedEmail }, { name: name.trim() }],
    });
    console.log(existingUser);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });
    }

    const hashedPassword = hashPassword(password);
    const user = new userModel({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      refreshTokens: [],
    });

    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save refresh token in user document for device session tracking
    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    setTokenCookies(res, accessToken, refreshToken);

    // Track active device session safely
    try {
      const userAgent = req.headers["user-agent"] || "Unknown";
      const ipAddress =
        req.ip ||
        req.headers["x-forwarded-for"] ||
        req.socket?.remoteAddress ||
        "127.0.0.1";
      const deviceType = userAgent.includes("Mobile") ? "Mobile" : "Desktop";
      const refreshTokenHash = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

      await sessionModel.create({
        userId: user._id,
        refreshTokenHash,
        ipAddress: String(ipAddress),
        userAgent: String(userAgent),
        deviceType,
      });
    } catch (sessionErr) {
      console.warn("Session tracking notice (non-fatal):", sessionErr.message);
    }

    return res.status(201).json({
      message: "User created successfully",
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await userModel.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const hashedPassword = hashPassword(password);
    if (user.password !== hashedPassword) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    // Limit active sessions per user to 10
    if (!Array.isArray(user.refreshTokens)) {
      user.refreshTokens = [];
    }
    user.refreshTokens.push({ token: refreshToken });
    if (user.refreshTokens.length > 10) {
      user.refreshTokens = user.refreshTokens.slice(-10);
    }
    await user.save();

    setTokenCookies(res, accessToken, refreshToken);

    // Track active device session safely
    try {
      const userAgent = req.headers["user-agent"] || "Unknown";
      const ipAddress =
        req.ip ||
        req.headers["x-forwarded-for"] ||
        req.socket?.remoteAddress ||
        "127.0.0.1";
      const deviceType = userAgent.includes("Mobile") ? "Mobile" : "Desktop";
      const refreshTokenHash = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

      await sessionModel.create({
        userId: user._id,
        refreshTokenHash,
        ipAddress: String(ipAddress),
        userAgent: String(userAgent),
        deviceType,
      });
    } catch (sessionErr) {
      console.warn("Session tracking notice (non-fatal):", sessionErr.message);
    }

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/auth/get-me
const getMe = async (req, res) => {
  try {
    // If request already passed verifyAuth middleware, req.user is set
    if (req.user) {
      return res.status(200).json({
        message: "User found successfully",
        user: sanitizeUser(req.user),
      });
    }

    const token = extractAccessToken(req);
    if (!token) {
      return res.status(401).json({ message: "Token not found" });
    }

    const decodedToken = jwt.verify(token, config.JWT_SECRET);
    if (decodedToken.type && decodedToken.type !== "access") {
      return res.status(401).json({ message: "Token invalid" });
    }

    const user = await userModel.findById(decodedToken.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User found successfully",
      user: sanitizeUser(user),
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token expired" });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Token invalid" });
    }
    console.error("GetMe Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/auth/refresh-token
const refreshToken = async (req, res) => {
  try {
    const token =
      req.cookies?.refreshToken ||
      req.body?.refreshToken ||
      (req.headers.authorization?.match(/Bearer\s+([^\s,;]+)/i)?.[1] ??
        req.headers.authorization?.split(" ")[1]);

    if (!token) {
      return res.status(401).json({ message: "Refresh token not found" });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    if (decoded.type && decoded.type !== "refresh") {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    const session = await sessionModel.findOne({ refreshTokenHash });
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    if (session.isRevoked) {
      return res.status(403).json({ message: "Session revoked" });
    }

    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify token exists in user's active sessions (revocation check)
    const tokenExists = user.refreshTokens?.some((t) => t.token === token);
    if (!tokenExists) {
      return res
        .status(403)
        .json({ message: "Refresh token revoked or invalid" });
    }

    // Issue a new accessToken
    const newAccessToken = jwt.sign(
      { id: user._id, type: "access" },
      config.JWT_SECRET,
      { expiresIn: "10m" },
    );

    setTokenCookies(res, newAccessToken, null);

    return res.status(200).json({
      message: "Token refreshed successfully",
      accessToken: newAccessToken,
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Refresh token expired" });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }
    console.error("Refresh Token Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET or POST /api/auth/logout (Current Device)
const logout = async (req, res) => {
  try {
    const token =
      req.cookies?.refreshToken ||
      req.body?.refreshToken ||
      req.query?.refreshToken ||
      (req.headers.authorization?.match(/Bearer\s+([^\s,;]+)/i)?.[1] ??
        req.headers.authorization?.split(" ")[1]);

    if (token) {
      try {
        let userId = null;
        try {
          const decoded = jwt.verify(token, config.JWT_SECRET);
          userId = decoded.id;
        } catch {
          const decoded = jwt.decode(token);
          userId = decoded?.id;
        }

        if (userId) {
          await userModel.findByIdAndUpdate(userId, {
            $pull: { refreshTokens: { token } },
          });
        }

        const refreshTokenHash = crypto
          .createHash("sha256")
          .update(token)
          .digest("hex");

        await sessionModel.updateMany(
          { refreshTokenHash },
          { $set: { isRevoked: true, logoutAt: new Date() } },
        );
      } catch (err) {
        console.warn("Non-fatal logout cleanup warning:", err.message);
      }
    }

    clearTokenCookies(res);

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/auth/logout-all (All Devices)
const logoutAll = async (req, res) => {
  try {
    const token = extractAccessToken(req);

    if (!req.user?._id && !token) {
      return res.status(401).json({ message: "Token not found" });
    }

    const userId = req.user?._id || jwt.verify(token, config.JWT_SECRET).id;

    // Invalidate all refresh tokens for this user across all devices
    await userModel.findByIdAndUpdate(userId, {
      $set: { refreshTokens: [] },
    });

    try {
      await sessionModel.updateMany(
        { userId, isRevoked: false },
        { $set: { isRevoked: true, logoutAt: new Date() } },
      );
    } catch (sessionErr) {
      console.warn("Session revocation warning:", sessionErr.message);
    }

    clearTokenCookies(res);

    return res
      .status(200)
      .json({ message: "Logged out from all devices successfully" });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token expired" });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Token invalid" });
    }
    console.error("Logout All Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/auth/send-otp
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await userModel.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate secure 6-digit numeric OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Store OTP with 10-minute expiry
    user.resetOtp = otp;
    user.resetOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    console.log(`[AUTH] Generated OTP for ${normalizedEmail}: ${otp}`);

    // Dispatch real OTP email via Gmail SMTP
    const emailDelivery = await sendOtpEmail(normalizedEmail, otp);

    if (!emailDelivery.success) {
      return res.status(500).json({
        message: `Failed to deliver verification code to ${normalizedEmail}: ${emailDelivery.error || "SMTP delivery error"}`,
        delivery: "failed",
      });
    }

    return res.status(200).json({
      message: `Verification code sent to ${normalizedEmail}. Please check your Gmail inbox.`,
      delivery: "delivered",
    });
  } catch (error) {
    console.error("Send OTP Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/auth/verify-otp
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await userModel.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.resetOtp || user.resetOtp !== String(otp).trim()) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (!user.resetOtpExpires || user.resetOtpExpires < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email, OTP and new password are required" });
    }

    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await userModel.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.resetOtp || user.resetOtp !== String(otp).trim()) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (!user.resetOtpExpires || user.resetOtpExpires < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Set new password, clear OTP, and revoke all active device sessions
    user.password = hashPassword(newPassword);
    user.resetOtp = null;
    user.resetOtpExpires = null;
    user.refreshTokens = [];
    await user.save();

    try {
      await sessionModel.updateMany(
        { userId: user._id, isRevoked: false },
        { $set: { isRevoked: true, logoutAt: new Date() } },
      );
    } catch (sessionErr) {
      console.warn("Session revocation warning:", sessionErr.message);
    }

    clearTokenCookies(res);

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET or POST /api/auth/get-devices
const getDevices = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const devices = await sessionModel.find({ userId }).sort({ loginAt: -1 });

    return res.status(200).json({
      success: true,
      count: devices.length,
      devices,
    });
  } catch (error) {
    console.error("Get Devices Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export {
  register,
  login,
  getMe,
  refreshToken,
  logout,
  logoutAll,
  getDevices,
  sendOtp,
  verifyOtp,
  resetPassword,
};
