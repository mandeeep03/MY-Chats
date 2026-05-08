import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import app from "./app.js";
import { initSocket } from "./socket/index.js";
import logger from "./utils/logger.js";

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  logger.error("MONGO_URI is not defined in environment variables");
  process.exit(1);
}

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

initSocket(io);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    logger.error("MongoDB connection failed:", err);
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected, attempting to reconnect...");
});

mongoose.connection.on("reconnected", () => {
  logger.info("MongoDB reconnected");
});

const startServer = async () => {
  await connectDB();
  httpServer.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
};

process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down gracefully...");
  httpServer.close(async () => {
    await mongoose.connection.close();
    logger.info("Process terminated");
    process.exit(0);
  });
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});

startServer();
