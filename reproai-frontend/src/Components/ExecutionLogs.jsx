function ExecutionLogs({ logs = [] }) {
  if (!logs.length) return <p className="muted">No logs yet.</p>;
  return (
    <div className="logs">
      {logs.map((log, i) => (
        <div key={i} className="log-line">
          <span className="log-time">{new Date(log.createdAt).toLocaleTimeString()}</span>
          <span className={`log-level log-${log.level}`}>{log.level}</span>
          <span className="log-msg">{log.message}</span>
        </div>
      ))}
    </div>
  );
}

export default ExecutionLogs;
