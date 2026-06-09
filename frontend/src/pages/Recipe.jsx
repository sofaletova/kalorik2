import React from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import Icon from "../components/Icon.jsx";

export default function Recipe() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const d = state?.dish;
  if (!d) return <Navigate to="/recommend" replace />;

  const steps = [
    "Подготовь ингредиенты и отмерь порцию.",
    `Доведи основу (${d.name.toLowerCase()}) до готовности на плите.`,
    "Добавь овощи и специи по вкусу.",
    "Выложи на тарелку и взвесь готовую порцию.",
  ];
  return (
    <div className="fade-up" style={{ maxWidth: 620, margin: "0 auto" }}>
      <button className="btn btn-quiet btn-sm" style={{ marginBottom: 14 }} onClick={() => navigate("/recommend")}><Icon name="arrowL" size={16} /> К рекомендациям</button>
      <div className="card" style={{ padding: 26 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 20 }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: "var(--surface-sunken)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>{d.emoji}</div>
          <div>
            <h1 style={{ fontSize: 23 }}>{d.name}</h1>
            <div className="muted num" style={{ fontSize: 13.5, marginTop: 4 }}>{d.cal} ккал · {d.time} мин · ≈ {d.price} ₽ (по демо-базе)</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 13, alignItems: "flex-start" }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, background: "var(--brand-softer)", color: "var(--brand-ink)", fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
              <span style={{ fontSize: 14.5, lineHeight: 1.5, color: "var(--ink-2)", paddingTop: 3 }}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
