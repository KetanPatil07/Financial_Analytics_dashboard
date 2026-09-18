import { useEffect, useState } from "react";
import { api } from "../api.js";
import { formatMoney } from "../utils/format.js";

export default function WalletPage() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    api.get("/transactions/stats").then(({ data }) => setStats(data));
  }, []);

  return (
    <div className="page">
      <article className="panel">
        <div className="panel-head">
          <h2>Wallet</h2>
        </div>
        <p className="muted">Available balance across 2024 paid and pending activity.</p>
        <div className="wallet-grid">
          <div>
            <span>Current balance</span>
            <strong>{formatMoney(stats?.kpis?.balance)}</strong>
          </div>
          <div>
            <span>Paid volume</span>
            <strong>{formatMoney(stats?.status?.paidTotal)}</strong>
          </div>
          <div>
            <span>Pending volume</span>
            <strong>{formatMoney(stats?.status?.pendingTotal)}</strong>
          </div>
        </div>
      </article>
    </div>
  );
}
