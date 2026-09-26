import { FiAlertOctagon, FiCheckCircle, FiAlertTriangle, FiRefreshCw, FiClock, FiList, FiImage } from "react-icons/fi";

const VARIANTS = {
  reproduced: { cls: "verdict-bad", icon: FiAlertOctagon, title: "Bug reproduced", text: "ReproAI followed the steps in a real browser and the app showed the reported behaviour." },
  not_reproduced: { cls: "verdict-ok", icon: FiCheckCircle, title: "Not reproduced", text: "Every step ran and the app behaved as expected. The report may be a user error or already fixed." },
  failed: { cls: "verdict-warn", icon: FiAlertTriangle, title: "Run could not finish", text: "The script could not complete. Check the logs for the exact error." },
};

function VerdictBanner({ report, actions }) {
  const v = VARIANTS[report.verdict] || VARIANTS.failed;
  const Icon = v.icon;
  const passed = report.steps.filter((s) => s.status === "passed").length;

  return (
    <section className={`verdict ${v.cls}`}>
      <div className="verdict-main">
        <Icon className="verdict-icon" />
        <div>
          <h2>{v.title}</h2>
          <p>{report.verdict ? v.text : report.errorMessage || v.text}</p>
        </div>
        {actions && <div className="verdict-actions">{actions}</div>}
      </div>
      <div className="verdict-stats">
        <span><FiList /> {passed}/{report.steps.length} steps passed</span>
        <span><FiRefreshCw /> {report.attempts} {report.attempts === 1 ? "attempt" : "attempts"}{report.attempts > 1 && <b className="heal">self-healed</b>}</span>
        {report.durationMs != null && <span><FiClock /> {(report.durationMs / 1000).toFixed(1)}s</span>}
        <span><FiImage /> {report.screenshots.length} screenshots</span>
      </div>
    </section>
  );
}

export default VerdictBanner;
