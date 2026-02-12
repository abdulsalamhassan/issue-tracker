import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import config from "./config";
import healthRouter from "./routes/health";
import authRouter from "./routes/auth.routes";
import projectRouter from "./routes/project.routes";
import issueRouter from "./routes/issue.routes";
import cookieParser from "cookie-parser";
import { connectDB } from "./utils/db";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Basic routes
app.use("/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/projects", projectRouter);
app.use("/api", issueRouter);

// Centralized error handler
app.use(errorHandler);

// Connect to DB if MONGO_URI provided (non-blocking here)
const mongoUri = config.MONGO_URI;
connectDB(mongoUri).catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
});

export default app;
