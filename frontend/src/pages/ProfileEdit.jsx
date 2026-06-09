import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { calcTargets } from "../api/client.js";
import { REF } from "../lib/data.js";
import Icon from "../components/Icon.jsx";
import { ChipGroup, NumField } from "../components/ui.jsx";

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 12, fontFamily: "var(--font-display)" }}>{title}</div>
      {children}
    </div>
  );
}

export default function ProfileEdit() {
  const { profile, saveProfile } = useApp();
  const navigate = useNavigate();
  const [draft, setDraft] = useState({ ...profile });
  const [saving, setSaving] = useState(false);
  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));
  const t = calcTargets(draft);

  const save = () => { setSaving(true); saveProfile(draft); setTimeout(() => navigate("/profile"), 150); };

  return (
    <div className="fade-up" style={{ maxWidth: 720, margin: "0 auto" }}>
      <button className="btn btn-quiet btn-sm" style={{ marginBottom: 14 }} onClick={() => navigate("/profile")}><Icon name="arrowL" size={16} /> Назад к профилю</button>
      <div className="card" style={{ padding: 30 }}>
        <h1 style={{ fontSize: 26 }}>Изменить профиль</h1>
        <p className="muted" style={{ fontSize: 14, margin: "8px 0 24px" }}>После сохранения дневная норма КБЖУ пересчитается автоматически.</p>

        <Section title="Имя"><input className="input" value={draft.name || ""} onChange={(e) => set({ name: e.target.value })} placeholder="Как к тебе обращаться?" /></Section>
        <Section title="Цель"><ChipGroup single options={REF.goals} value={draft.goal} set={(v) => set({ goal: v })} /></Section>
        <Section title="Темп"><ChipGroup single options={REF.pace} value={draft.pace} set={(v) => set({ pace: v })} /></Section>

        <Section title="Параметры тела">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <NumField label="Возраст" value={draft.age} set={(v) => set({ age: v })} min={10} max={120} unit="лет" />
            <div>
              <label className="field-label">Пол</label>
              <div style={{ display: "flex", gap: 8 }}>
                {[["female", "Женский"], ["male", "Мужской"]].map(([id, l]) => (
                  <button key={id} className={"chip" + (draft.sex === id ? " is-active" : "")} style={{ flex: 1, justifyContent: "center" }} onClick={() => set({ sex: id })}>{l}</button>
                ))}
              </div>
            </div>
            <NumField label="Рост" value={draft.height_cm} set={(v) => set({ height_cm: v })} min={100} max={250} unit="см" />
            <NumField label="Вес" value={draft.weight_kg} set={(v) => set({ weight_kg: v })} min={20} max={300} unit="кг" />
          </div>
        </Section>

        <Section title="Уровень активности"><ChipGroup single options={REF.activity_levels} value={draft.activity_level} set={(v) => set({ activity_level: v })} /></Section>
        <Section title="Аллергии"><ChipGroup options={REF.allergies} value={draft.allergies || []} set={(v) => set({ allergies: v })} /></Section>
        <Section title="Религиозные ограничения"><ChipGroup options={REF.religious_restrictions} value={draft.religious_restrictions || []} set={(v) => set({ religious_restrictions: v })} /></Section>
        <Section title="Пищевые предпочтения"><ChipGroup options={REF.food_preferences} value={draft.food_preferences || []} set={(v) => set({ food_preferences: v })} /></Section>
        <Section title="Нелюбимые продукты"><ChipGroup options={REF.dislikes} value={draft.dislikes || []} set={(v) => set({ dislikes: v })} /></Section>

        <Section title="Бюджет на день">
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: "var(--ink-2)" }}>Бюджет на день:</span>
            <span className="num" style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "var(--brand)" }}>{draft.budget} ₽</span>
          </div>
          <input type="range" min={100} max={5000} step={100} value={draft.budget} onChange={(e) => set({ budget: +e.target.value })} style={{ width: "100%", accentColor: "var(--brand)" }} />
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            {[300, 500, 1000, 2000, 5000].map((v) => <button key={v} className={"chip" + (draft.budget === v ? " is-active" : "")} onClick={() => set({ budget: v })}>{v} ₽</button>)}
          </div>
        </Section>
        <Section title="Время на готовку"><ChipGroup single options={REF.cook_time} value={draft.cook_time} set={(v) => set({ cook_time: v })} /></Section>
        <Section title="Кухонная техника"><ChipGroup options={REF.equipment} value={draft.equipment || []} set={(v) => set({ equipment: v })} /></Section>

        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderRadius: "var(--r-md)", background: "var(--brand-softer)", marginBottom: 22 }}>
          <Icon name="target" size={20} style={{ color: "var(--brand)" }} />
          <span style={{ fontWeight: 700, fontSize: 14, color: "var(--brand-ink)" }}>Новая норма:</span>
          <span className="num" style={{ fontWeight: 800, color: "var(--ink)" }}>{Math.round(t.calories)} ккал</span>
          <span className="num muted" style={{ fontSize: 13 }}>Б{Math.round(t.protein_g)} · Ж{Math.round(t.fat_g)} · У{Math.round(t.carbs_g)}</span>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn btn-primary btn-block btn-lg" onClick={save} disabled={saving}><Icon name="check" size={18} /> {saving ? "Сохраняю…" : "Сохранить изменения"}</button>
          <button className="btn btn-ghost btn-lg" onClick={() => navigate("/profile")}>Отменить</button>
        </div>
      </div>
    </div>
  );
}
