import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    date: { type: Date, required: true, index: true },
    amount: { type: Number, required: true },
    category: { type: String, enum: ["Revenue", "Expense"], required: true, index: true },
    status: { type: String, enum: ["Paid", "Pending"], required: true, index: true },
    user_id: { type: String, required: true, index: true },
    user_profile: { type: String, default: "" },
    user_name: { type: String, default: "" },
  },
  { timestamps: true }
);

transactionSchema.index({ date: -1, amount: 1 });
transactionSchema.index({ user_id: 1, category: 1, status: 1 });

export const Transaction = mongoose.model("Transaction", transactionSchema);
