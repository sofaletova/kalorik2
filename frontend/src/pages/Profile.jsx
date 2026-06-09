import React from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { GOAL_LABEL, ACT_LABEL, SEX_LABEL, PACE_LABEL, COOK_LABEL, labelsFor } from "../lib/data.js";
import Icon from "../components/Icon.jsx";
import { PageHead, Avatar, Tag, Disclaimer } from "../components/ui.jsx";

function bmiInfo(bmi) {
  if (bmi < 18.5) return { t: "Недостаток веса", c: "var(--protein)" };
  if (bmi < 25) return { t: "Норма", c: "var(--brand)" };
  if (bmi < 30) return { t: "Избыток веса", c: "var(--fat)" };
  return { t: "Ожирение", c: "var(--danger)" };
}

export default function Profile() {
  const { profile, targets, openHow } = useApp();
  const navigate = useNavigate();
  const bmi = profile.weight_kg / Math.pow(profile.height_cm / 100, 2);
  const bi = bmiInfo(bmi);

  const facts = [
    { label: "Цель", value: GOAL_LABEL[profile.goal], icon: "target" },
    { label: "Темп", value: PACE_LABEL[profile.pace] || "—", icon: "bolt" },
    { label: "Возраст", value: profile.age + " лет", icon: "user" },
    { label: "Пол", value: SEX_LABEL[profile.sex], icon: "user" },
    { label: "Рост", value: profile.height_cm + " см", icon: "ruler" },
    { label: "Вес", value: profile.weight_kg + " кг", icon: "scale" },
    { label: "Активность", value: ACT_LABEL[profile.activity_level], icon: "flame" },
    { label: "Целевой вес", value: (profile.target_weight_kg || profile.weight_kg) + " кг", icon: "target" },
    { label: "Бюджет в день", value: (profile.budget || 1000) + " ₽", icon: "wallet" },
    { label: "Время на готовку", value: COOK_LABEL[profile.cook_time] || "—", icon: "clock" },
  ];

  const Block = ({ title, items, empty }) => (
    <div style={{ marginBottom: 18 }}>
      <div className="field-label">{title}</div>
      {items.length ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{items.map((l) => <Tag key={l} color="var(--ink-2)" soft="var(--surface-sunken)">{l}</Tag>)}</div>
      ) : <span className="muted" style={{ fontSize: 13.5 }}>{empty}</span>}
    </div>
  );

  return (
    <div className="fade-up" style={{ maxWidth: 880, margin: "0 auto" }}>
      <PageHead title="Профиль" subtitle="Эти данные используются для расчёта нормы и рекомендаций" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 18 }}>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
            <Avatar name={profile.name || "Г"} size={58} />
            <div>
              <h2 style={{ fontSize: 22 }}>{profile.name || "Без имени"}</h2>
              <div style={{ marginTop: 6 }}><Tag><Icon name="target" size={13} /> {GOAL_LABEL[profile.goal]}</Tag></div>
            </div>
          </div>

          <div style={{ padding: 18, borderRadius: "var(--r-md)", background: "var(--surface-2)", border: "1px solid var(--line)", marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: "var(--ink-2)" }}>Индекс массы тела</span>
              <Tag color={bi.c} soft="var(--surface-sunken)">{bi.t}</Tag>
            </div>
            <div className="num" style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 34, color: bi.c }}>{bmi.toFixed(1)}</div>
            <div style={{ position: "relative", height: 7, borderRadius: 99, marginTop: 12, background: "linear-gradient(90deg, var(--protein), var(--brand) 40%, var(--fat) 75%, var(--danger))" }}>
              <div style={{ position: "absolute", top: -3, width: 13, height: 13, borderRadius: 99, background: "#fff", border: "2.5px solid " + bi.c, transform: "translateX(-50%)", left: Math.max(3, Math.min(97, ((bmi - 15) / 20) * 100)) + "%" }} />
            </div>
          </div>

          <div style={{ padding: 16, borderRadius: "var(--r-md)", background: "linear-gradient(140deg, var(--brand), #43c99d)", color: "#fff", marginBottom: 18 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: "rgba(255,255,255,.85)", marginBottom: 6 }}>Дневная норма</div>
            <div className="num" style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 30, lineHeight: 1 }}>{Math.round(targets.calories)} <span style={{ fontSize: 14, opacity: .8 }}>ккал</span></div>
            <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
              {[["Б", targets.protein_g], ["Ж", targets.fat_g], ["У", targets.carbs_g]].map(([l, v]) => (
                <div key={l}><span className="num" style={{ fontWeight: 800, fontSize: 16 }}>{Math.round(v)}</span><span style={{ fontSize: 11, opacity: .8 }}> {l} (г)</span></div>
              ))}
            </div>
          </div>

          <button className="btn btn-primary btn-block" onClick={() => navigate("/profile/edit")}><Icon name="edit" size={16} /> Изменить профиль</button>
          <button className="btn btn-quiet btn-block btn-sm" style={{ marginTop: 8, color: "var(--brand)" }} onClick={openHow}><Icon name="info" size={14} /> Как мы считаем?</button>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 22 }}>
            {facts.map((f) => (
              <div key={f.label} style={{ display: "flex", gap: 11, alignItems: "center", padding: 12, borderRadius: "var(--r-sm)", background: "var(--surface-2)" }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: "#fff", color: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name={f.icon} size={17} /></div>
                <div style={{ minWidth: 0 }}>
                  <div className="muted" style={{ fontSize: 11.5 }}>{f.label}</div>
                  <div style={{ fontWeight: 800, fontSize: 14.5 }}>{f.value}</div>
                </div>
              </div>
            ))}
          </div>
          <Block title="Аллергии" items={labelsFor("allergies", profile.allergies)} empty="Не указаны" />
          <Block title="Ограничения" items={labelsFor("religious_restrictions", profile.religious_restrictions)} empty="Нет" />
          <Block title="Любимые продукты" items={labelsFor("food_preferences", profile.food_preferences)} empty="Не указаны" />
          <Block title="Нелюбимые продукты" items={labelsFor("dislikes", profile.dislikes)} empty="Нет" />
          <Block title="Кухонная техника" items={labelsFor("equipment", profile.equipment)} empty="Не указана" />
        </div>
      </div>
      <Disclaimer style={{ marginTop: 18 }} />
    </div>
  );
}
