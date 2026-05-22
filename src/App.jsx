import { useState, useEffect, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// ─── STORAGE ─────────────────────────────────────────────────────────────────
const KEYS = { exercises: "ft_exercises", sessions: "ft_sessions", settings: "ft_settings" };
const load = (k, def) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch { return def; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const epley = (w, r) => r === 1 ? w : +(w * (1 + r / 30)).toFixed(1);

// ─── THEME ────────────────────────────────────────────────────────────────────
const C = {
  bg: "#080808", bg2: "#111", bg3: "#1a1a1a", bg4: "#222",
  red: "#E53935", redD: "#B71C1C", redL: "#FF5252",
  text: "#F5F5F5", muted: "#888", border: "#2a2a2a",
  green: "#4CAF50", yellow: "#FFC107"
};

const s = {
  app: { background: C.bg, minHeight: "100vh", fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", color: C.text, maxWidth: 420, margin: "0 auto", position: "relative", paddingBottom: 80 },
  // NAV
  nav: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 420, background: C.bg2, borderTop: `1px solid ${C.border}`, display: "flex", zIndex: 100 },
  navBtn: (active) => ({ flex: 1, padding: "10px 0 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, border: "none", background: "none", cursor: "pointer", color: active ? C.red : C.muted, transition: "color .2s" }),
  navLabel: { fontSize: 10, fontWeight: 600, letterSpacing: ".5px", textTransform: "uppercase" },
  // COMMON
  header: { padding: "52px 20px 12px", background: `linear-gradient(180deg, ${C.bg2} 0%, ${C.bg} 100%)` },
  title: { fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px", color: C.text, margin: 0 },
  subtitle: { fontSize: 13, color: C.muted, margin: "2px 0 0" },
  card: { background: C.bg2, borderRadius: 16, padding: 16, margin: "0 16px 12px", border: `1px solid ${C.border}` },
  redBtn: (full) => ({ background: `linear-gradient(135deg, ${C.red}, ${C.redD})`, color: "#fff", border: "none", borderRadius: 12, padding: full ? "14px 0" : "10px 20px", fontWeight: 700, fontSize: full ? 16 : 14, cursor: "pointer", width: full ? "100%" : "auto", letterSpacing: ".3px", boxShadow: `0 4px 20px ${C.red}44`, transition: "transform .15s, box-shadow .15s" }),
  ghostBtn: { background: C.bg3, color: C.text, border: `1px solid ${C.border}`, borderRadius: 10, padding: "9px 16px", fontWeight: 600, fontSize: 13, cursor: "pointer" },
  input: { background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, padding: "11px 14px", fontSize: 15, width: "100%", boxSizing: "border-box", outline: "none" },
  label: { fontSize: 12, color: C.muted, fontWeight: 600, letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 6, display: "block" },
  pill: (active) => ({ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer", border: `1px solid ${active ? C.red : C.border}`, background: active ? `${C.red}22` : "transparent", color: active ? C.red : C.muted, transition: "all .2s", letterSpacing: ".3px" }),
  row: { display: "flex", alignItems: "center", gap: 8 },
  badge: (color) => ({ background: `${color}22`, color: color, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }),
  empty: { textAlign: "center", padding: "60px 20px", color: C.muted },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, fontWeight: 600, marginBottom: 6, color: C.text },
  emptySubtext: { fontSize: 13 },
  divider: { height: 1, background: C.border, margin: "12px 0" },
  modal: { position: "fixed", inset: 0, background: "#000c", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" },
  sheet: { background: C.bg2, borderRadius: "24px 24px 0 0", padding: "24px 20px 32px", width: "100%", maxWidth: 420, border: `1px solid ${C.border}`, maxHeight: "90vh", overflowY: "auto" },
  sheetTitle: { fontSize: 18, fontWeight: 800, marginBottom: 20 },
  // PROGRESS SPECIFIC
  tableWrap: { overflowX: "auto", borderRadius: 12, border: `1px solid ${C.border}` },
  th: { padding: "10px 12px", textAlign: "left", fontSize: 11, color: C.muted, fontWeight: 700, borderBottom: `1px solid ${C.border}`, background: C.bg3, whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: ".5px" },
  td: { padding: "10px 12px", fontSize: 13, borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" },
};

const catColor = { Strength: C.red, Bodyweight: C.yellow, Cardio: C.green };

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 20 }) => {
  const icons = {
    home: "M10 2L3 8v12h6v-6h2v6h6V8L10 2z",
    history: "M12 2a10 10 0 100 20A10 10 0 0012 2zm1 10.414l3.293 3.293-1.414 1.414L11 11.586V6h2v6.414z",
    progress: "M3 20h18M5 16l4-4 4 4 4-8",
    stats: "M18 20V10M12 20V4M6 20v-6",
    plus: "M12 5v14M5 12h14",
    trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
    check: "M5 13l4 4L19 7",
    close: "M18 6L6 18M6 6l12 12",
    dumbbell: "M6 5v14M18 5v14M6 8h2m8-3h2M6 16h2m8 0h2M10 8v8h4V8h-4z",
    chevron: "M9 18l6-6-6-6",
    fire: "M12 2s3 3 3 7c0 1.5-.5 3-2 4 0-2-1-3-1-3s-1 3-3 3c0-2-1-4 0-6-2 2-2 4-2 6a6 6 0 0012 0c0-6-7-11-7-11z",
    trophy: "M8 21h8m-4-4v4M5 3h14l-2 7H7L5 3zm0 0a3 3 0 000 7h14a3 3 0 000-7",
    settings: "M12 15a3 3 0 100-6 3 3 0 000 6zm0 0v0M12 3v2M12 19v2M5.05 5.05l1.41 1.41M15.54 15.54l1.41 1.41M3 12h2M19 12h2M5.05 18.95l1.41-1.41M15.54 8.46l1.41-1.41",
    run: "M13 4a1 1 0 100 2 1 1 0 000-2zm-2 3l-2 4h4l2 6m-6-5l-2 5m8-10l2 3-3 2",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {name === "progress" ? <polyline points="3,20 21,20" /> : null}
      {name === "progress" ? <polyline points="5,16 9,12 13,16 17,8" /> : <path d={icons[name] || icons.home} />}
    </svg>
  );
};

// ─── COMPONENTS ──────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div style={s.modal} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.sheet}>
        <div style={{ ...s.row, justifyContent: "space-between", marginBottom: 20 }}>
          <span style={s.sheetTitle}>{title}</span>
          <button onClick={onClose} style={{ ...s.ghostBtn, padding: "6px 10px" }}><Icon name="close" size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function PillRow({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {options.map(o => (
        <button key={o} style={s.pill(value === o)} onClick={() => onChange(o)}>{o}</button>
      ))}
    </div>
  );
}

// ─── SCREENS ─────────────────────────────────────────────────────────────────

// TODAY SCREEN
function TodayScreen({ exercises, sessions, onSaveSession }) {
  const [active, setActive] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [sessionExercises, setSessionExercises] = useState([]);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [showNewExModal, setShowNewExModal] = useState(false);
  const [newEx, setNewEx] = useState({ name: "", category: "Strength", loggingType: "sets_reps" });

  const todaySessions = sessions.filter(s => s.date.startsWith(date));
  const totalToday = todaySessions.reduce((a, s) => a + s.exercises.length, 0);

  const addExerciseToSession = (ex) => {
    const entry = {
      exerciseId: ex.id, name: ex.name, category: ex.category, loggingType: ex.loggingType,
      sets: [{ reps: "", weight: "" }], oneRM: "", duration: "", distance: ""
    };
    setSessionExercises(p => [...p, entry]);
    setShowAddExercise(false);
  };

  const updateSet = (ei, si, field, val) => {
    setSessionExercises(p => p.map((e, i) => i !== ei ? e : {
      ...e, sets: e.sets.map((set, j) => j !== si ? set : { ...set, [field]: val })
    }));
  };

  const addSet = (ei) => {
    setSessionExercises(p => p.map((e, i) => i !== ei ? e : { ...e, sets: [...e.sets, { reps: "", weight: "" }] }));
  };

  const removeSet = (ei, si) => {
    setSessionExercises(p => p.map((e, i) => i !== ei ? e : { ...e, sets: e.sets.filter((_, j) => j !== si) }));
  };

  const updateExField = (ei, field, val) => {
    setSessionExercises(p => p.map((e, i) => i !== ei ? e : { ...e, [field]: val }));
  };

  const finishWorkout = () => {
    if (!sessionExercises.length) return;
    const session = {
      id: uid(), date: new Date(date + "T00:00:00").toISOString(),
      exercises: sessionExercises.map(e => {
        const sets = e.sets.filter(s => s.reps || s.weight).map(s => ({ reps: +s.reps || 0, weight: +s.weight || 0 }));
        const bestSet = sets.reduce((a, b) => (b.weight > a.weight ? b : a), sets[0] || {});
        const autoOneRM = bestSet?.reps && bestSet?.weight ? epley(bestSet.weight, bestSet.reps) : null;
        return {
          exerciseId: e.exerciseId, name: e.name, category: e.category, loggingType: e.loggingType,
          sets, oneRM: e.oneRM ? +e.oneRM : autoOneRM,
          duration: e.duration ? +e.duration : undefined,
          distance: e.distance ? +e.distance : undefined,
        };
      })
    };
    onSaveSession(session);
    setActive(false); setSessionExercises([]);
  };

  const createAndAdd = () => {
    if (!newEx.name.trim()) return;
    const ex = { id: uid(), ...newEx };
    exercises.push(ex);
    save(KEYS.exercises, exercises);
    addExerciseToSession(ex);
    setShowNewExModal(false);
    setNewEx({ name: "", category: "Strength", loggingType: "sets_reps" });
  };

  if (!active) return (
    <div>
      <div style={s.header}>
        <p style={s.subtitle}>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
        <h1 style={s.title}>Today's Workout</h1>
      </div>
      <div style={{ padding: "16px 16px 0" }}>
        {todaySessions.length > 0 && (
          <div style={{ ...s.card, margin: "0 0 16px", background: `${C.red}11`, borderColor: `${C.red}44` }}>
            <div style={s.row}><Icon name="check" size={18} color={C.green} /><span style={{ color: C.green, fontWeight: 700, fontSize: 14 }}>Logged {totalToday} exercise{totalToday !== 1 ? "s" : ""} today</span></div>
          </div>
        )}
        <button style={s.redBtn(true)} onClick={() => setActive(true)}>
          + Start Workout
        </button>
      </div>
      {sessions.slice(0, 1).map(sess => (
        <div key={sess.id} style={{ ...s.card, marginTop: 16 }}>
          <p style={{ ...s.label, marginBottom: 8 }}>Last Session</p>
          <p style={{ fontWeight: 700, marginBottom: 8 }}>{new Date(sess.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
          {sess.exercises.slice(0, 3).map((e, i) => (
            <div key={i} style={{ ...s.row, marginBottom: 6 }}>
              <span style={s.badge(catColor[e.category] || C.red)}>{e.category}</span>
              <span style={{ fontSize: 13, color: C.text }}>{e.name}</span>
              {e.sets?.length > 0 && <span style={{ fontSize: 12, color: C.muted }}>{e.sets.length} sets</span>}
            </div>
          ))}
          {sess.exercises.length > 3 && <p style={{ fontSize: 12, color: C.muted }}>+{sess.exercises.length - 3} more</p>}
        </div>
      ))}
      {sessions.length === 0 && (
        <div style={s.empty}>
          <div style={s.emptyIcon}>🏋️</div>
          <p style={s.emptyText}>No workouts yet</p>
          <p style={s.emptySubtext}>Hit Start Workout to log your first session</p>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div style={s.header}>
        <div style={{ ...s.row, justifyContent: "space-between" }}>
          <h1 style={{ ...s.title, fontSize: 22 }}>Log Workout</h1>
          <button style={s.ghostBtn} onClick={() => { setActive(false); setSessionExercises([]); }}>Cancel</button>
        </div>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...s.input, marginTop: 12, width: "auto" }} />
      </div>

      {sessionExercises.map((ex, ei) => (
        <div key={ei} style={s.card}>
          <div style={{ ...s.row, justifyContent: "space-between", marginBottom: 12 }}>
            <div style={s.row}>
              <span style={s.badge(catColor[ex.category] || C.red)}>{ex.category}</span>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{ex.name}</span>
            </div>
            <button style={{ ...s.ghostBtn, padding: "4px 8px", color: C.red }} onClick={() => setSessionExercises(p => p.filter((_, i) => i !== ei))}>
              <Icon name="close" size={14} />
            </button>
          </div>

          {(ex.loggingType === "sets_reps" || ex.loggingType === "both") && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 36px", gap: 6, marginBottom: 6 }}>
                <span style={{ ...s.label, marginBottom: 0, textAlign: "center" }}>Reps</span>
                <span style={{ ...s.label, marginBottom: 0, textAlign: "center" }}>Weight</span>
                <span />
              </div>
              {ex.sets.map((set, si) => (
                <div key={si} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 36px", gap: 6, marginBottom: 6 }}>
                  <input style={s.input} type="number" placeholder="Reps" value={set.reps} onChange={e => updateSet(ei, si, "reps", e.target.value)} />
                  <input style={s.input} type="number" placeholder="kg" value={set.weight} onChange={e => updateSet(ei, si, "weight", e.target.value)} />
                  <button style={{ ...s.ghostBtn, padding: 0, width: 36, display: "flex", alignItems: "center", justifyContent: "center", color: C.red }} onClick={() => removeSet(ei, si)}>
                    <Icon name="close" size={12} />
                  </button>
                </div>
              ))}
              <button style={{ ...s.ghostBtn, width: "100%", marginTop: 4, textAlign: "center" }} onClick={() => addSet(ei)}>+ Add Set</button>
            </>
          )}

          {(ex.loggingType === "1rm" || ex.loggingType === "both") && (
            <div style={{ marginTop: 10 }}>
              <label style={s.label}>1RM (optional)</label>
              <input style={s.input} type="number" placeholder="kg" value={ex.oneRM} onChange={e => updateExField(ei, "oneRM", e.target.value)} />
            </div>
          )}

          {ex.loggingType === "cardio" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={s.label}>Duration (min)</label>
                <input style={s.input} type="number" placeholder="45" value={ex.duration} onChange={e => updateExField(ei, "duration", e.target.value)} />
              </div>
              <div>
                <label style={s.label}>Distance (km)</label>
                <input style={s.input} type="number" placeholder="5.0" value={ex.distance} onChange={e => updateExField(ei, "distance", e.target.value)} />
              </div>
            </div>
          )}
        </div>
      ))}

      <div style={{ padding: "0 16px 16px" }}>
        <button style={{ ...s.ghostBtn, width: "100%", textAlign: "center", marginBottom: 10 }} onClick={() => setShowAddExercise(true)}>
          + Add Exercise
        </button>
        {sessionExercises.length > 0 && (
          <button style={s.redBtn(true)} onClick={finishWorkout}>Finish Workout ✓</button>
        )}
      </div>

      {/* Add exercise modal */}
      <Modal open={showAddExercise} onClose={() => setShowAddExercise(false)} title="Add Exercise">
        {exercises.length > 0 && (
          <>
            <p style={s.label}>From Your Library</p>
            {exercises.map(ex => (
              <div key={ex.id} onClick={() => addExerciseToSession(ex)}
                style={{ ...s.card, margin: "0 0 8px", cursor: "pointer", padding: "12px 14px" }}>
                <div style={s.row}>
                  <span style={s.badge(catColor[ex.category] || C.red)}>{ex.category}</span>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{ex.name}</span>
                </div>
              </div>
            ))}
            <div style={s.divider} />
          </>
        )}
        <button style={s.redBtn(true)} onClick={() => { setShowAddExercise(false); setShowNewExModal(true); }}>
          + Create New Exercise
        </button>
      </Modal>

      {/* New exercise modal */}
      <Modal open={showNewExModal} onClose={() => setShowNewExModal(false)} title="New Exercise">
        <label style={s.label}>Exercise Name</label>
        <input style={{ ...s.input, marginBottom: 16 }} placeholder="e.g. Bench Press" value={newEx.name} onChange={e => setNewEx(p => ({ ...p, name: e.target.value }))} />
        <label style={s.label}>Category</label>
        <div style={{ marginBottom: 16 }}>
          <PillRow options={["Strength", "Bodyweight", "Cardio"]} value={newEx.category}
            onChange={v => setNewEx(p => ({ ...p, category: v, loggingType: v === "Cardio" ? "cardio" : "sets_reps" }))} />
        </div>
        {newEx.category !== "Cardio" && (
          <>
            <label style={s.label}>Logging Type</label>
            <div style={{ marginBottom: 20 }}>
              <PillRow options={["sets_reps", "1rm", "both"]} value={newEx.loggingType}
                onChange={v => setNewEx(p => ({ ...p, loggingType: v }))} />
            </div>
          </>
        )}
        <button style={s.redBtn(true)} onClick={createAndAdd}>Create & Add</button>
      </Modal>
    </div>
  );
}

// HISTORY SCREEN
function HistoryScreen({ sessions, onDeleteSession }) {
  const [expanded, setExpanded] = useState(null);
  const sorted = [...sessions].sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalVol = (sess) => sess.exercises.reduce((a, e) => {
    if (e.sets) return a + e.sets.reduce((b, s) => b + (s.reps * s.weight), 0);
    return a;
  }, 0);

  if (!sorted.length) return (
    <div>
      <div style={s.header}><h1 style={s.title}>History</h1><p style={s.subtitle}>All past sessions</p></div>
      <div style={s.empty}>
        <div style={s.emptyIcon}>📋</div>
        <p style={s.emptyText}>No sessions yet</p>
        <p style={s.emptySubtext}>Your workout history will appear here</p>
      </div>
    </div>
  );

  return (
    <div>
      <div style={s.header}><h1 style={s.title}>History</h1><p style={s.subtitle}>{sorted.length} session{sorted.length !== 1 ? "s" : ""} logged</p></div>
      {sorted.map(sess => {
        const vol = totalVol(sess);
        const isExp = expanded === sess.id;
        return (
          <div key={sess.id} style={{ ...s.card, cursor: "pointer" }} onClick={() => setExpanded(isExp ? null : sess.id)}>
            <div style={{ ...s.row, justifyContent: "space-between" }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                  {new Date(sess.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                </p>
                <div style={s.row}>
                  <span style={{ fontSize: 12, color: C.muted }}>{sess.exercises.length} exercises</span>
                  {vol > 0 && <span style={{ fontSize: 12, color: C.muted }}>• {vol.toLocaleString()} kg vol</span>}
                </div>
              </div>
              <div style={{ ...s.row, gap: 4 }}>
                <button onClick={e => { e.stopPropagation(); onDeleteSession(sess.id); }}
                  style={{ ...s.ghostBtn, padding: "6px 8px", color: C.red }}>
                  <Icon name="trash" size={14} />
                </button>
                <Icon name="chevron" size={16} />
              </div>
            </div>
            {isExp && (
              <div style={{ marginTop: 14 }}>
                <div style={s.divider} />
                {sess.exercises.map((e, i) => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div style={{ ...s.row, marginBottom: 6 }}>
                      <span style={s.badge(catColor[e.category] || C.red)}>{e.category}</span>
                      <span style={{ fontWeight: 700 }}>{e.name}</span>
                    </div>
                    {e.sets?.map((set, si) => (
                      <p key={si} style={{ fontSize: 13, color: C.muted, marginLeft: 8 }}>Set {si + 1}: {set.reps} reps × {set.weight} kg</p>
                    ))}
                    {e.oneRM && <p style={{ fontSize: 13, color: C.red, marginLeft: 8 }}>1RM: {e.oneRM} kg</p>}
                    {e.duration && <p style={{ fontSize: 13, color: C.muted, marginLeft: 8 }}>{e.duration} min {e.distance ? `• ${e.distance} km` : ""}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// PROGRESS SCREEN
function ProgressScreen({ exercises, sessions }) {
  const [view, setView] = useState("graph");
  const [selectedEx, setSelectedEx] = useState(null);
  const [metric, setMetric] = useState("weight");
  const [range, setRange] = useState("Month");

  const exerciseOptions = exercises;

  const getFilteredData = () => {
    if (!selectedEx) return [];
    const now = new Date();
    const cutoff = new Date();
    if (range === "Week") cutoff.setDate(now.getDate() - 7);
    else if (range === "Month") cutoff.setMonth(now.getMonth() - 1);
    else cutoff.setFullYear(now.getFullYear() - 1);

    return sessions
      .filter(s => new Date(s.date) >= cutoff)
      .flatMap(s => s.exercises
        .filter(e => e.exerciseId === selectedEx.id || e.name === selectedEx.name)
        .map(e => {
          const sets = e.sets || [];
          const maxWeight = sets.reduce((a, b) => Math.max(a, b.weight), 0);
          const totalVol = sets.reduce((a, b) => a + b.reps * b.weight, 0);
          return {
            date: new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            weight: maxWeight,
            oneRM: e.oneRM || (sets.length ? epley(maxWeight, sets.find(s => s.weight === maxWeight)?.reps || 1) : 0),
            volume: totalVol,
            duration: e.duration || 0,
            distance: e.distance || 0,
          };
        }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const data = getFilteredData();
  const isCardio = selectedEx?.loggingType === "cardio";
  const metricOptions = isCardio ? ["duration", "distance"] : ["weight", "oneRM", "volume"];

  return (
    <div>
      <div style={s.header}>
        <h1 style={s.title}>Progress</h1>
        <div style={{ ...s.row, marginTop: 12, gap: 8 }}>
          <button style={s.pill(view === "graph")} onClick={() => setView("graph")}>📈 Graph</button>
          <button style={s.pill(view === "table")} onClick={() => setView("table")}>📋 Table</button>
        </div>
      </div>

      <div style={{ padding: "0 16px 12px" }}>
        <label style={s.label}>Select Exercise</label>
        <select style={{ ...s.input, marginBottom: 12 }} value={selectedEx?.id || ""} onChange={e => {
          const ex = exercises.find(x => x.id === e.target.value);
          setSelectedEx(ex || null);
          setMetric(ex?.loggingType === "cardio" ? "duration" : "weight");
        }}>
          <option value="">-- Choose Exercise --</option>
          {exerciseOptions.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
        </select>

        {selectedEx && (
          <>
            <div style={{ ...s.row, gap: 8, marginBottom: 12 }}>
              {["Week", "Month", "Year"].map(r => <button key={r} style={s.pill(range === r)} onClick={() => setRange(r)}>{r}</button>)}
            </div>
            <div style={{ ...s.row, gap: 8, marginBottom: 16 }}>
              {metricOptions.map(m => <button key={m} style={s.pill(metric === m)} onClick={() => setMetric(m)}>{m.charAt(0).toUpperCase() + m.slice(1)}</button>)}
            </div>
          </>
        )}
      </div>

      {!selectedEx && (
        <div style={s.empty}>
          <div style={s.emptyIcon}>📈</div>
          <p style={s.emptyText}>Select an exercise</p>
          <p style={s.emptySubtext}>Choose an exercise above to see your progress</p>
        </div>
      )}

      {selectedEx && data.length === 0 && (
        <div style={s.empty}>
          <div style={s.emptyIcon}>🔍</div>
          <p style={s.emptyText}>No data for this range</p>
          <p style={s.emptySubtext}>Log some sessions to see progress</p>
        </div>
      )}

      {selectedEx && data.length > 0 && view === "graph" && (
        <div style={{ ...s.card }}>
          <p style={{ fontWeight: 700, marginBottom: 4 }}>{selectedEx.name}</p>
          <p style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>{metric} over {range.toLowerCase()}</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="date" tick={{ fill: C.muted, fontSize: 10 }} />
              <YAxis tick={{ fill: C.muted, fontSize: 10 }} />
              <Tooltip contentStyle={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text }} />
              <Line type="monotone" dataKey={metric} stroke={C.red} strokeWidth={2.5} dot={{ fill: C.red, r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: C.redL }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {selectedEx && data.length > 0 && view === "table" && (
        <div style={{ margin: "0 16px", ...s.tableWrap }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={s.th}>Date</th>
                {!isCardio && <><th style={s.th}>Max Wt</th><th style={s.th}>1RM</th><th style={s.th}>Volume</th></>}
                {isCardio && <><th style={s.th}>Duration</th><th style={s.th}>Distance</th></>}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? C.bg2 : C.bg3 }}>
                  <td style={s.td}>{row.date}</td>
                  {!isCardio && <><td style={s.td}>{row.weight} kg</td><td style={{ ...s.td, color: C.red }}>{row.oneRM} kg</td><td style={s.td}>{row.volume.toLocaleString()}</td></>}
                  {isCardio && <><td style={s.td}>{row.duration} min</td><td style={s.td}>{row.distance} km</td></>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// STATS SCREEN
function StatsScreen({ sessions, exercises }) {
  const thisWeek = sessions.filter(s => {
    const d = new Date(s.date);
    const now = new Date();
    return (now - d) / (1000 * 60 * 60 * 24) <= 7;
  });

  const exCounts = {};
  sessions.forEach(s => s.exercises.forEach(e => { exCounts[e.name] = (exCounts[e.name] || 0) + 1; }));
  const mostTrained = Object.entries(exCounts).sort((a, b) => b[1] - a[1])[0];

  const prs = {};
  sessions.forEach(s => s.exercises.forEach(e => {
    if (e.oneRM) {
      if (!prs[e.name] || e.oneRM > prs[e.name]) prs[e.name] = e.oneRM;
    }
  }));

  const StatCard = ({ icon, label, value, sub, accent }) => (
    <div style={{ ...s.card, background: accent ? `${C.red}11` : C.bg2, borderColor: accent ? `${C.red}44` : C.border }}>
      <div style={{ ...s.row, justifyContent: "space-between" }}>
        <div>
          <p style={{ ...s.label, marginBottom: 6 }}>{label}</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: accent ? C.red : C.text, lineHeight: 1 }}>{value}</p>
          {sub && <p style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{sub}</p>}
        </div>
        <span style={{ fontSize: 32 }}>{icon}</span>
      </div>
    </div>
  );

  return (
    <div>
      <div style={s.header}><h1 style={s.title}>Stats</h1><p style={s.subtitle}>Your fitness overview</p></div>
      <StatCard icon="🏋️" label="Total Workouts" value={sessions.length} sub="all time" accent />
      <StatCard icon="🔥" label="This Week" value={thisWeek.length} sub="sessions in last 7 days" />
      {mostTrained && <StatCard icon="⭐" label="Most Trained" value={mostTrained[0]} sub={`${mostTrained[1]} sessions`} />}
      <StatCard icon="📦" label="Exercises" value={exercises.length} sub="in your library" />

      {Object.keys(prs).length > 0 && (
        <div style={s.card}>
          <p style={{ ...s.label, marginBottom: 12 }}>🏆 Personal Records (1RM)</p>
          {Object.entries(prs).map(([name, val]) => (
            <div key={name} style={{ ...s.row, justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{name}</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: C.red }}>{val} kg</span>
            </div>
          ))}
        </div>
      )}

      {sessions.length === 0 && (
        <div style={s.empty}>
          <div style={s.emptyIcon}>🏆</div>
          <p style={s.emptyText}>No stats yet</p>
          <p style={s.emptySubtext}>Log workouts to unlock your stats</p>
        </div>
      )}
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("today");
  const [exercises, setExercises] = useState(() => load(KEYS.exercises, []));
  const [sessions, setSessions] = useState(() => load(KEYS.sessions, []));

  const saveSession = useCallback((sess) => {
    setSessions(p => {
      const next = [sess, ...p];
      save(KEYS.sessions, next);
      return next;
    });
  }, []);

  const deleteSession = useCallback((id) => {
    setSessions(p => {
      const next = p.filter(s => s.id !== id);
      save(KEYS.sessions, next);
      return next;
    });
  }, []);

  // sync exercises if mutated directly
  const syncExercises = useCallback(() => {
    setExercises([...load(KEYS.exercises, [])]);
  }, []);

  useEffect(() => {
    if (tab === "progress" || tab === "today") syncExercises();
  }, [tab]);

  const tabs = [
    { id: "today", label: "Today", icon: "home" },
    { id: "history", label: "History", icon: "history" },
    { id: "progress", label: "Progress", icon: "progress" },
    { id: "stats", label: "Stats", icon: "stats" },
  ];

  return (
    <div style={s.app}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        input[type=number]::-webkit-outer-spin-button, input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        select option { background: #1a1a1a; color: #f5f5f5; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #111; } ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap');
      `}</style>

      {tab === "today" && <TodayScreen exercises={exercises} sessions={sessions} onSaveSession={saveSession} />}
      {tab === "history" && <HistoryScreen sessions={sessions} onDeleteSession={deleteSession} />}
      {tab === "progress" && <ProgressScreen exercises={exercises} sessions={sessions} />}
      {tab === "stats" && <StatsScreen sessions={sessions} exercises={exercises} />}

      <nav style={s.nav}>
        {tabs.map(t => (
          <button key={t.id} style={s.navBtn(tab === t.id)} onClick={() => setTab(t.id)}>
            <Icon name={t.icon} size={22} />
            <span style={s.navLabel}>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
