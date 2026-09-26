import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiEdit3, FiPlay, FiZap, FiGithub, FiExternalLink, FiClock } from "react-icons/fi";
import Layout from "../Components/Layout";
import PipelineProgress from "../Components/PipelineProgress";
import VerdictBanner from "../Components/VerdictBanner";
import ResultsView from "../Components/ResultsView";
import { StatusBadge } from "../Components/StatusBadge";
import { useToast } from "../Components/Toast";
import { api } from "../api";
import { EXAMPLES } from "../examples";
import { timeAgo, toIssueMarkdown } from "../utils";

const MAX_LENGTH = 500;

function Dashboard() {
  const toast = useToast();
  const [bugDescription, setBugDescription] = useState("");
  const [targetUrl, setTargetUrl] = useState(EXAMPLES[0].url);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [recent, setRecent] = useState([]);
  const [elapsed, setElapsed] = useState(0);

  const loadRecent = () => api.reports().then((r) => setRecent(r.slice(0, 5))).catch(() => {});
  useEffect(() => { loadRecent(); }, []);

  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [loading]);

  const canSubmit = bugDescription.trim().length >= 10 && /^https?:\/\//.test(targetUrl.trim()) && !loading;

  async function generate() {
    if (!canSubmit) return;
    setElapsed(0);
    setLoading(true);
    setError("");
    setReport(null);
    try {
      const result = await api.generate(bugDescription.trim(), targetUrl.trim());
      setReport(result);
      loadRecent();
      toast(result.verdict === "reproduced" ? "Bug reproduced and verified" : result.verdict ? "Run complete: not reproduced" : "Run finished with errors", result.verdict ? "ok" : "warn");
    } catch (e) {
      setError(e.message);
      toast(e.message, "warn");
    } finally {
      setLoading(false);
    }
  }

  async function runTest() {
    setRunning(true);
    try {
      setReport(await api.run(report.reportId));
      toast("Test re-run complete");
    } catch (e) {
      toast(e.message, "warn");
    } finally {
      setRunning(false);
    }
  }

  const copyIssue = async () => {
    await navigator.clipboard.writeText(toIssueMarkdown(report));
    toast("GitHub issue copied as Markdown");
  };

  const phase = loading ? "loading" : report ? (report.verdict ? "done" : "failed") : "idle";

  return (
    <Layout icon={FiEdit3} title="Generate Automated Test Script" subtitle="Describe the bug in plain English and get a verified Playwright test script.">
      <section className="card form-card">
        <div className="form-grid">
          <div className="field">
            <label htmlFor="bug">Bug Description <span className="req">*</span></label>
            <textarea
              id="bug"
              rows={5}
              maxLength={MAX_LENGTH}
              value={bugDescription}
              onChange={(e) => setBugDescription(e.target.value)}
              onKeyDown={(e) => (e.ctrlKey || e.metaKey) && e.key === "Enter" && generate()}
              placeholder="Describe what went wrong, like you would tell a friend…"
            />
            <div className="field-foot">
              <span>Tip: press Ctrl + Enter to generate</span>
              <span>{bugDescription.length}/{MAX_LENGTH}</span>
            </div>
          </div>

          <div className="field-col">
            <div className="field">
              <label htmlFor="url">Target URL <span className="req">*</span></label>
              <input id="url" value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} placeholder="https://your-app.com/page" />
            </div>
            <div className="field">
              <label>Automation Framework</label>
              <div className="framework">
                <span className="framework-icon"><FiPlay /></span>
                <div>
                  <b>Playwright</b>
                  <small>Runs in a real browser with screenshots</small>
                </div>
              </div>
            </div>
          </div>

          <button className="btn btn-primary btn-xl" onClick={generate} disabled={!canSubmit}>
            {loading ? <span className="spinner" /> : <FiZap />}
            {loading ? `Reproducing… ${elapsed}s` : "Generate Playwright Script"}
          </button>
        </div>

        <div className="examples">
          <span>Try a demo bug:</span>
          {EXAMPLES.map((ex) => (
            <button key={ex.label} className="chip" disabled={loading} onClick={() => { setBugDescription(ex.text); setTargetUrl(ex.url); }}>
              {ex.label}
            </button>
          ))}
        </div>

        {error && <p className="alert">{error}</p>}
      </section>

      {phase !== "idle" && (
        <section className="card pipeline-card">
          <PipelineProgress phase={phase} elapsed={elapsed} />
          {loading && <p className="muted center">Reading the page, asking the AI and running every step in a real browser. Usually 10–40 seconds.</p>}
        </section>
      )}

      {report && (
        <>
          <VerdictBanner
            report={report}
            actions={
              <>
                <button className="btn btn-light" onClick={copyIssue}><FiGithub /> Copy as GitHub issue</button>
                <Link className="btn btn-light" to={`/reports/${report.reportId}`}><FiExternalLink /> Open report</Link>
              </>
            }
          />
          <ResultsView report={report} onRun={runTest} running={running} />
        </>
      )}

      {!report && !loading && (
        <section className="card">
          <div className="panel-head">
            <h3><FiClock /> Recent Reports</h3>
            <Link to="/history" className="link">View all</Link>
          </div>
          {recent.length === 0 && <p className="muted">No reports yet. Pick a demo bug above to see ReproAI in action.</p>}
          <ul className="recent">
            {recent.map((r) => (
              <li key={r.reportId}>
                <Link to={`/reports/${r.reportId}`}>{r.title}</Link>
                <span className="muted">{timeAgo(r.createdAt)}</span>
                <StatusBadge status={r.executionStatus} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </Layout>
  );
}

export default Dashboard;
