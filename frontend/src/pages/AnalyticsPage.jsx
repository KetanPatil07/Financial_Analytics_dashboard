import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { api } from "../api.js";
import { formatMoney } from "../utils/format.js";

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/transactions/stats").then(({ data }) => setStats(data));
  }, []);

  const pie = [
    { name: "Paid", value: stats?.status?.paid || 0, color: "#22c55e" },
    { name: "Pending", value: stats?.status?.pending || 0, color: "#f59e0b" },
  ];

  return (
    <div className="page">
      <section className="split">
        <article className="panel">
          <div className="panel-head">
            <h2>Status overview</h2>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pie} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110}>
                  {pie.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="muted center">
            Paid {stats?.status?.paid || 0} · Pending {stats?.status?.pending || 0}
          </p>
        </article>
        <article className="panel">
          <div className="panel-head">
            <h2>Category × status</h2>
          </div>
          <ul className="stat-list">
            {(stats?.categoryStatus || []).map((row) => (
              <li key={`${row._id.category}-${row._id.status}`}>
                <span>
                  {row._id.category} · {row._id.status}
                </span>
                <strong>
                  {row.count} · {formatMoney(row.total)}
                </strong>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}
