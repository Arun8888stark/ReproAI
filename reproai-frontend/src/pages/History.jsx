import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiClock, FiSearch, FiTrash2, FiPlus } from "react-icons/fi";
import Layout from "../Components/Layout";
import { StatusBadge, VerdictBadge } from "../Components/StatusBadge";
import { useToast } from "../Components/Toast";
import { api } from "../api";
import { formatDate } from "../utils";

function History() {
  const toast = useToast();
  const navigate = useNavigate();
  const [reports, setReports] = useState(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    api.reports().then(setReports).catch((e) => setError(e.message));
  }, []);

  const filtered = useMemo(
    () =>
      (reports || []).filter(
        (r) =>
          (status === "all" || r.executionStatus === status || r.verdict === status) &&
          `${r.title} ${r.targetUrl}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [reports, query, status],
  );

  const remove = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this report and its screenshots?")) return;
    try {
      await api.remove(id);
      setReports((list) => list.filter((r) => r.reportId !== id));
      toast("Report deleted");
    } catch (err) {
      toast(err.message, "warn");
    }
  };

  return (
    <Layout
      icon={FiClock}
      title="History"
      subtitle="View and manage your past bug reports and generated scripts."
      actions={<Link to="/new" className="btn btn-primary"><FiPlus /> New Report</Link>}
    >
      <section className="card">
        <div className="toolbar">
          <div className="search">
            <FiSearch />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by title or URL" />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
            <option value="all">All statuses</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="in_progress">In Progress</option>
            <option value="reproduced">Bug reproduced</option>
            <option value="not_reproduced">Not reproduced</option>
          </select>
          {reports && <span className="muted">{filtered.length} of {reports.length} reports</span>}
        </div>

        {error && <p className="alert">{error}</p>}
        {!reports && !error && <p className="muted">Loading…</p>}
        {reports?.length === 0 && (
          <div className="empty">
            <p>No reports yet.</p>
            <Link to="/new" className="btn btn-primary">Create your first report</Link>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>#</th><th>Bug Title</th><th>Status</th><th>Result</th><th>Target URL</th><th>Created At</th><th>Action</th></tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.reportId} onClick={() => navigate(`/reports/${r.reportId}`)}>
                    <td>{i + 1}</td>
                    <td className="strong">{r.title}</td>
                    <td><StatusBadge status={r.executionStatus} /></td>
                    <td><VerdictBadge verdict={r.verdict} /></td>
                    <td className="url">{r.targetUrl}</td>
                    <td className="nowrap">{formatDate(r.createdAt)}</td>
                    <td className="nowrap">
                      <Link className="btn btn-sm" to={`/reports/${r.reportId}`} onClick={(e) => e.stopPropagation()}>View</Link>
                      <button className="icon-btn icon-danger" onClick={(e) => remove(e, r.reportId)} aria-label="Delete report"><FiTrash2 /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {reports?.length > 0 && filtered.length === 0 && <p className="muted">No reports match your search.</p>}
      </section>
    </Layout>
  );
}

export default History;
