import { useState } from "react";
import { FiList, FiCode, FiTerminal, FiImage, FiTarget, FiCopy, FiDownload, FiPlay } from "react-icons/fi";
import Tabs from "./Tabs";
import CodeViewer from "./CodeViewer";
import DetectedSteps from "./DetectedSteps";
import ExpectedActual from "./ExpectedActual";
import Screenshots from "./Screenshots";
import ExecutionLogs from "./ExecutionLogs";
import { useToast } from "./Toast";
import { downloadScript } from "../utils";

function ResultsView({ report, onRun, running, showSteps = true }) {
  const [tab, setTab] = useState("results");
  const toast = useToast();

  const copy = async () => {
    await navigator.clipboard.writeText(report.generatedScript);
    toast("Script copied to clipboard");
  };

  const tabs = [
    { id: "results", label: "Results", icon: FiTarget },
    { id: "logs", label: "Execution Logs", icon: FiTerminal, count: report.logs.length },
    { id: "shots", label: "Screenshots", icon: FiImage, count: report.screenshots.length },
  ];

  return (
    <section className="card results">
      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      <div className="results-body">
        {tab === "results" && (
          <div className={showSteps ? "results-grid" : "results-grid results-grid-2"}>
            {showSteps && (
              <div className="panel">
                <h3><FiList /> Detected Steps</h3>
                <DetectedSteps steps={report.steps} verificationStep={report.verificationStep} actual={report.actualResult} />
              </div>
            )}

            <div className="panel panel-code">
              <div className="panel-head">
                <h3><FiCode /> Generated Playwright Script</h3>
                <button className="btn btn-ghost btn-sm" onClick={copy} disabled={!report.generatedScript}><FiCopy /> Copy</button>
              </div>
              {report.generatedScript ? <CodeViewer code={report.generatedScript} /> : <p className="muted">No script was generated.</p>}
              {report.generatedScript && (
                <div className="btn-row">
                  <button className="btn btn-primary" onClick={copy}><FiCopy /> Copy Code</button>
                  <button className="btn" onClick={() => downloadScript(report)}><FiDownload /> Download .js</button>
                  {onRun && (
                    <button className="btn" onClick={onRun} disabled={running}>
                      {running ? <span className="spinner" /> : <FiPlay />} {running ? "Running…" : "Run Test"}
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="panel">
              <h3><FiTarget /> Expected vs Actual</h3>
              <ExpectedActual report={report} />
            </div>
          </div>
        )}
        {tab === "logs" && <ExecutionLogs logs={report.logs} />}
        {tab === "shots" && <Screenshots screenshots={report.screenshots} />}
      </div>
    </section>
  );
}

export default ResultsView;
