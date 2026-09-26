import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiTrash2, FiRefreshCw, FiFileText, FiGithub } from "react-icons/fi";
import Layout from "../Components/Layout";
import VerdictBanner from "../Components/VerdictBanner";
import ResultsView from "../Components/ResultsView";
import Screenshots from "../Components/Screenshots";
import DetectedSteps from "../Components/DetectedSteps";
import { StatusBadge, VerdictBadge } from "../Components/StatusBadge";
import { useToast } from "../Components/Toast";
import { api } from "../api";
import { formatDate, toIssueMarkdown } from "../utils";

function ReportDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  useEffect(() => {
    api.report(id).then(setReport).catch((e) => setError(e.message));
  }, [id]);

  async function act(kind, fn, message) {
    setBusy(kind);
    try {
      await fn();
      if (message) toast(message);
    } catch (e) {
      toast(e.message, "warn");
    } finally {
      setBusy("");
    }
  }

  const remove = () =>
    window.confirm("Delete this report and its screenshots?") &&
    act("delete", async () => { await api.remove(id); navigate("/history"); }, "Report deleted");
  const regenerate = () => act("regenerate", async () => setReport(await api.regenerate(id)), "Report re-generated");
  const run = () => act("run", async () => setReport(await api.run(id)), "Test re-run complete");
  const copyIssue = () => act("", () => navigator.clipboard.writeText(toIssueMarkdown(report)), "GitHub issue copied as Markdown");

  return (
    <Layout
      icon={FiFileText}
      title="Report Details"
      subtitle={report?.title || "Loading…"}
      actions={
        report && (
          <>
            <button className="btn btn-danger" onClick={remove} disabled={!!busy}><FiTrash2 /> Delete</button>
            <button className="btn btn-primary" onClick={regenerate} disabled={!!busy}>
              {busy === "regenerate" ? <span className="spinner" /> : <FiRefreshCw />} {busy === "regenerate" ? "Re-generating…" : "Re-generate"}
            </button>
          </>
        )
      }
    >
      <Link to="/history" className="link back"><FiArrowLeft /> Back to History</Link>

      {error && <p className="alert">{error}</p>}
      {!report && !error && <p className="muted">Loading…</p>}

      {report && (
        <>
          <section className="card info-grid">
            <div><small>Bug Title</small><p>{report.title || "—"}</p></div>
            <div><small>Target URL</small><p><a className="url" href={report.targetUrl} target="_blank" rel="noreferrer">{report.targetUrl}</a></p></div>
            <div><small>Created At</small><p>{formatDate(report.createdAt)}</p></div>
            <div><small>Status</small><p className="badges"><StatusBadge status={report.executionStatus} /><VerdictBadge verdict={report.verdict} /></p></div>
            <div className="info-wide"><small>Reported by user</small><p className="quote">“{report.bugDescription}”</p></div>
          </section>

          <VerdictBanner report={report} actions={<button className="btn btn-light" onClick={copyIssue}><FiGithub /> Copy as GitHub issue</button>} />

          <section className="card split">
            <div>
              <h3>Detected Steps</h3>
              <DetectedSteps steps={report.steps} verificationStep={report.verificationStep} actual={report.actualResult} />
            </div>
            <div className="split-shots">
              <h3>Test Execution Screenshots</h3>
              <Screenshots screenshots={report.screenshots} small />
            </div>
          </section>

          <ResultsView report={report} onRun={run} running={busy === "run"} showSteps={false} />
        </>
      )}
    </Layout>
  );
}

export default ReportDetails;
