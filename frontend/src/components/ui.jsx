import React from "react";
import Icon from "./Icon.jsx";

export const MACRO_META = {
  cal: { label: "Калории", color: "var(--cal)", unit: "ккал" },
  p: { label: "Белки", color: "var(--protein)", unit: "г", soft: "var(--protein-soft)" },
  f: { label: "Жиры", color: "var(--fat)", unit: "г", soft: "var(--fat-soft)" },
  c: { label: "Углеводы", color: "var(--carbs)", unit: "г", soft: "var(--carbs-soft)" },
};

export function Brand({ size = 1 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
      <div style={{ width: 40 * size, height: 40 * size, borderRadius: 12 * size,
        background: "linear-gradient(140deg, var(--brand), #43c99d)", display: "flex",
        alignItems: "center", justifyContent: "center", boxShadow: "var(--sh-brand)" }}>
        <Icon name="leaf" size={23 * size} stroke={2.1} style={{ color: "#fff" }} />
      </div>
      <span style={{ fontFamily: "var(--font-display)", fontWeight: 900,
        fontSize: 20 * size, letterSpacing: "0.01em", color: "var(--ink)" }}>
        КАЛО<span style={{ color: "var(--brand)" }}>РИК</span>
      </span>
    </div>
  );
}

export function StepDots({ step, total }) {
  return (
    <div style={{ display: "flex", gap: 7 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ height: 6, borderRadius: 99, width: i === step ? 26 : 6,
          background: i <= step ? "var(--brand)" : "var(--line-2)", transition: "all .3s ease" }} />
      ))}
    </div>
  );
}

export function Ring({ value, max, size = 200, stroke = 16, color = "var(--cal)", children }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / max));
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-sunken)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={`${circ * pct} ${circ}`}
          style={{ transition: "stroke-dasharray .9s cubic-bezier(.2,.7,.3,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center" }}>{children}</div>
    </div>
  );
}

export function MacroBar({ kind, value, target }) {
  const m = MACRO_META[kind];
  const pct = Math.max(0, Math.min(1, value / target));
  const over = value > target;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, marginBottom: 7 }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: "var(--ink-2)" }}>{m.label}</span>
        <span className="num" style={{ fontSize: 13.5, color: "var(--ink-3)", fontWeight: 600, whiteSpace: "nowrap" }}>
          <b style={{ color: "var(--ink)" }}>{Math.round(value)}</b> / {Math.round(target)} {m.unit}
        </span>
      </div>
      <div style={{ height: 9, borderRadius: 999, background: "var(--surface-sunken)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: pct * 100 + "%", borderRadius: 999,
          background: over ? "var(--danger)" : m.color, transition: "width .8s cubic-bezier(.2,.7,.3,1)" }} />
      </div>
    </div>
  );
}

export function MacroPills({ p, f, c, size = "md" }) {
  const small = size === "sm";
  return (
    <div style={{ display: "flex", gap: small ? 6 : 8, flexWrap: "wrap" }}>
      {[["p", p], ["f", f], ["c", c]].map(([k, v]) => {
        const m = MACRO_META[k];
        return (
          <span key={k} className="num" style={{ display: "inline-flex", alignItems: "center", gap: 5,
            padding: small ? "3px 9px" : "5px 11px", borderRadius: 999, whiteSpace: "nowrap",
            background: m.soft, color: m.color, fontWeight: 700, fontSize: small ? 12 : 13 }}>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: m.color }} />
            {m.label[0]} {Math.round(v)}{m.unit}
          </span>
        );
      })}
    </div>
  );
}

export function Tag({ children, color = "var(--brand)", soft = "var(--brand-softer)" }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 11px",
      borderRadius: 999, background: soft, color, fontWeight: 700, fontSize: 12.5 }}>{children}</span>
  );
}

export function Avatar({ name, size = 44 }) {
  const initial = (name || "?").trim().charAt(0).toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: "50%",
      background: "linear-gradient(135deg, var(--brand) 0%, #45c79e 100%)", color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)",
      fontWeight: 800, fontSize: size * 0.42, flexShrink: 0, boxShadow: "var(--sh-brand)" }}>{initial}</div>
  );
}

export function ImageSlot({ label, h = 160, radius = "var(--r-md)", icon = "camera" }) {
  return (
    <div style={{ height: h, borderRadius: radius, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 10, color: "var(--ink-4)",
      background: "repeating-linear-gradient(45deg, #eef3ef, #eef3ef 12px, #e7eee9 12px, #e7eee9 24px)",
      border: "1.5px dashed var(--line-2)" }}>
      <Icon name={icon} size={26} stroke={1.6} />
      <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 12 }}>{label}</span>
    </div>
  );
}

export function Disclaimer({ style }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 16px",
      borderRadius: "var(--r-sm)", background: "var(--surface-sunken)", color: "var(--ink-3)",
      fontSize: 12.5, lineHeight: 1.5, ...style }}>
      <Icon name="info" size={16} stroke={2} style={{ flexShrink: 0, marginTop: 1 }} />
      <span>Сервис не является медицинской рекомендацией и не заменяет консультацию врача или диетолога.</span>
    </div>
  );
}

export function PageHead({ title, subtitle, right }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 24 }}>
      <div>
        <h1 style={{ fontSize: 30, lineHeight: 1.1 }}>{title}</h1>
        {subtitle && <p className="muted" style={{ margin: "8px 0 0", fontSize: 15 }}>{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function Modal({ title, onClose, children, maxWidth = 560 }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(16,36,31,0.42)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backdropFilter: "blur(3px)" }}>
      <div onClick={(e) => e.stopPropagation()} className="card fade-up"
        style={{ width: "100%", maxWidth, maxHeight: "88vh", overflowY: "auto", padding: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <h2 style={{ fontSize: 21, whiteSpace: "nowrap" }}>{title}</h2>
          <button className="btn btn-quiet" style={{ padding: 8 }} onClick={onClose}><Icon name="close" size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

const HOW_ITEMS = [
  { icon: "target", t: "Дневная норма", d: "Рассчитывается по формуле Миффлина — Сан Жеора с учётом пола, возраста, роста, веса, активности и цели." },
  { icon: "egg", t: "КБЖУ блюд", d: "Берётся из базы блюд backend, а в режиме прототипа — из демо-базы. Реальные значения зависят от рецепта и веса порции." },
  { icon: "wallet", t: "Цены", d: "Ориентировочные и показываются только при наличии данных о стоимости. В демо-режиме отмечены как «по демо-базе»." },
  { icon: "edit", t: "Порции", d: "Размер порции можно корректировать вручную — КБЖУ пересчитывается автоматически." },
  { icon: "heart", t: "Не медицина", d: "AI-помощник не заменяет врача или диетолога. При вопросах о здоровье обратись к специалисту." },
];

export function HowWeCalc({ onClose }) {
  return (
    <Modal title="Как мы считаем" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {HOW_ITEMS.map((i) => (
          <div key={i.t} style={{ display: "flex", gap: 13, alignItems: "flex-start" }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, background: "var(--brand-softer)",
              color: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name={i.icon} size={19} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14.5, fontFamily: "var(--font-display)" }}>{i.t}</div>
              <div className="muted" style={{ fontSize: 13.5, lineHeight: 1.5, marginTop: 3 }}>{i.d}</div>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

export function PriceTag({ price, demo = true, size = "md" }) {
  const small = size === "sm";
  if (price == null || price <= 0) return <span className="muted" style={{ fontSize: small ? 12 : 13 }}>Стоимость не рассчитана</span>;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span className="num" style={{ fontWeight: 800, fontSize: small ? 13 : 14.5 }}>≈ {price} ₽</span>
      {demo && <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--fat)", background: "var(--fat-soft)",
        padding: "2px 7px", borderRadius: 99 }}>по демо-базе</span>}
    </span>
  );
}

export function DataSourceBadge({ source, onClick }) {
  const backend = source === "backend";
  return (
    <button onClick={onClick} className="chip" style={{ cursor: "pointer",
      background: backend ? "var(--brand-softer)" : "var(--fat-soft)",
      color: backend ? "var(--brand-ink)" : "#946012",
      border: "1.5px solid " + (backend ? "var(--brand-soft)" : "#f0dcb4") }}>
      <span style={{ width: 7, height: 7, borderRadius: 99, background: backend ? "var(--brand)" : "var(--fat)" }} />
      {backend ? "Данные из backend" : "Демо-данные"}
      <Icon name="info" size={13} stroke={2} />
    </button>
  );
}

/* Form controls reused by onboarding + profile edit */
export function NumField({ label, value, set, min, max, step = 1, unit }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button className="btn btn-ghost" style={{ padding: "11px 14px" }} onClick={() => set(Math.max(min, value - step))}>–</button>
        <div className="input num" style={{ textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
          <b>{value}</b><span className="muted" style={{ fontSize: 13 }}>{unit}</span>
        </div>
        <button className="btn btn-ghost" style={{ padding: "11px 14px" }} onClick={() => set(Math.min(max, value + step))}>+</button>
      </div>
    </div>
  );
}

export function ChipGroup({ options, value, set, single }) {
  const toggle = (id) => {
    if (single) return set(id);
    set(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  };
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map((o) => {
        const active = single ? value === o.id : value.includes(o.id);
        return (
          <button key={o.id} className={"chip" + (active ? " is-active" : "")} onClick={() => toggle(o.id)}>
            {active && <Icon name="check" size={13} stroke={2.6} />}{o.label}
          </button>
        );
      })}
    </div>
  );
}
