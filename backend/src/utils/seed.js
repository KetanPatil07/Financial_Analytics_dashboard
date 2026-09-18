import "dotenv/config";
import mongoose from "mongoose";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { connectDb } from "../config/db.js";
import { Transaction } from "../models/Transaction.js";
import { User } from "../models/User.js";
import { enrichUser } from "./users.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.resolve(__dirname, "../../../data/transactions (1).json");

async function seed() {
  await connectDb();
  const raw = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  const docs = raw.map((row) => {
    const meta = enrichUser(row.user_id, row.user_profile);
    return {
      ...row,
      date: new Date(row.date),
      user_name: meta.name,
      user_profile: meta.avatar,
    };
  });

  await Transaction.deleteMany({});
  await Transaction.insertMany(docs);

  const demoEmail = "admin@penta.com";
  const existing = await User.findOne({ email: demoEmail });
  if (!existing) {
    await User.create({
      name: "Ketan Patil",
      email: demoEmail,
      password: "Admin@123",
      avatar: "https://i.pravatar.cc/150?u=admin@penta.com",
    });
  }

  console.log(`Seeded ${docs.length} transactions and demo user ${demoEmail} / Admin@123`);
  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
