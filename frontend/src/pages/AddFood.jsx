import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DISHES } from "../lib/data.js";
import Icon from "../components/Icon.jsx";
import { PageHead, ImageSlot } from "../components/ui.jsx";

function Note({ children }) {
  return (
    <div style={{ display: "flex", gap: 9, alignItems: "flex-start", padding: "12px 15px", borderRadius: "var(--r-sm)",
      background: "var(--surface-2)", color: "var(--ink-2)", fontSize: 13, lineHeight: 1.5, border: "1px solid var(--line)" }}>
      <Icon name="info" size={16} style={{ color: "var(--brand)", flexShrink: 0, marginTop: 1 }} /> {children}
    </div>
  );
}

export default function AddFood() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("text");
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState(false);
  const [query, setQuery] = useState("");

  const open = (d, source) => navigate("/add/analyze", { state: { dish: { ...d, source } } });
  const tabs = [
    { id: "photo", label: "Фото", icon: "camera" },
    { id: "text", label: "Текст", icon: "text" },
    { id: "base", label: "База", icon: "search" },
  ];
  const filtered = DISHES.filter((d) => d.name.toLowerCase().includes(query.toLowerCase()));
  const textMatches = text.trim()
    ? DISHES.filter((d) => text.toLowerCase().split(/[\s,]+/).some((w) => w.length > 2 && d.name.toLowerCase().includes(w)))
    : [];

  const DishRow = ({ d, source }) => (
    <button onClick={() => open(d, source)} style={{ textAlign: "left", border: "1.5px solid var(--line)", background: "var(--surface)",
      borderRadius: "var(--r-md)", padding: 14, cursor: "pointer", display: "flex", gap: 12, alignItems: "center", width: "100%" }}>
      <div style={{ width: 46, height: 46, borderRadius: 12, background: "var(--surface-sunken)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{d.emoji}</div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name}</div>
        <div className="num muted" style={{ fontSize: 12.5, marginTop: 3 }}>{d.cal} ккал · Б{d.p} Ж{d.f} У{d.c}</div>
      </div>
      <Icon name="arrowR" size={17} style={{ color: "var(--ink-4)" }} />
    </button>
  );

  return (
    <div className="fade-up" style={{ maxWidth: 760, margin: "0 auto" }}>
      <PageHead title="Добавить еду" subtitle="Опиши словами, выбери из базы или загрузи фото" />
      <div className="card" style={{ padding: 8, display: "flex", gap: 6, marginBottom: 18 }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, border: "none", cursor: "pointer", borderRadius: "var(--r-md)", padding: "13px",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 9, fontWeight: 700, fontSize: 15,
            background: tab === t.id ? "var(--brand-softer)" : "transparent", color: tab === t.id ? "var(--brand-ink)" : "var(--ink-3)" }}>
            <Icon name={t.icon} size={19} /> {t.label}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 26 }}>
        {tab === "photo" && (
          <div>
            <div onClick={() => setPhoto(true)} style={{ cursor: "pointer" }}>
              {photo ? <div style={{ height: 200, borderRadius: "var(--r-md)", background: "linear-gradient(135deg,#dfeee7,#cfe7dc)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64 }}>🍛</div>
                : <ImageSlot label="нажми, чтобы загрузить фото блюда" h={200} icon="camera" />}
            </div>
            <div style={{ marginTop: 16 }}><Note>Распознавание по фото будет подключено позже. Сейчас можно добавить блюдо текстом или выбрать из базы.</Note></div>
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button className="btn btn-primary btn-block" onClick={() => setTab("text")}><Icon name="text" size={17} /> Ввести текстом</button>
              <button className="btn btn-ghost btn-block" onClick={() => setTab("base")}><Icon name="search" size={17} /> Выбрать из базы</button>
            </div>
          </div>
        )}

        {tab === "text" && (
          <div>
            <label className="field-label">Опиши, что ты съел(а)</label>
            <textarea className="input" rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="Например: гречка с курицей" style={{ resize: "none", lineHeight: 1.5 }} />
            <div style={{ display: "flex", gap: 8, margin: "12px 0 16px", flexWrap: "wrap" }}>
              {["Овсянка", "Гречка с курицей", "Омлет", "Творог"].map((s) => <button key={s} className="chip" onClick={() => setText(s)}>{s}</button>)}
            </div>
            <Note>Авто-разбор текста подключим к backend позже. Пока выбери подходящее блюдо из базы по описанию — КБЖУ возьмём из базы блюд.</Note>
            {text.trim() && (
              <div style={{ marginTop: 16 }}>
                <div className="field-label">{textMatches.length ? "Похоже на эти блюда:" : "Совпадений в базе не найдено"}</div>
                {textMatches.length ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{textMatches.map((d) => <DishRow key={d.id} d={d} source="Текст" />)}</div>
                ) : (
                  <button className="btn btn-ghost btn-block" onClick={() => { setQuery(""); setTab("base"); }}>Открыть базу блюд <Icon name="arrowR" size={16} /></button>
                )}
              </div>
            )}
          </div>
        )}

        {tab === "base" && (
          <div>
            <div style={{ position: "relative", marginBottom: 16 }}>
              <Icon name="search" size={18} style={{ position: "absolute", left: 15, top: 14, color: "var(--ink-4)" }} />
              <input className="input" style={{ paddingLeft: 44 }} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Поиск блюда…" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {filtered.map((d) => <DishRow key={d.id} d={d} source="База" />)}
              {filtered.length === 0 && <div className="muted" style={{ gridColumn: "1/-1", textAlign: "center", padding: 24 }}>Ничего не найдено</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
