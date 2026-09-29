import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: [true, "User ID is required"],
    },
    refreshTokenHash: {
      type: String,
      required: [true, "Refresh Token Hash is required"],
    },
    ipAddress: {
      type: String,
      required: [true, "IP Address is required"],
      default: "127.0.0.1",
    },
    userAgent: {
      type: String,
      required: [true, "User Agent is required"],
      default: "Unknown",
    },
    deviceType: {
      type: String,
      default: "Desktop",
    },
    os: {
      type: String,
      default: "Unknown",
    },
    browser: {
      type: String,
      default: "Unknown",
    },
    country: {
      type: String,
      default: "Unknown",
    },
    city: {
      type: String,
      default: "Unknown",
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
    loginAt: {
      type: Date,
      default: Date.now,
    },
    logoutAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true, collection: "Sessions" },
);

const sessionModel = mongoose.model("Sessions", sessionSchema, "Sessions");

// Automatically create collection in MongoDB database if it does not exist yet
sessionModel.createCollection().catch(() => {});

export { sessionModel };
export default sessionModel;
