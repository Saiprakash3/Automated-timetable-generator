// Minimal mock backend implementing API_CONTRACT.md
// Run: npm install && npm start   (serves on http://localhost:4000)
// This is a throwaway dev server — not the real backend. Swap it out once
// the actual Node.js/SQL backend is built, keeping the same endpoint shapes.

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, "db.json");
const loadDb = () => JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
const saveDb = (db) => fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

// Fake token: base64 of "userId:issuedAtMs". Good enough for frontend dev.
// TTL matches the session-length decision in FRONTEND_DOCUMENTATION_CHECKLIST.md §1 —
// 8 hours, so the frontend's mid-session-expiry handling (redirect + toast on 401) has
// something real to trigger against instead of a token that never expires.
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const tokenFor = (userId) => Buffer.from(`${userId}:${Date.now()}`).toString("base64");
const userFromToken = (token) => {
  try {
    const [id, issuedAtStr] = Buffer.from(token, "base64").toString("utf-8").split(":");
    if (Date.now() - Number(issuedAtStr) > SESSION_TTL_MS) return null; // expired
    return loadDb().users.find((u) => u.id === id) || null;
  } catch {
    return null;
  }
};

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.replace("Bearer ", "");
  const user = userFromToken(token);
  if (!user) {
    return res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Missing or invalid token." } });
  }
  req.user = user;
  next();
}

// ---------- AUTH ----------

app.post("/api/auth/login", (req, res) => {
  const { identifier, password, selectedRole } = req.body;
  const db = loadDb();
  const user = db.users.find((u) => u.id === identifier);

  if (!user || user.password !== password) {
    return res.status(401).json({ error: { code: "INVALID_CREDENTIALS", message: "The ID or password entered is incorrect." } });
  }
  if (user.role !== selectedRole) {
    return res.status(401).json({ error: { code: "ROLE_MISMATCH", message: `This account is not registered as ${selectedRole}.` } });
  }

  // Was stripping the response down to { id, name, role, department } —
  // dropped year/section for students even though db.json has them and
  // GET /timetables/me already reads req.user.year/req.user.section
  // internally (via userFromToken's full db lookup). The frontend never
  // received them, so it had nothing to filter a student's own timetable
  // by. Sending the whole stored record (minus password) instead of a
  // hardcoded field list keeps this correct if another role gains its own
  // extra field later.
  const { password: _password, ...publicUser } = user;
  res.json({
    token: tokenFor(user.id),
    user: publicUser,
  });
});

app.post("/api/auth/logout", requireAuth, (req, res) => {
  res.status(200).json({ success: true });
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  const { password: _password, ...publicUser } = req.user;
  res.json(publicUser);
});

// ---------- TIMETABLES ----------

app.get("/api/timetables", requireAuth, (req, res) => {
  const db = loadDb();
  let results = db.timetables;
  const { department, year, section, state } = req.query;
  if (department) results = results.filter((t) => t.department === department);
  if (year) results = results.filter((t) => String(t.year) === year);
  if (section) results = results.filter((t) => t.section === section);
  if (state) results = results.filter((t) => t.state === state);
  res.json({ timetables: results.map(({ entries, ...meta }) => meta) });
});

app.get("/api/timetables/me", requireAuth, (req, res) => {
  const db = loadDb();
  const role = req.user.role === "hod" ? "faculty" : req.user.role; // HOD-on-mobile routes to faculty view
  const entries = db.timetables.flatMap((t) =>
    t.entries.filter(
      (e) =>
        e.facultyId === req.user.id ||
        e.labCoordinatorId === req.user.id ||
        (req.user.role === "student" && t.year === req.user.year && t.section === req.user.section)
    )
  );
  res.json({ role, entries });
});

app.get("/api/timetables/:id", requireAuth, (req, res) => {
  const db = loadDb();
  const tt = db.timetables.find((t) => t.id === req.params.id);
  if (!tt) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Timetable not found." } });
  res.json(tt);
});

app.post("/api/timetables", requireAuth, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: { code: "FORBIDDEN", message: "Admin only." } });
  const db = loadDb();
  const { department, year, section } = req.body;
  const newTt = {
    id: `tt_${Date.now()}`,
    department,
    year,
    section,
    state: "draft",
    createdBy: req.user.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    approvedBy: null,
    approvedAt: null,
    publishedAt: null,
    entries: [],
  };
  db.timetables.push(newTt);
  saveDb(db);
  res.status(201).json(newTt);
});

app.patch("/api/timetables/:id", requireAuth, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: { code: "FORBIDDEN", message: "Admin only." } });
  const db = loadDb();
  const tt = db.timetables.find((t) => t.id === req.params.id);
  if (!tt) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Timetable not found." } });

  if (req.body.entries) {
    req.body.entries.forEach((patch) => {
      const idx = tt.entries.findIndex((e) => e.id === patch.id);
      if (idx >= 0) tt.entries[idx] = { ...tt.entries[idx], ...patch };
      else tt.entries.push(patch);
    });
  }
  tt.updatedAt = new Date().toISOString();
  saveDb(db);
  res.json(tt);
});

app.post("/api/timetables/:id/send-for-approval", requireAuth, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: { code: "FORBIDDEN", message: "Admin only." } });
  const db = loadDb();
  const tt = db.timetables.find((t) => t.id === req.params.id);
  if (!tt) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Timetable not found." } });
  tt.state = "pending";
  tt.note = req.body?.note ?? null;
  tt.submittedBy = req.user.id;
  tt.submittedAt = new Date().toISOString();
  saveDb(db);
  // No email — submitting in-app is the whole action (INTERACTION_DECISIONS.md §11).
  res.json({ id: tt.id, state: tt.state, note: tt.note, submittedBy: tt.submittedBy, submittedAt: tt.submittedAt });
});

app.post("/api/timetables/:id/approve", requireAuth, (req, res) => {
  if (req.user.role !== "hod") return res.status(403).json({ error: { code: "FORBIDDEN", message: "HOD only." } });
  const db = loadDb();
  const tt = db.timetables.find((t) => t.id === req.params.id);
  if (!tt) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Timetable not found." } });
  tt.state = "approved";
  tt.approvedBy = req.user.id;
  tt.approvedAt = new Date().toISOString();
  saveDb(db);
  res.json({ id: tt.id, state: tt.state, approvedBy: tt.approvedBy, approvedAt: tt.approvedAt });
});

app.post("/api/timetables/:id/request-changes", requireAuth, (req, res) => {
  if (req.user.role !== "hod") return res.status(403).json({ error: { code: "FORBIDDEN", message: "HOD only." } });
  const db = loadDb();
  const tt = db.timetables.find((t) => t.id === req.params.id);
  if (!tt) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Timetable not found." } });
  tt.state = "rejected";
  tt.rejectionReason = req.body.reason;
  saveDb(db);
  res.json({ id: tt.id, state: tt.state, reason: tt.rejectionReason, requestedBy: req.user.id, requestedAt: new Date().toISOString() });
});

app.post("/api/timetables/:id/publish", requireAuth, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: { code: "FORBIDDEN", message: "Admin only." } });
  const db = loadDb();
  const tt = db.timetables.find((t) => t.id === req.params.id);
  if (!tt) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Timetable not found." } });
  if (tt.state !== "approved") {
    return res.status(400).json({ error: { code: "INVALID_STATE", message: "Only approved timetables can be published." } });
  }
  tt.state = "published";
  tt.publishedBy = req.user.id;
  tt.publishedAt = new Date().toISOString();
  saveDb(db);
  res.json({ id: tt.id, state: tt.state, publishedBy: tt.publishedBy, publishedAt: tt.publishedAt });
});

// ---------- CONFLICTS ----------

app.post("/api/conflicts/check", requireAuth, (req, res) => {
  // Dummy logic: always returns the canned example set from db.json so the
  // frontend has real-shaped data to build the Conflict Badge / drawer UI against.
  const db = loadDb();
  const conflicts = db.conflictExamples;
  const summary = conflicts.reduce(
    (acc, c) => ({ ...acc, [c.severity]: (acc[c.severity] || 0) + 1 }),
    { blocking: 0, warning: 0, informational: 0 }
  );
  res.json({ conflicts, summary });
});

const PORT = 4000;
app.listen(PORT, () => console.log(`Mock backend running at http://localhost:${PORT}`));