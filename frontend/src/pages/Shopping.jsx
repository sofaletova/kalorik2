import React, { useState } from "react";
import { SHOPPING } from "../lib/data.js";
import Icon from "../components/Icon.jsx";
import { PageHead } from "../components/ui.jsx";

export default function Shopping() {
  const [cheaper, setCheaper] = useState(false);
  const [copied, setCopied] = useState(false);
  const [checked, setChecked] = useState({});

  const factor = cheaper ? 0.82 : 1;
  const total = SHOPPING.reduce((a, cat) => a + cat.items.reduce((s, it) => s + it.price, 0), 0);
  const shown = Math.round(total * factor);

  const copy = () => {
    const text = SHOPPING.map((c) => c.cat + ":\n" + c.items.map((i) => "• " + i.name + " — " + i.qty).join("\n")).join("\n\n");
    if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true); setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="fade-up" style={{ maxWidth: 820, margin: "0 auto" }}>
      <PageHead title="Список покупок" subtitle="Собран из плана на день — по категориям"
        right={<div style={{ textAlign: "right" }}>
          <div className="num" style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, color: "var(--brand)" }}>≈ {shown} ₽</div>
          <div className="muted" style={{ fontSize: 12 }}>примерная стоимость</div>
        </div>} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {SHOPPING.map((cat) => (
          <div key={cat.cat} className="card" style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: "var(--brand-softer)", color: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={cat.icon} size={16} /></div>
              <h3 style={{ fontSize: 15.5 }}>{cat.cat}</h3>
            </div>
            {cat.items.map((it, i) => {
              const key = cat.cat + i;
              const on = checked[key];
              return (
                <div key={key} onClick={() => setChecked({ ...checked, [key]: !on })} style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 0", cursor: "pointer", borderTop: i ? "1px solid var(--line)" : "none" }}>
                  <div style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, border: "2px solid " + (on ? "var(--brand)" : "var(--line-2)"), background: on ? "var(--brand)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {on && <Icon name="check" size={12} stroke={3} style={{ color: "#fff" }} />}
                  </div>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 600, textDecoration: on ? "line-through" : "none", color: on ? "var(--ink-4)" : "var(--ink)" }}>{it.name}</span>
                  <span className="num muted" style={{ fontSize: 13 }}>{it.qty}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
        <button className="btn btn-primary" onClick={copy}><Icon name={copied ? "check" : "copy"} size={17} /> {copied ? "Скопировано!" : "Скопировать список"}</button>
        <button className="btn btn-ghost" onClick={() => setCheaper(!cheaper)}><Icon name="wallet" size={17} /> {cheaper ? "Обычные цены" : "Сделать дешевле"}</button>
        <button className="btn btn-ghost"><Icon name="replace" size={17} /> Заменить продукты</button>
      </div>

      <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: "var(--r-sm)", background: "var(--surface-sunken)", fontSize: 12.5, lineHeight: 1.5, color: "var(--ink-3)" }}>
        Цены рассчитаны ориентировочно на основе демо-базы продуктов. В рабочей версии могут подтягиваться из базы цен или вводиться пользователем.
      </div>
    </div>
  );
}
