import app from "./app.js";
import dotenv from "dotenv";
import { prisma } from "./config/db.js";

dotenv.config({ path: ".env" });

const PORT = process.env.PORT || 4000;

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  // Application should continue running despite unhandled promises
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  // Give server time to handle ongoing requests before shutting down
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log("Shutting down gracefully...");
  try {
    await prisma.$disconnect();
    console.log("Database disconnected successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error during graceful shutdown:", error);
    process.exit(1);
  }
};

// Listen for termination signals
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// Run DB migrations for new tables
const runMigrations = async () => {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "VideoSection" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        title TEXT,
        url TEXT NOT NULL,
        "order" INTEGER NOT NULL DEFAULT 0,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "VideoSectionSettings" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "autoScroll" BOOLEAN NOT NULL DEFAULT true
      )
    `);
    console.log("✅ Video tables migration complete");
  } catch (e) {
    console.error("Migration error (non-fatal):", e.message);
  }
};

// Connect to the database and start the server
prisma
  .$connect()
  .then(async () => {
    await runMigrations();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} 🚀`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
    process.exit(1);
  });
