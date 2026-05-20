require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();
const API = "https://api.elevenlabs.io/v1";
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "127.0.0.1";

// ── Access code middleware ──────────────────────────────
app.use((req, res, next) => {
  // Allow static assets through without auth
  if (req.path.startsWith("/assets/") || req.path === "/favicon.ico") return next();

  const code = req.query.code || req.headers["x-access-code"];
  if (code !== process.env.ACCESS_CODE) {
    if (req.path.startsWith("/api/")) {
      return res.status(401).json({ error: "Invalid access code" });
    }
    // For the page itself, show a simple gate
    return res.send(`<!DOCTYPE html>
<html>
<head>
  <title>Access Required</title>
  <style>
    body { font-family: monospace; display: flex; align-items: center;
           justify-content: center; height: 100vh; margin: 0; background: #f5f4f0; }
    form { display: flex; flex-direction: column; gap: 10px; }
    input { padding: 10px; border: 1px solid #ccc; border-radius: 6px; font-size: 14px; }
    button { padding: 10px; background: #1a1916; color: white;
             border: none; border-radius: 6px; cursor: pointer; font-size: 14px; }
    h2 { margin: 0 0 8px; }
  </style>
</head>
<body>
  <form method="GET" action="/">
    <h2>Enter access code</h2>
    <input name="code" type="password" placeholder="Passcode" autofocus />
    <button type="submit">Enter →</button>
  </form>
</body>
</html>`);
  }

  // Attach code to all API calls so the frontend can pass it along
  res.locals.validated = true;
  next();
});

// ── ElevenLabs proxy routes ─────────────────────────────
const fetch = (...args) => import("node-fetch").then(({ default: f }) => f(...args));

// ── Call-manager API proxy ──────────────────────────────
// Forwards /api/manager/* → http://127.0.0.1:8001/* (the Flask API in
// apps/call_manager/multi-caller/api.py). Auth is already validated by the
// middleware above; we re-attach the access code so the upstream check passes.
const MANAGER_API = process.env.MANAGER_API_URL || "http://127.0.0.1:8001";

app.use("/api/manager", express.json(), async (req, res) => {
  // Build upstream URL: strip /api/manager prefix
  const upstreamPath = req.originalUrl.replace(/^\/api\/manager/, "") || "/";
  const url = new URL(upstreamPath, MANAGER_API);
  // Ensure access code reaches upstream
  url.searchParams.set("code", process.env.ACCESS_CODE);

  const isSSE = (req.headers.accept || "").includes("text/event-stream");

  try {
    const upstream = await fetch(url, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        "X-Access-Code": process.env.ACCESS_CODE,
      },
      body: ["GET", "HEAD"].includes(req.method) ? undefined : JSON.stringify(req.body || {}),
    });

    if (isSSE) {
      res.status(upstream.status);
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");
      res.flushHeaders();
      upstream.body.on("data", chunk => res.write(chunk));
      upstream.body.on("end", () => res.end());
      upstream.body.on("error", err => { console.error("SSE upstream error", err); res.end(); });
      req.on("close", () => { try { upstream.body.destroy(); } catch (_) {} });
      return;
    }

    const ct = upstream.headers.get("content-type") || "application/json";
    res.status(upstream.status).setHeader("Content-Type", ct);
    const buf = Buffer.from(await upstream.arrayBuffer());
    res.end(buf);
  } catch (e) {
    res.status(502).json({ error: `manager api unreachable: ${e.message}` });
  }
});

// List conversations (by phone / agent)
app.get("/api/conversations", async (req, res) => {
  try {
    const params = new URLSearchParams(req.query);
    params.delete("code");
    const r = await fetch(`${API}/convai/conversations?${params}`, {
      headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY }
    });
    res.status(r.status).json(await r.json());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get single conversation
app.get("/api/conversations/:id", async (req, res) => {
  try {
    const r = await fetch(`${API}/convai/conversations/${req.params.id}`, {
      headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY }
    });
    res.status(r.status).json(await r.json());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get audio recording
app.get("/api/conversations/:id/audio", async (req, res) => {
  try {
    const r = await fetch(`${API}/convai/conversations/${req.params.id}/audio`, {
      headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY }
    });
    if (!r.ok) return res.status(r.status).send("Audio unavailable");
    res.setHeader("Content-Type", r.headers.get("content-type") || "audio/mpeg");
    r.body.pipe(res);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

// ── Serve built React app ───────────────────────────────
app.use(express.static(path.join(__dirname, "client/dist")));
app.get("*", (_, res) => res.sendFile(path.join(__dirname, "client/dist/index.html")));

app.listen(PORT, HOST, () =>
  console.log(`Running on http://${HOST}:${PORT}`)
);
