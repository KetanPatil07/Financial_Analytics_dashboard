import * as XLSX from "xlsx";
import { Transaction } from "../models/Transaction.js";
import { enrichUser } from "../utils/users.js";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function buildMatch(query) {
  const match = {};
  const { category, status, user_id, search, from, to, minAmount, maxAmount } = query;

  if (category && category !== "all") match.category = category;
  if (status && status !== "all") match.status = status;
  if (user_id && user_id !== "all") match.user_id = user_id;

  if (from || to) {
    match.date = {};
    if (from) match.date.$gte = new Date(from);
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      match.date.$lte = end;
    }
  }

  if (minAmount || maxAmount) {
    match.amount = {};
    if (minAmount) match.amount.$gte = Number(minAmount);
    if (maxAmount) match.amount.$lte = Number(maxAmount);
  }

  if (search) {
    const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    match.$or = [
      { user_id: regex },
      { user_name: regex },
      { category: regex },
      { status: regex },
    ];
    if (!Number.isNaN(Number(search))) {
      match.$or.push({ id: Number(search) });
      match.$or.push({ amount: Number(search) });
    }
  }

  return match;
}

function serialize(doc) {
  const meta = enrichUser(doc.user_id, doc.user_profile);
  return {
    id: doc.id,
    date: doc.date,
    amount: doc.amount,
    category: doc.category,
    status: doc.status,
    user_id: doc.user_id,
    user_name: doc.user_name || meta.name,
    user_profile: doc.user_profile || meta.avatar,
  };
}

export async function listTransactions(req, res) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 8));
    const sortField = ["date", "amount", "status", "category", "user_id", "id"].includes(req.query.sort)
      ? req.query.sort
      : "date";
    const sortDir = req.query.order === "asc" ? 1 : -1;

    const match = buildMatch(req.query);
    const [items, total] = await Promise.all([
      Transaction.find(match)
        .sort({ [sortField]: sortDir })
        .skip((page - 1) * limit)
        .limit(limit),
      Transaction.countDocuments(match),
    ]);

    res.json({
      items: items.map(serialize),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getRecent(req, res) {
  try {
    const items = await Transaction.find().sort({ date: -1 }).limit(5);
    res.json({ items: items.map(serialize) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getStats(req, res) {
  try {
    const match = buildMatch(req.query);
    const [totals, monthly, statusCounts, categoryStatus] = await Promise.all([
      Transaction.aggregate([
        { $match: match },
        {
          $group: {
            _id: "$category",
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]),
      Transaction.aggregate([
        { $match: match },
        {
          $group: {
            _id: { month: { $month: "$date" }, category: "$category" },
            total: { $sum: "$amount" },
          },
        },
        { $sort: { "_id.month": 1 } },
      ]),
      Transaction.aggregate([
        { $match: match },
        { $group: { _id: "$status", count: { $sum: 1 }, total: { $sum: "$amount" } } },
      ]),
      Transaction.aggregate([
        { $match: match },
        {
          $group: {
            _id: { category: "$category", status: "$status" },
            count: { $sum: 1 },
            total: { $sum: "$amount" },
          },
        },
      ]),
    ]);

    const revenue = totals.find((t) => t._id === "Revenue")?.total || 0;
    const expenses = totals.find((t) => t._id === "Expense")?.total || 0;
    const balance = revenue - expenses;
    const savings = Math.max(0, balance);

    const overview = MONTHS.map((label, index) => {
      const month = index + 1;
      const income = monthly.find((m) => m._id.month === month && m._id.category === "Revenue")?.total || 0;
      const expense = monthly.find((m) => m._id.month === month && m._id.category === "Expense")?.total || 0;
      return { month: label, income, expenses: expense };
    });

    const paid = statusCounts.find((s) => s._id === "Paid") || { count: 0, total: 0 };
    const pending = statusCounts.find((s) => s._id === "Pending") || { count: 0, total: 0 };

    res.json({
      kpis: { balance, revenue, expenses, savings },
      overview,
      status: {
        paid: paid.count,
        pending: pending.count,
        paidTotal: paid.total,
        pendingTotal: pending.total,
      },
      categoryStatus,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getFilters(_req, res) {
  try {
    const users = await Transaction.distinct("user_id");
    res.json({
      categories: ["Revenue", "Expense"],
      statuses: ["Paid", "Pending"],
      users: users.sort().map((id) => ({ id, ...enrichUser(id) })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

function exportRows(docs, columns) {
  const allowed = columns?.length
    ? columns
    : ["id", "date", "amount", "category", "status", "user_id", "user_name"];
  return docs.map((doc) => {
    const item = serialize(doc);
    const row = {};
    for (const col of allowed) {
      if (col === "date") row.date = new Date(item.date).toISOString();
      else row[col] = item[col];
    }
    return row;
  });
}

export async function exportCsv(req, res) {
  try {
    const match = buildMatch(req.query);
    const docs = await Transaction.find(match).sort({ date: -1 });
    const columns = req.query.columns ? String(req.query.columns).split(",") : undefined;
    const rows = exportRows(docs, columns);
    const fields = Object.keys(rows[0] || { id: 1 });
    const csv = [
      fields.join(","),
      ...rows.map((row) =>
        fields
          .map((field) => {
            const value = row[field] == null ? "" : String(row[field]);
            return `"${value.replaceAll('"', '""')}"`;
          })
          .join(",")
      ),
    ].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=transactions.csv");
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function exportExcel(req, res) {
  try {
    const match = buildMatch(req.query);
    const docs = await Transaction.find(match).sort({ date: -1 });
    const columns = req.query.columns ? String(req.query.columns).split(",") : undefined;
    const rows = exportRows(docs, columns);
    const sheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Transactions");
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=transactions.xlsx");
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
