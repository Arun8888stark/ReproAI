function highlight(line) {
  const token = /(\/\/.*$)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)|(\/(?:[^/\\\n]|\\.)+\/[gimsuy]*)|\b(import|from|const|await|async|test|expect|process)\b/g;
  const parts = [];
  let last = 0;
  let m;
  while ((m = token.exec(line))) {
    if (m.index > last) parts.push(line.slice(last, m.index));
    const cls = m[1] ? "tok-comment" : m[2] ? "tok-string" : m[3] ? "tok-regex" : "tok-key";
    parts.push(<span key={m.index} className={cls}>{m[0]}</span>);
    last = m.index + m[0].length;
  }
  parts.push(line.slice(last));
  return parts;
}

function CodeViewer({ code = "", tall = false }) {
  const lines = code.replace(/\n$/, "").split("\n");
  return (
    <div className={`code ${tall ? "code-tall" : ""}`}>
      <table>
        <tbody>
          {lines.map((line, i) => (
            <tr key={i}>
              <td className="ln">{i + 1}</td>
              <td className="lc">{highlight(line)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CodeViewer;
