import React from "react";
import { useApp } from "../context/AppContext.jsx";
import { PROGRESS } from "../lib/data.js";
import { PageHead } from "../components/ui.jsx";

export default function Progress() {
  const { targets } = useApp();
  const P = PROGRESS;
  const wMin = Math.min(...P.weight) - 0.3, wMax = Math.max(...P.weight) + 0.3;
  const calMax = Math.max(targets.calories, ...P.calories) * 1.1;

  return (
    <div className="fade-up" style={{ maxWidth: 880, margin: "0 auto" }}>
      <PageHead title="Прогресс" subtitle="Динамика веса и калорий за неделю" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18 }}>
            <h3 style={{ fontSize: 16 }}>Вес</h3>
            <span style={{ fontSize: 13, color: "var(--brand)", fontWeight: 700 }}>−0.7 кг за неделю</span>
          </div>
          <svg viewBox="0 0 300 140" style={{ width: "100%", height: "auto" }}>
            <polyline fill="none" stroke="var(--brand)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              points={P.weight.map((w, i) => `${10 + i * 46},${130 - ((w - wMin) / (wMax - wMin)) * 110}`).join(" ")} />
            {P.weight.map((w, i) => (
              <circle key={i} cx={10 + i * 46} cy={130 - ((w - wMin) / (wMax - wMin)) * 110} r="3.5" fill="#fff" stroke="var(--brand)" strokeWidth="2.5" />
            ))}
          </svg>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>{P.days.map((d) => <span key={d} className="muted" style={{ fontSize: 11 }}>{d}</span>)}</div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18 }}>
            <h3 style={{ fontSize: 16 }}>Калории</h3>
            <span className="muted" style={{ fontSize: 13 }}>норма {Math.round(targets.calories)}</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 130, position: "relative" }}>
            <div style={{ position: "absolute", left: 0, right: 0, borderTop: "1.5px dashed var(--line-2)", bottom: (targets.calories / calMax) * 130 }} />
            {P.calories.map((c, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ width: "100%", maxWidth: 26, borderRadius: "6px 6px 0 0", height: (c / calMax) * 124, background: c <= targets.calories ? "var(--brand)" : "var(--fat)" }} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>{P.days.map((d) => <span key={d} className="muted" style={{ fontSize: 11, flex: 1, textAlign: "center" }}>{d}</span>)}</div>
        </div>
      </div>

      <div className="card" style={{ padding: 22, marginTop: 18, display: "flex", gap: 20, flexWrap: "wrap" }}>
        {[["Средние калории", Math.round(P.calories.reduce((a, b) => a + b, 0) / P.calories.length), "ккал/день"],
          ["Дней в норме", P.calories.filter((c) => c <= targets.calories).length + " из 7", ""],
          ["Текущий вес", P.weight[P.weight.length - 1], "кг"]].map(([l, v, u]) => (
          <div key={l} style={{ flex: 1, minWidth: 140 }}>
            <div className="muted" style={{ fontSize: 12.5, marginBottom: 4 }}>{l}</div>
            <div className="num" style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24 }}>{v} <span style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 600 }}>{u}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}
