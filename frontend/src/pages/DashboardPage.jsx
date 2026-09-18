import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Calendar, Search, Wallet, TrendingUp, CreditCard, PiggyBank } from "lucide-react";
import { api } from "../api.js";
import { formatDate, formatMoney, statusLabel } from "../utils/format.js";

const kpiMeta = [
  { key: "balance", label: "Balance", icon: Wallet },
  { key: "revenue", label: "Revenue", icon: TrendingUp },
  { key: "expenses", label: "Expenses", icon: CreditCard },
  { key: "savings", label: "Savings", icon: PiggyBank },
];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("2024-01-01");
  const [to, setTo] = useState("2024-12-31");
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.get("/transactions/stats", { params: { from, to } }).then(({ data }) => setStats(data));
    api.get("/transactions/recent").then(({ data }) => setRecent(data.items));
  }, [from, to]);

  useEffect(() => {
    const timer = setTimeout(() => {
      api
        .get("/transactions", { params: { search, from, to, page, limit: 8, sort: "date", order: "desc" } })
        .then(({ data }) => {
          setRows(data.items);
          setPagination(data.pagination);
        });
    }, 200);
    return () => clearTimeout(timer);
  }, [search, from, to, page]);

  const chartData = useMemo(() => stats?.overview || [], [stats]);

  return (
    <div className="page">
      <section className="kpi-grid">
        {kpiMeta.map((item) => {
          const Icon = item.icon;
          return (
            <article className="kpi-card" key={item.key}>
              <div className="kpi-icon">
                <Icon size={18} />
              </div>
              <div>
                <p>{item.label}</p>
                <h3>{formatMoney(stats?.kpis?.[item.key] || 0)}</h3>
              </div>
            </article>
          );
        })}
      </section>

      <section className="split">
        <article className="panel chart-panel">
          <div className="panel-head">
            <h2>Overview</h2>
            <div className="legend">
              <span className="dot income" /> Income
              <span className="dot expense" /> Expenses
              <select defaultValue="Monthly">
                <option>Monthly</option>
              </select>
            </div>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="month" stroke="#8b92a8" tickLine={false} axisLine={false} />
                <YAxis stroke="#8b92a8" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "#151821", border: "1px solid #2a3144", borderRadius: 12 }}
                  formatter={(value, name) => [formatMoney(value), name === "income" ? "Income" : "Expenses"]}
                />
                <Area type="monotone" dataKey="income" stroke="#22c55e" fill="url(#incomeFill)" strokeWidth={3} />
                <Area type="monotone" dataKey="expenses" stroke="#f59e0b" fill="url(#expenseFill)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel">
          <div className="panel-head">
            <h2>Recent Transaction</h2>
            <button className="text-link" type="button">See all</button>
          </div>
          <ul className="recent-list">
            {recent.map((tx) => (
              <li key={tx.id}>
                <img src={tx.user_profile} alt={tx.user_name} />
                <div>
                  <strong>Transfers {tx.category === "Revenue" ? "from" : "to"}</strong>
                  <p>{tx.user_name}</p>
                </div>
                <span className={tx.category === "Revenue" ? "pos" : "neg"}>
                  {tx.category === "Revenue" ? "+" : "-"}
                  {formatMoney(tx.amount)}
                </span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <article className="panel">
        <div className="panel-head table-tools">
          <h2>Transactions</h2>
          <label className="search">
            <Search size={16} />
            <input
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder="Search for anything..."
            />
          </label>
          <label className="date-range">
            <Calendar size={16} />
            <input type="date" value={from} onChange={(e) => { setPage(1); setFrom(e.target.value); }} />
            <span>—</span>
            <input type="date" value={to} onChange={(e) => { setPage(1); setTo(e.target.value); }} />
          </label>
        </div>
        <TransactionTable rows={rows} />
        <div className="pager">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
          <span>
            Page {pagination.page} of {pagination.pages} · {pagination.total} records
          </span>
          <button type="button" disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      </article>
    </div>
  );
}

export function TransactionTable({ rows }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((tx) => (
            <tr key={tx.id}>
              <td>
                <div className="person">
                  <img src={tx.user_profile} alt="" />
                  <span>{tx.user_name}</span>
                </div>
              </td>
              <td>{formatDate(tx.date)}</td>
              <td className={tx.category === "Revenue" ? "pos" : "neg"}>
                {tx.category === "Revenue" ? "+" : "-"}
                {formatMoney(tx.amount)}
              </td>
              <td>
                <span className={`badge ${tx.status === "Paid" ? "ok" : "warn"}`}>
                  {statusLabel(tx.status)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
