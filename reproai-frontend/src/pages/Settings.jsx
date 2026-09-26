import { useEffect, useState } from "react";
import { FiSettings, FiUser, FiServer, FiCpu } from "react-icons/fi";
import Layout from "../Components/Layout";
import { api } from "../api";

function Settings() {
  const [health, setHealth] = useState({ state: "checking" });

  useEffect(() => {
    const started = performance.now();
    api.health()
      .then(() => setHealth({ state: "ok", ms: Math.round(performance.now() - started) }))
      .catch(() => setHealth({ state: "down" }));
  }, []);

  return (
    <Layout icon={FiSettings} title="Settings" subtitle="Profile, connection and automation details.">
      <div className="grid-2">
        <section className="card">
          <h3><FiUser /> User Profile</h3>
          <dl className="rows">
            <dt>Name</dt><dd>Dinesh Kumar</dd>
            <dt>Role</dt><dd>QA Engineer</dd>
            <dt>Team</dt><dd>Veridyn (Team 102)</dd>
          </dl>
        </section>

        <section className="card">
          <h3><FiServer /> Backend Connection</h3>
          <dl className="rows">
            <dt>Status</dt>
            <dd>
              {health.state === "checking" && "Checking…"}
              {health.state === "ok" && <span className="badge badge-ok">Connected · {health.ms} ms</span>}
              {health.state === "down" && <span className="badge badge-bad">Not reachable</span>}
            </dd>
            <dt>API</dt><dd className="mono">http://127.0.0.1:8080/api</dd>
            <dt>Demo app</dt><dd className="mono">http://localhost:8081</dd>
          </dl>
          {health.state === "down" && <p className="alert">Start the backend with <code>npm start</code> in the reproai-backend folder.</p>}
        </section>

        <section className="card">
          <h3><FiCpu /> Automation</h3>
          <dl className="rows">
            <dt>Framework</dt><dd>Playwright</dd>
            <dt>AI provider</dt><dd>Groq with Gemini fallback (set in backend .env)</dd>
            <dt>Self-healing</dt><dd>Up to 3 attempts per report</dd>
            <dt>Evidence</dt><dd>Screenshot and log for every step</dd>
          </dl>
        </section>
      </div>
    </Layout>
  );
}

export default Settings;
