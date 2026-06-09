import React, { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { sumDiary } from "../lib/data.js";
import { api } from "../api/client.js";
import Icon from "../components/Icon.jsx";
import { MACRO_META, PriceTag } from "../components/ui.jsx";

const PORTIONS = [
  { id: "s", label: "Маленькая", factor: 0.7 },
  { id: "m", label: "Средняя", factor: 1.0 },
  { id: "l", label: "Большая", factor: 1.4 },
];

export default function AnalyzeDish() {
  const { addDiary, targets, diary, openHow } = useApp();
  const navigate = useNavigate();
  const { state } = useLocation();
  const d = state?.dish;

  const [portion, setPortion] = useState("m");
  const [grams, setGrams] = useState(250);
  const [custom, setCustom] = useState(false);
  const [meal, setMeal] = useState("snack");
  const [saving, setSaving] = useState(false);

  if (!d) return <Navigate to="/add" replace />;

  const factor = custom ? grams / 250 : PORTIONS.find((p) => p.id === portion).factor;
  const scaled = { cal: Math.round(d.cal * factor), p: Math.round(d.p * factor), f: Math.round(d.f * factor), c: Math.round(d.c * factor) };
  const eaten = sumDiary(diary);
  const after = eaten.cal + scaled.cal;
  const remainingAfter = Math.round(targets.calories - after);

  const add = () => {
    setSaving(true);
    const entry = { id: "d" + Date.now(), meal_name: d.name, emoji: d.emoji,
      time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }), meal, source: d.source || "База", ...scaled };
    api.addDiaryEntry({ entry_date: new Date().toISOString().slice(0, 10), meal_name: d.name,
      calories: scaled.cal, protein_g: scaled.p, fat_g: scaled.f, carbs_g: scaled.c, source: (d.source || "base").toLowerCase() })
      .catch(() => {}).finally(() => { addDiary(entry); navigate("/"); });
  };

  return (
    <div className="fade-up" style={{ maxWidth: 720, margin: "0 auto" }}>
      <button className="btn btn-quiet btn-sm" style={{ marginBottom: 14 }} onClick={() => navigate("/add")}><Icon name="arrowL" size={16} /> Назад</button>
      <div className="card" style={{ padding: 26 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 22 }}>
          <div style={{ width: 72, height: 72, borderRadius: 18, background: "var(--surface-sunken)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38 }}>{d.emoji}</div>
          <div style={{ flex: 1 }}>
            <div className="eyebrow" style={{ marginBottom: 5 }}>Блюдо из базы · {d.source}</div>
            <h1 style={{ fontSize: 25 }}>{d.name}</h1>
            <div style={{ marginTop: 8 }}><PriceTag price={d.price} demo size="sm" /></div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 24 }}>
          {[["cal", scaled.cal, "ккал"], ["p", scaled.p, "г белка"], ["f", scaled.f, "г жиров"], ["c", scaled.c, "г углев."]].map(([k, v, u]) => {
            const m = MACRO_META[k];
            return (
              <div key={k} style={{ padding: "14px 12px", borderRadius: "var(--r-md)", textAlign: "center", background: k === "cal" ? "var(--brand-softer)" : "var(--surface-2)", border: "1px solid var(--line)" }}>
                <div className="num" style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, color: k === "cal" ? "var(--brand-ink)" : m.color }}>{v}</div>
                <div className="muted" style={{ fontSize: 11.5, marginTop: 3 }}>{u}</div>
              </div>
            );
          })}
        </div>

        <label className="field-label">Приём пищи</label>
        <div style={{ display: "flex", gap: 9, marginBottom: 16 }}>
          {[["breakfast", "Завтрак"], ["lunch", "Обед"], ["snack", "Перекус"], ["dinner", "Ужин"]].map(([id, l]) => (
            <button key={id} onClick={() => setMeal(id)} style={{ flex: 1, padding: "10px", borderRadius: "var(--r-sm)", cursor: "pointer", fontWeight: 700, fontSize: 13.5,
              border: "2px solid " + (meal === id ? "var(--brand)" : "var(--line)"), background: meal === id ? "var(--brand-softer)" : "var(--surface)" }}>{l}</button>
          ))}
        </div>

        <label className="field-label">Размер порции</label>
        <div style={{ display: "flex", gap: 9, marginBottom: 12 }}>
          {PORTIONS.map((p) => (
            <button key={p.id} onClick={() => { setPortion(p.id); setCustom(false); }} style={{ flex: 1, padding: "11px", borderRadius: "var(--r-sm)", cursor: "pointer", fontWeight: 700, fontSize: 14,
              border: "2px solid " + (!custom && portion === p.id ? "var(--brand)" : "var(--line)"), background: !custom && portion === p.id ? "var(--brand-softer)" : "var(--surface)" }}>{p.label}</button>
          ))}
          <button onClick={() => setCustom(true)} style={{ flex: 1, padding: "11px", borderRadius: "var(--r-sm)", cursor: "pointer", fontWeight: 700, fontSize: 14,
            border: "2px solid " + (custom ? "var(--brand)" : "var(--line)"), background: custom ? "var(--brand-softer)" : "var(--surface)" }}>Граммы</button>
        </div>
        {custom && (
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 4 }}>
            <input type="range" min={50} max={600} step={10} value={grams} onChange={(e) => setGrams(+e.target.value)} style={{ flex: 1, accentColor: "var(--brand)" }} />
            <span className="num" style={{ fontWeight: 800, fontSize: 15, minWidth: 70, textAlign: "right" }}>{grams} г</span>
          </div>
        )}

        <div style={{ marginTop: 20, padding: 18, borderRadius: "var(--r-md)", background: "var(--surface-2)", border: "1px solid var(--line)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Icon name="chart" size={17} style={{ color: "var(--brand)" }} />
            <span style={{ fontWeight: 800, fontSize: 14.5, fontFamily: "var(--font-display)" }}>Как это повлияет на день</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14, color: "var(--ink-2)", marginBottom: 10 }}>
            <span className="num">{Math.round(eaten.cal)}</span>
            <Icon name="arrowR" size={15} style={{ color: "var(--ink-4)" }} />
            <span className="num" style={{ fontWeight: 800, color: "var(--ink)" }}>{after}</span>
            <span>ккал из {Math.round(targets.calories)}</span>
            <span className="num" style={{ marginLeft: "auto", padding: "3px 10px", borderRadius: 99, fontWeight: 700, fontSize: 12.5,
              background: remainingAfter >= 0 ? "var(--brand-softer)" : "var(--danger-soft)", color: remainingAfter >= 0 ? "var(--brand-ink)" : "var(--danger)" }}>
              {remainingAfter >= 0 ? `останется ${remainingAfter}` : `превышение ${-remainingAfter}`}
            </span>
          </div>
          <div style={{ height: 8, borderRadius: 99, background: "var(--surface-sunken)", overflow: "hidden", display: "flex" }}>
            <div style={{ width: (eaten.cal / targets.calories) * 100 + "%", background: "var(--brand)" }} />
            <div style={{ width: (scaled.cal / targets.calories) * 100 + "%", background: "var(--brand-soft)" }} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
          <button className="btn btn-primary btn-block btn-lg" onClick={add} disabled={saving}><Icon name="check" size={18} /> {saving ? "Добавляю…" : "Добавить в дневник"}</button>
          <button className="btn btn-ghost btn-lg" onClick={() => setCustom(true)}><Icon name="edit" size={17} /> Изменить</button>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
          <button className="btn btn-quiet btn-sm" style={{ color: "var(--ink-3)" }} onClick={() => navigate("/add")}>Это не то блюдо</button>
          <button className="btn btn-quiet btn-sm" style={{ color: "var(--brand)" }} onClick={openHow}><Icon name="info" size={14} /> Как мы считаем?</button>
        </div>
      </div>
    </div>
  );
}
