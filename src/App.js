import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  ResponsiveContainer
} from "recharts";
import "./App.css";

/* ✅ LOCAL BACKEND */
const API = "http://127.0.0.1:8000";

function App() {
  const [role, setRole] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [queries, setQueries] = useState([]);
  const [skills, setSkills] = useState([]);

  /* ---------------- ANALYZE RESUME ---------------- */
  const analyzeResume = async () => {
    if (!role || !file) {
      alert("Please enter target role and upload resume");
      return;
    }

    const formData = new FormData();
    formData.append("target_role", role);
    formData.append("resume_file", file);

    try {
      setLoading(true);
      const res = await axios.post(`${API}/analyze-skills`, formData, {
        timeout: 60000
      });
      setResult(res.data.data);
    } catch (err) {
      console.error(err);
      alert("Backend error. Make sure FastAPI is running.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- DASHBOARD DATA ---------------- */
  useEffect(() => {
    axios.get(`${API}/queries-per-day`)
      .then(res => setQueries(res.data))
      .catch(err => console.error(err));

    axios.get(`${API}/top-missing-skills`)
      .then(res => setSkills(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="app">
      <h1>SkillGap AI</h1>
      <p className="subtitle">AI-Powered Career Readiness Analyzer</p>

      {/* UPLOAD CARD */}
      <div className="card">
        <input
          type="text"
          placeholder="Target Role (e.g. Python Developer)"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />

        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button onClick={analyzeResume} disabled={loading}>
          {loading ? "Analyzing..." : "Analyze Resume"}
        </button>
      </div>

      {/* ---------------- RESULT SECTION ---------------- */}
      {result && (
        <div className="card result-card">
          <h2 className="section-title">📊 Analysis Result</h2>

          <div className="score-box">
            <span className="score-label">Readiness Score</span>
            <span className="score">{result.readiness_score}%</span>
          </div>

          <div className="grid">
            <div className="info-box">
              <h3>✅ Extracted Skills</h3>
              <ul>
                {result.extracted_skills?.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="info-box danger">
              <h3>❌ Missing Skills</h3>
              <ul>
                {result.missing_skills?.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* RESOURCES */}
          <div className="info-box">
            <h3>📚 Recommended Resources</h3>
            <ul>
              {result.recommended_resources?.map((r, i) => (
                <li key={i}>
                  <strong>{r.name}</strong> ({r.platform}) —{" "}
                  <a href={r.link} target="_blank" rel="noopener noreferrer">
                    Visit
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* PROJECT IDEAS */}
          <div className="info-box">
            <h3>💡 Project Ideas</h3>
            <ul>
              {result.project_ideas?.map((p, i) => (
                <li key={i}>
                  {typeof p === "string"
                    ? p.replace(/^•\s*/, "")
                    : `${p.name}: ${p.description}`}
                </li>
              ))}
            </ul>
          </div>

          {/* 🚨 FIXED ROADMAP (NO CRASH) */}
          <div className="info-box">
            <h3>🛣️ Learning Roadmap</h3>
            <ol>
              {result.roadmap?.map((r, i) => (
                <li key={i}>
                  {typeof r === "string" ? (
                    r.replace(/^\d+\.?\s*/, "")
                  ) : (
                    <>
                      <strong>{r.step}</strong>
                      <br />
                      <span>{r.description}</span>
                    </>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* ---------------- DASHBOARD (ALWAYS VISIBLE) ---------------- */}
      <div className="card">
        <h2 className="section-title">📈 Analytics Dashboard</h2>

        <h4>Queries Per Day</h4>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={queries}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line dataKey="count" stroke="#4F46E5" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>

        <h4>Top Missing Skills</h4>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={skills}>
            <XAxis dataKey="skill" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#EF4444" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default App;
