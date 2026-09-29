import jwt from "jsonwebtoken";
import config from "../config/config.js";
import userModel from "../models/UserModel.js";
export const extractAccessToken = (req) => {
  if (req.headers.authorization) {
    const match = req.headers.authorization.match(/Bearer\s+([^\s,;]+)/i);
    if (match) return match[1];
    if (!req.headers.authorization.includes(" "))
      return req.headers.authorization.trim();
  }
  return req.cookies?.accessToken || req.body?.accessToken || null;
};

export const verifyAuth = async (req, res, next) => {
  try {
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

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token expired" });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Token invalid" });
    }
    console.error("Auth Middleware Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
