import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { DISHES } from "../lib/data.js";
import Icon from "../components/Icon.jsx";
import { PageHead, MacroPills, Tag } from "../components/ui.jsx";

export default function Plan() {
  const { targets, plan, setPlan } = useApp();
  const navigate = useNavigate();
  const [cheaper, setCheaper] = useState(false);

  const total = plan.reduce((a, m) => ({ cal: a.cal + m.cal, p: a.p + m.p, f: a.f + m.f, c: a.c + m.c }), { cal: 0, p: 0, f: 0, c: 0 });

  const swap = (idx) => {
    const pool = DISHES.filter((d) => !plan.some((p) => p.dish === d.name));
    const next = pool[Math.floor(Math.random() * pool.length)] || DISHES[0];
    setPlan(plan.map((m, i) => (i === idx ? { ...m, dish: next.name, emoji: next.emoji, cal: next.cal, p: next.p, f: next.f, c: next.c } : m)));
  };

  return (
    <div className="fade-up" style={{ maxWidth: 820, margin: "0 auto" }}>
      <PageHead title="План на день" subtitle="Сбалансирован под твою норму — меняй блюда как удобно"
        right={cheaper && <Tag color="var(--fat)" soft="var(--fat-soft)"><Icon name="wallet" size={14} /> Эконом-режим</Tag>} />

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {plan.map((m, i) => (
          <div key={i} className="card" style={{ padding: 18, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 54, height: 54, borderRadius: 14, background: "var(--surface-sunken)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>{m.emoji}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="eyebrow" style={{ marginBottom: 4, color: "var(--ink-3)" }}>{m.label}</div>
              <div style={{ fontWeight: 800, fontSize: 16, fontFamily: "var(--font-display)" }}>{m.dish}</div>
              <div style={{ marginTop: 8 }}><MacroPills p={m.p} f={m.f} c={m.c} size="sm" /></div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="num" style={{ fontWeight: 800, fontSize: 18 }}>{cheaper ? Math.round(m.cal * 0.95) : m.cal}</div>
              <div className="muted" style={{ fontSize: 11.5 }}>ккал</div>
              <button className="btn btn-quiet btn-sm" style={{ marginTop: 8, padding: "6px 10px" }} onClick={() => swap(i)}><Icon name="replace" size={14} /> Заменить</button>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 20, marginTop: 14, background: "var(--ink)", color: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.7)", fontWeight: 600 }}>Итого за день</div>
            <div className="num" style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 30, marginTop: 2 }}>{Math.round(total.cal)} <span style={{ fontSize: 15, color: "rgba(255,255,255,.6)" }}>/ {Math.round(targets.calories)} ккал</span></div>
          </div>
          <div style={{ display: "flex", gap: 18 }}>
            {[["Б", total.p], ["Ж", total.f], ["У", total.c]].map(([l, v]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div className="num" style={{ fontWeight: 800, fontSize: 20 }}>{Math.round(v)}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.6)", marginTop: 2 }}>{l} (г)</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
        <button className="btn btn-ghost" onClick={() => setCheaper(!cheaper)}><Icon name="wallet" size={17} /> {cheaper ? "Обычный режим" : "Сделать дешевле"}</button>
        <button className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={() => navigate("/shopping")}><Icon name="cart" size={17} /> Сформировать список покупок</button>
      </div>
    </div>
  );
}
