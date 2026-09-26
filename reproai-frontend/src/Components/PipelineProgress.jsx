import { FiCheck, FiX } from "react-icons/fi";

const STAGES = ["Bug report", "AI analysis", "Script generation", "Browser run", "Verification"];

function PipelineProgress({ phase, elapsed = 0 }) {
  const current = phase === "idle" ? 0 : phase === "loading" ? Math.min(1 + Math.floor(elapsed / 5), 4) : 5;

  return (
    <ol className="pipeline">
      {STAGES.map((label, i) => {
        const state = phase === "failed" && i === 4 ? "error" : i < current ? "done" : i === current && phase === "loading" ? "live" : "todo";
        return (
          <li key={label} className={`stage stage-${state}`}>
            <span className="stage-dot">
              {state === "done" ? <FiCheck /> : state === "error" ? <FiX /> : i + 1}
            </span>
            <span className="stage-label">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

export default PipelineProgress;
