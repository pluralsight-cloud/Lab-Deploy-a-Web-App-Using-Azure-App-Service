const express = require("express");
const os = require("os");

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory data store (resets on restart)
const messages = [];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------- HTML served inline ----------
app.get("/", (req, res) => {
  const rows = messages
    .map(
      (m, i) =>
        `<tr><td>${i + 1}</td><td>${esc(m.name)}</td><td>${esc(m.text)}</td><td>${m.time}</td></tr>`
    )
    .join("");

  res.send(`<!DOCTYPE html><html lang="en"><head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Azure Demo App</title>
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:system-ui,sans-serif;background:#f0f4f8;color:#1a202c;padding:2rem}
      .card{max-width:700px;margin:0 auto;background:#fff;border-radius:12px;
            box-shadow:0 4px 12px rgba(0,0,0,.08);padding:2rem}
      h1{font-size:1.6rem;margin-bottom:.25rem}
      .sub{color:#718096;margin-bottom:1.5rem;font-size:.9rem}
      form{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:1.5rem}
      input,button{padding:.55rem .75rem;border-radius:6px;font-size:.95rem;border:1px solid #cbd5e0}
      input:focus{outline:none;border-color:#4299e1;box-shadow:0 0 0 3px rgba(66,153,225,.3)}
      input[name="name"]{width:140px} input[name="text"]{flex:1;min-width:180px}
      button{background:#4299e1;color:#fff;border:none;cursor:pointer;font-weight:600}
      button:hover{background:#3182ce}
      table{width:100%;border-collapse:collapse;font-size:.9rem}
      th,td{text-align:left;padding:.5rem .6rem;border-bottom:1px solid #e2e8f0}
      th{background:#edf2f7;font-weight:600}
      .empty{color:#a0aec0;text-align:center;padding:1.5rem}
      .info{margin-top:1.5rem;padding:1rem;background:#ebf8ff;border-radius:8px;font-size:.85rem;color:#2b6cb0}
    </style></head><body>
    <div class="card">
      <h1>🚀 Azure Demo App</h1>
      <p class="sub">A minimal Node.js app running on Azure App Service</p>
      <form method="POST" action="/messages">
        <input name="name" placeholder="Your name" required>
        <input name="text" placeholder="Leave a message…" required>
        <button type="submit">Post</button>
      </form>
      ${
        rows
          ? `<table><thead><tr><th>#</th><th>Name</th><th>Message</th><th>Time</th></tr></thead><tbody>${rows}</tbody></table>`
          : '<p class="empty">No messages yet — be the first!</p>'
      }
      <div class="info">
        <strong>Server info:</strong> hostname <code>${os.hostname()}</code> ·
        node ${process.version} · uptime ${Math.floor(process.uptime())}s ·
        env <code>${process.env.NODE_ENV || "development"}</code>
      </div>
    </div></body></html>`);
});

// ---------- API ----------
app.post("/messages", (req, res) => {
  const { name, text } = req.body;
  if (name && text) {
    messages.push({
      name: name.slice(0, 60),
      text: text.slice(0, 280),
      time: new Date().toLocaleString(),
    });
  }
  res.redirect("/");
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// ---------- Helpers ----------
function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ---------- Start ----------
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
