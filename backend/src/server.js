import "dotenv/config";
import cors from "cors";
import express from "express";
import { connectDb } from "./config/db.js";
import { requireAuth } from "./middleware/auth.js";
import authRoutes from "./routes/auth.js";
import transactionRoutes from "./routes/transactions.js";

const app = express();
app.use(cors({ origin: ["http://localhost:5173", "http://127.0.0.1:5173"], credentials: true }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "penta-api" });
});

app.use("/api/auth", (req, res, next) => {
  if (req.path === "/profile") return requireAuth(req, res, next);
  next();
}, authRoutes);

app.use("/api/transactions", requireAuth, transactionRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

const port = Number(process.env.PORT) || 5000;

connectDb()
  .then(() => {
    app.listen(port, () => console.log(`API running on http://localhost:${port}`));
  })
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
