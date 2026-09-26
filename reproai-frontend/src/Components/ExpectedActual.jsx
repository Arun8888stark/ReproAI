import { FiCheckCircle, FiXCircle, FiEye } from "react-icons/fi";

function ExpectedActual({ report, row = false }) {
  return (
    <div className={row ? "ea ea-row" : "ea"}>
      <div className="ea-box ea-ok">
        <p className="ea-title"><FiCheckCircle /> Expected Result</p>
        <p>{report.expectedResult || "—"}</p>
      </div>
      <div className="ea-box ea-bad">
        <p className="ea-title"><FiXCircle /> Actual Result</p>
        <p>{report.actualResult || "—"}</p>
      </div>
      {report.observedResult && (
        <div className="ea-box ea-seen">
          <p className="ea-title"><FiEye /> Seen in browser</p>
          <code>{report.observedResult}</code>
        </div>
      )}
    </div>
  );
}

export default ExpectedActual;
