import { useEffect, useState } from "react";
import { FiBarChart2, FiFileText, FiAlertOctagon, FiClock, FiRefreshCw, FiTarget } from "react-icons/fi";
import Layout from "../Components/Layout";
import { api } from "../api";

function Donut({ parts }) {
  const total = parts.reduce((s, p) => s + p.value, 0) || 1;
  let acc = 0;
  const stops = parts.map((p) => {
    const start = (acc / total) * 360;
    acc += p.value;
    return `${p.color} ${start}deg ${(acc / total) * 360}deg`;
  });
  return (
    <div className="donut-wrap">
      <div className="donut" style={{ background: parts.some((p) => p.value) ? `conic-gradient(${stops.join(",")})` : "#e3e8f0" }}>
        <div className="donut-hole"><b>{parts.reduce((s, p) => s + p.value, 0)}</b><small>reports</small></div>
      </div>
      <ul className="legend">
        {parts.map((p) => <li key={p.label}><span style={{ background: p.color }} />{p.label}<b>{p.value}</b></li>)}
      </ul>
    </div>
  );
}

function Analytics() {
  const [data, setData] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.analytics().then(setData).catch((e) => setError(e.message));
    api.evaluation().then(setEvaluation).catch(() => setEvaluation(null));
  }, []);

  const t = data?.totals;
  const max = Math.max(1, ...(data?.perDay || []).map((d) => d.count));

  return (
    <Layout icon={FiBarChart2} title="Analytics" subtitle="How ReproAI performs across every bug report.">
      {error && <p className="alert">{error}</p>}
      {!data && !error && <p className="muted">Loading…</p>}

      {t && (
        <>
          <div className="kpis">
            <div className="kpi"><FiFileText /><b>{t.total}</b><span>Total reports</span></div>
            <div className="kpi kpi-bad"><FiAlertOctagon /><b>{t.reproduced}</b><span>Bugs reproduced</span></div>
            <div className="kpi"><FiClock /><b>{t.avgSeconds ?? "—"}s</b><span>Avg. time per report</span></div>
            <div className="kpi"><FiRefreshCw /><b>{t.avgAttempts ?? "—"}</b><span>Avg. attempts (self-heal)</span></div>
          </div>

          <div className="grid-2">
            <section className="card">
              <h3>Outcomes</h3>
              <Donut
                parts={[
                  { label: "Bug reproduced", value: t.reproduced, color: "#c81e1e" },
                  { label: "Not reproduced", value: t.notReproduced, color: "#15803d" },
                  { label: "Failed runs", value: t.failed, color: "#b45309" },
                  { label: "In progress", value: t.inProgress, color: "#94a3b8" },
                ]}
              />
            </section>
            <section className="card">
              <h3>Reports per day</h3>
              {data.perDay.length === 0 && <p className="muted">No reports yet.</p>}
              <div className="bars">
                {data.perDay.map((d) => (
                  <div key={d.day} className="bar-row">
                    <span>{d.day}</span>
                    <div className="bar"><div style={{ width: `${(d.count / max) * 100}%` }} /></div>
                    <b>{d.count}</b>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </>
      )}

      <section className="card">
        <h3><FiTarget /> Evaluation on demo dataset</h3>
        {!evaluation ? (
          <p className="muted">No evaluation yet. Run <code>npm run eval</code> in the backend folder to score ReproAI on 9 known cases.</p>
        ) : (
          <>
            <div className="kpis kpis-inner">
              <div className="kpi"><b>{evaluation.summary.validityRate}%</b><span>Script validity</span></div>
              <div className="kpi kpi-bad"><b>{evaluation.summary.reproductionRate}%</b><span>Reproduction rate</span></div>
              <div className="kpi kpi-ok"><b>{evaluation.summary.accuracy}%</b><span>Verdict accuracy</span></div>
              <div className="kpi"><b>{evaluation.summary.avgSeconds}s</b><span>Avg. time per bug</span></div>
            </div>
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Case</th><th>Expected</th><th>Result</th><th>Attempts</th><th>Time</th><th>Match</th></tr></thead>
                <tbody>
                  {evaluation.rows.map((r) => (
                    <tr key={r.id}>
                      <td className="mono">{r.id}</td>
                      <td>{r.expected}</td>
                      <td>{r.got}</td>
                      <td>{r.attempts}</td>
                      <td>{r.seconds}s</td>
                      <td><span className={`badge ${r.got === r.expected ? "badge-ok" : "badge-bad"}`}>{r.got === r.expected ? "Match" : "Miss"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </Layout>
  );
}

export default Analytics;
