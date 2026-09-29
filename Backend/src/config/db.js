import mongoose from "mongoose";
import dns from "dns";
import config from "./config.js";

// Prefer reliable public DNS servers for SRV lookups on Windows
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // Use system default DNS
}

async function connectDB() {
  const primaryUri = config.MONGO_URI;
  const localUri = "mongodb://127.0.0.1:27017/authenticationDB";

  if (primaryUri) {
    try {
      console.log("[DB] Attempting connection to MongoDB Atlas...");
      await mongoose.connect(primaryUri, { serverSelectionTimeoutMS: 3000 });
      console.log("[DB] MongoDB Atlas connected successfully");
      return;
    } catch (atlasError) {
      console.warn(
        "[DB] MongoDB Atlas connection failed (often caused by dynamic IP not whitelisted in Atlas):",
        atlasError.message
      );
      console.log("[DB] Falling back to local MongoDB service...");
    }
  }

  try {
    await mongoose.connect(localUri);
    console.log("[DB] Local MongoDB connected successfully at mongodb://127.0.0.1:27017/authenticationDB");
  } catch (localError) {
    console.error("[DB] Fatal: Could not connect to either MongoDB Atlas or Local MongoDB:", localError.message);
    process.exit(1);
  }
}
export default connectDB;
