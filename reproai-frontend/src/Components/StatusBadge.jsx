const STATUS = {
  success: ["Success", "badge-ok"],
  failed: ["Failed", "badge-bad"],
  in_progress: ["In Progress", "badge-warn"],
};

const VERDICT = {
  reproduced: ["Bug reproduced", "badge-bad"],
  not_reproduced: ["Not reproduced", "badge-ok"],
};

export function StatusBadge({ status }) {
  const [label, cls] = STATUS[status] || [status, ""];
  return <span className={`badge ${cls}`}>{label}</span>;
}

export function VerdictBadge({ verdict }) {
  if (!verdict) return null;
  const [label, cls] = VERDICT[verdict];
  return <span className={`badge badge-outline ${cls}`}>{label}</span>;
}
