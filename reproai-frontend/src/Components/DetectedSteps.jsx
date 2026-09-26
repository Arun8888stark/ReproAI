function DetectedSteps({ steps = [], verificationStep, actual }) {
  const all = verificationStep ? [...steps, { ...verificationStep, isVerification: true }] : steps;

  return (
    <ol className="steps">
      {all.map((s) => (
        <li key={s.order} className={`step step-${s.status || "passed"}`}>
          <span className="step-num">{s.order}</span>
          <div>
            <p>{s.isVerification ? <><b>Verify:</b> {s.description}</> : s.description}</p>
            {s.isVerification && actual && <small>(Actual: {actual})</small>}
            {s.status === "skipped" && <small>Skipped</small>}
          </div>
        </li>
      ))}
    </ol>
  );
}

export default DetectedSteps;
