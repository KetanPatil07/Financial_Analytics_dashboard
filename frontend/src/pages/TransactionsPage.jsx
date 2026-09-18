import { useEffect, useState } from "react";
import { Download, Search } from "lucide-react";
import { api } from "../api.js";
import { TransactionTable } from "./DashboardPage.jsx";

const COLUMNS = [
  { id: "id", label: "ID" },
  { id: "date", label: "Date" },
  { id: "amount", label: "Amount" },
  { id: "category", label: "Category" },
  { id: "status", label: "Status" },
  { id: "user_id", label: "User ID" },
  { id: "user_name", label: "Name" },
];

export default function TransactionsPage() {
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({ categories: [], statuses: [], users: [] });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [query, setQuery] = useState({
    search: "",
    category: "all",
    status: "all",
    user_id: "all",
    from: "2024-01-01",
    to: "2024-12-31",
    sort: "date",
    order: "desc",
    page: 1,
    limit: 10,
  });
  const [columns, setColumns] = useState(COLUMNS.map((c) => c.id));
  const [showExport, setShowExport] = useState(false);

  useEffect(() => {
    api.get("/transactions/filters").then(({ data }) => setFilters(data));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      api.get("/transactions", { params: query }).then(({ data }) => {
        setRows(data.items);
        setPagination(data.pagination);
      });
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  function update(partial) {
    setQuery((prev) => ({ ...prev, page: 1, ...partial }));
  }

  async function download(kind) {
    const params = new URLSearchParams({ ...query, columns: columns.join(",") });
    const path = kind === "excel" ? "/transactions/export/excel" : "/transactions/export";
    const { data } = await api.get(`${path}?${params.toString()}`, { responseType: "blob" });
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = kind === "excel" ? "transactions.xlsx" : "transactions.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="page">
      <article className="panel">
        <div className="panel-head table-tools wrap">
          <h2>All transactions</h2>
          <label className="search">
            <Search size={16} />
            <input
              value={query.search}
              onChange={(e) => update({ search: e.target.value })}
              placeholder="Search name, status, amount..."
            />
          </label>
          <select value={query.category} onChange={(e) => update({ category: e.target.value })}>
            <option value="all">All categories</option>
            {filters.categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select value={query.status} onChange={(e) => update({ status: e.target.value })}>
            <option value="all">All statuses</option>
            {filters.statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select value={query.user_id} onChange={(e) => update({ user_id: e.target.value })}>
            <option value="all">All users</option>
            {filters.users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          <select value={query.sort} onChange={(e) => update({ sort: e.target.value })}>
            <option value="date">Sort by date</option>
            <option value="amount">Sort by amount</option>
            <option value="status">Sort by status</option>
            <option value="category">Sort by category</option>
          </select>
          <select value={query.order} onChange={(e) => update({ order: e.target.value })}>
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
          <input type="date" value={query.from} onChange={(e) => update({ from: e.target.value })} />
          <input type="date" value={query.to} onChange={(e) => update({ to: e.target.value })} />
          <button className="primary-btn" type="button" onClick={() => setShowExport(true)}>
            <Download size={16} /> Export
          </button>
        </div>
        <TransactionTable rows={rows} />
        <div className="pager">
          <button type="button" disabled={query.page <= 1} onClick={() => setQuery((p) => ({ ...p, page: p.page - 1 }))}>
            Prev
          </button>
          <span>
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            type="button"
            disabled={query.page >= pagination.pages}
            onClick={() => setQuery((p) => ({ ...p, page: p.page + 1 }))}
          >
            Next
          </button>
        </div>
      </article>

      {showExport ? (
        <div className="modal-backdrop" onClick={() => setShowExport(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Export transactions</h3>
            <p>Choose the columns to include in CSV or Excel.</p>
            <div className="column-grid">
              {COLUMNS.map((col) => (
                <label key={col.id}>
                  <input
                    type="checkbox"
                    checked={columns.includes(col.id)}
                    onChange={(e) => {
                      setColumns((prev) =>
                        e.target.checked ? [...prev, col.id] : prev.filter((id) => id !== col.id)
                      );
                    }}
                  />
                  {col.label}
                </label>
              ))}
            </div>
            <div className="modal-actions">
              <button type="button" onClick={() => download("csv")}>Download CSV</button>
              <button type="button" className="primary-btn" onClick={() => download("excel")}>
                Download Excel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
