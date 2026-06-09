import React from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { sumDiary, GOAL_LABEL, MEAL_LABEL } from "../lib/data.js";
import Icon from "../components/Icon.jsx";
import { PageHead, Ring, MacroBar, MacroPills, Tag, Disclaimer, DataSourceBadge } from "../components/ui.jsx";

export default function Dashboard() {
  const { profile, targets, diary, demoDay, toggleDemo, dataSource, openHow } = useApp();
  const navigate = useNavigate();
  const empty = diary.length === 0;
  const eaten = sumDiary(diary);
  const remaining = Math.max(0, Math.round(targets.calories - eaten.cal));
  const proteinLeft = Math.round(targets.protein_g - eaten.p);

  const statusItems = [];
  if (empty) {
    statusItems.push(`День ещё не начат — доступна полная норма ${Math.round(targets.calories)} ккал.`);
    statusItems.push("Добавь первый приём пищи, и прогресс начнёт считаться автоматически.");
  } else {
    statusItems.push(remaining > 0 ? `Осталось ${remaining} ккал до нормы — примерно один полноценный приём.` : "Норма по калориям на сегодня закрыта.");
    statusItems.push(proteinLeft > 12 ? `Не хватает ~${proteinLeft} г белка — добавь курицу, рыбу или творог.` : "Белок почти добран — отличный темп.");
  }

  const quick = [
    { icon: "plus", label: "Добавить еду", to: "/add", primary: true },
    { icon: "sparkle", label: "Что съесть сейчас?", to: "/recommend" },
    { icon: "plan", label: "План на день", to: "/plan" },
    { icon: "cart", label: "Список покупок", to: "/shopping" },
  ];

  return (
    <div className="fade-up">
      <PageHead
        title={profile.name ? `Привет, ${profile.name} 👋` : "Привет 👋"}
        subtitle={`Сегодня · ${new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}`}
        right={<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <DataSourceBadge source={dataSource} onClick={openHow} />
          <Tag><Icon name="target" size={14} /> {GOAL_LABEL[profile.goal]}</Tag>
        </div>}
      />

      {demoDay && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", marginBottom: 16,
          borderRadius: "var(--r-md)", background: "var(--fat-soft)", color: "#946012", fontSize: 13.5, fontWeight: 600 }}>
          <Icon name="info" size={16} /> Показан демо-день: блюда ниже — пример, а не твои реальные записи.
          <button className="btn btn-sm" style={{ marginLeft: "auto", background: "#fff", color: "#946012" }} onClick={toggleDemo}>Скрыть демо</button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 18 }}>
        <div className="card" style={{ padding: 26, display: "flex", gap: 28, alignItems: "center" }}>
          <Ring value={eaten.cal} max={targets.calories} size={188} stroke={17}>
            <div className="num" style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 40, lineHeight: 1 }}>{Math.round(eaten.cal)}</div>
            <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>из {Math.round(targets.calories)} ккал</div>
            <div className="num" style={{ marginTop: 8, padding: "4px 11px", borderRadius: 99, background: "var(--brand-softer)", color: "var(--brand-ink)", fontWeight: 700, fontSize: 12.5 }}>осталось {remaining}</div>
          </Ring>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18 }}>
            <MacroBar kind="p" value={eaten.p} target={targets.protein_g} />
            <MacroBar kind="f" value={eaten.f} target={targets.fat_g} />
            <MacroBar kind="c" value={eaten.c} target={targets.carbs_g} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="card" style={{ padding: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--brand-softer)", color: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="chart" size={18} /></div>
              <h3 style={{ fontSize: 16 }}>Итог дня</h3>
            </div>
            {statusItems.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start", marginBottom: 10, fontSize: 14, lineHeight: 1.5, color: "var(--ink-2)" }}>
                <span style={{ width: 6, height: 6, borderRadius: 99, background: "var(--brand)", marginTop: 7, flexShrink: 0 }} />{s}
              </div>
            ))}
          </div>

          <button onClick={() => navigate("/chat")} style={{ textAlign: "left", border: "none", cursor: "pointer", borderRadius: "var(--r-lg)", padding: 22, color: "#fff", background: "linear-gradient(135deg, var(--brand), #3bbf94)", boxShadow: "var(--sh-brand)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
              <Icon name="chat" size={20} />
              <span style={{ fontWeight: 800, fontSize: 16, fontFamily: "var(--font-display)", lineHeight: 1.2 }}>Спроси AI-помощника</span>
            </div>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: "rgba(255,255,255,.92)" }}>«Что съесть на ужин в рамках нормы?» — помощник ответит с учётом твоего дня.</p>
            <div style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 13.5 }}>Открыть чат <Icon name="arrowR" size={16} /></div>
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginTop: 18 }}>
        {quick.map((q) => (
          <button key={q.to} onClick={() => navigate(q.to)} className="card" style={{ padding: "20px 18px", border: "none", cursor: "pointer", textAlign: "left",
            display: "flex", flexDirection: "column", gap: 14, background: q.primary ? "var(--ink)" : "var(--surface)", color: q.primary ? "#fff" : "var(--ink)" }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: q.primary ? "rgba(255,255,255,.15)" : "var(--brand-softer)", color: q.primary ? "#fff" : "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={q.icon} size={20} /></div>
            <span style={{ fontWeight: 800, fontSize: 15, fontFamily: "var(--font-display)" }}>{q.label}</span>
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 24, marginTop: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 17 }}>Сегодня съедено · <span className="num" style={{ color: "var(--ink-3)" }}>{Math.round(eaten.cal)} / {Math.round(targets.calories)} ккал</span></h3>
          {!empty && <button className="btn btn-soft btn-sm" onClick={() => navigate("/add")}><Icon name="plus" size={15} /> Добавить</button>}
        </div>
        {empty ? (
          <div style={{ textAlign: "center", padding: "26px 0 8px" }}>
            <div style={{ width: 54, height: 54, borderRadius: 16, margin: "0 auto 16px", background: "var(--surface-sunken)", color: "var(--ink-3)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="plan" size={26} /></div>
            <div style={{ fontWeight: 800, fontSize: 16, fontFamily: "var(--font-display)" }}>Ты ещё не добавил ни одного приёма пищи сегодня</div>
            <p className="muted" style={{ fontSize: 13.5, margin: "8px auto 18px", maxWidth: 380, lineHeight: 1.5 }}>Добавь еду через фото, текст или базу — и дневной прогресс посчитается сам.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="btn btn-primary" onClick={() => navigate("/add")}><Icon name="plus" size={17} /> Добавить первый приём пищи</button>
              <button className="btn btn-ghost" onClick={toggleDemo}><Icon name="sparkle" size={16} /> Показать демо-день</button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {diary.map((e, i) => (
              <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 0", borderTop: i ? "1px solid var(--line)" : "none" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--surface-sunken)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{e.emoji || "🍽️"}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14.5, display: "flex", alignItems: "center", gap: 8 }}>
                    {e.meal_name}
                    {demoDay && <span style={{ fontSize: 10, fontWeight: 700, color: "var(--fat)", background: "var(--fat-soft)", padding: "2px 7px", borderRadius: 99 }}>демо</span>}
                  </div>
                  <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>{MEAL_LABEL[e.meal] || "Приём"} · {e.time} · {e.source}</div>
                </div>
                <MacroPills p={e.p} f={e.f} c={e.c} size="sm" />
                <div className="num" style={{ fontWeight: 800, fontSize: 15, minWidth: 76, textAlign: "right" }}>{e.cal} <span className="muted" style={{ fontSize: 12, fontWeight: 600 }}>ккал</span></div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Disclaimer style={{ marginTop: 18 }} />
    </div>
  );
}
