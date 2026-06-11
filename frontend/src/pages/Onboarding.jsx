import React, { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { calcTargets } from "../api/client.js";
import { REF, DEFAULT_PROFILE } from "../lib/data.js";
import Icon from "../components/Icon.jsx";
import {
  Brand,
  StepDots,
  Tag,
  Disclaimer,
  ChipGroup,
  MACRO_META,
} from "../components/ui.jsx";

const GOALS_WITH_PACE = ["weight_loss", "muscle_gain"];

function shouldShowPace(goal) {
  return GOALS_WITH_PACE.includes(goal);
}

function clampNumber(value, min, max) {
  const n = Number(value);

  if (!Number.isFinite(n)) {
    return min;
  }

  return Math.min(max, Math.max(min, n));
}

function EditableNumField({ label, value, set, min, max, unit, step = 1 }) {
  const [draftValue, setDraftValue] = useState(String(value ?? ""));

  const commit = (raw) => {
    const next = clampNumber(raw, min, max);
    set(next);
    setDraftValue(String(next));
  };

  const changeBy = (delta) => {
    const next = clampNumber(Number(value || 0) + delta, min, max);
    set(next);
    setDraftValue(String(next));
  };

  return (
    <div>
      <label className="field-label">{label}</label>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "46px 1fr 46px",
          gap: 9,
          alignItems: "center",
        }}
      >
        <button
          type="button"
          onClick={() => changeBy(-step)}
          style={{
            height: 46,
            borderRadius: 999,
            border: "1px solid var(--line)",
            background: "var(--surface)",
            cursor: "pointer",
            fontWeight: 800,
            fontSize: 20,
            color: "var(--ink-2)",
          }}
        >
          −
        </button>

        <div
          style={{
            position: "relative",
          }}
        >
          <input
            className="input"
            type="number"
            min={min}
            max={max}
            step={step}
            value={draftValue}
            onChange={(e) => setDraftValue(e.target.value)}
            onBlur={() => commit(draftValue)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                commit(draftValue);
                e.currentTarget.blur();
              }
            }}
            style={{
              textAlign: "center",
              fontSize: 20,
              fontWeight: 800,
              paddingRight: 48,
              fontFamily: "var(--font-display)",
            }}
          />

          <span
            style={{
              position: "absolute",
              right: 16,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--ink-3)",
              fontSize: 13,
              fontWeight: 700,
              pointerEvents: "none",
            }}
          >
            {unit}
          </span>
        </div>

        <button
          type="button"
          onClick={() => changeBy(step)}
          style={{
            height: 46,
            borderRadius: 999,
            border: "1px solid var(--line)",
            background: "var(--surface)",
            cursor: "pointer",
            fontWeight: 800,
            fontSize: 20,
            color: "var(--ink-2)",
          }}
        >
          +
        </button>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={clampNumber(value, min, max)}
        onChange={(e) => {
          const next = Number(e.target.value);
          set(next);
          setDraftValue(String(next));
        }}
        style={{
          width: "100%",
          marginTop: 10,
          accentColor: "var(--brand)",
        }}
      />
    </div>
  );
}

function OnbCard({ step, wide, children }) {
  return (
    <div
      style={{
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
      }}
    >
      <div className="fade-up" style={{ width: "100%", maxWidth: wide ? 620 : 480 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 26,
          }}
        >
          <Brand size={0.85} />
          <StepDots step={step} total={4} />
        </div>
        <div className="card" style={{ padding: wide ? 32 : 30 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function NavRow({ onBack, onNext, nextLabel = "Продолжить" }) {
  return (
    <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
      <button className="btn btn-ghost btn-lg" onClick={onBack}>
        <Icon name="arrowL" size={18} />
      </button>
      <button className="btn btn-primary btn-block btn-lg" onClick={onNext}>
        {nextLabel} <Icon name="arrowR" size={18} />
      </button>
    </div>
  );
}

function BeforeAfter() {
  return (
    <div className="card" style={{ padding: 22 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        <Tag color="var(--danger)" soft="var(--danger-soft)">
          Без приложения
        </Tag>
        <span style={{ alignSelf: "center", color: "var(--ink-4)" }}>→</span>
        <Tag>С КАЛОРИКом</Tag>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div
          style={{
            borderRadius: "var(--r-md)",
            border: "1.5px solid var(--line)",
            padding: 16,
            background: "var(--surface-2)",
          }}
        >
          <div
            style={{
              fontWeight: 800,
              fontSize: 13.5,
              color: "var(--danger)",
              marginBottom: 12,
              fontFamily: "var(--font-display)",
            }}
          >
            Раньше
          </div>

          {[
            "Считаю калории в заметках",
            "Гуглю КБЖУ каждого блюда",
            "Не знаю, что съесть на ужин",
            "Срываюсь к вечеру",
          ].map((t, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
                fontSize: 13,
                color: "var(--ink-2)",
                marginBottom: 9,
                lineHeight: 1.35,
              }}
            >
              <Icon
                name="close"
                size={14}
                stroke={2.4}
                style={{
                  color: "var(--danger)",
                  flexShrink: 0,
                  marginTop: 2,
                }}
              />
              {t}
            </div>
          ))}
        </div>

        <div
          style={{
            borderRadius: "var(--r-md)",
            border: "1.5px solid var(--brand-soft)",
            padding: 16,
            background: "linear-gradient(180deg, var(--brand-softer), #fff)",
          }}
        >
          <div
            style={{
              fontWeight: 800,
              fontSize: 13.5,
              color: "var(--brand-ink)",
              marginBottom: 12,
              fontFamily: "var(--font-display)",
            }}
          >
            Сейчас
          </div>

          {[
            "Добавляю еду за пару тапов",
            "КБЖУ считается автоматически",
            "AI подсказывает следующий приём",
            "Спокойно укладываюсь в норму",
          ].map((t, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
                fontSize: 13,
                color: "var(--ink)",
                marginBottom: 9,
                lineHeight: 1.35,
              }}
            >
              <Icon
                name="check"
                size={14}
                stroke={2.6}
                style={{
                  color: "var(--brand)",
                  flexShrink: 0,
                  marginTop: 2,
                }}
              />
              {t}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StartScreen({ onStart }) {
  const benefits = [
    {
      icon: "target",
      title: "Рассчитаем норму",
      text: "КБЖУ под твою цель, вес и активность",
    },
    {
      icon: "camera",
      title: "Оценим съеденное",
      text: "Фото, текст или база — добавь за секунды",
    },
    {
      icon: "sparkle",
      title: "Подскажем, что съесть",
      text: "AI смотрит на день и предлагает дальше",
    },
  ];

  return (
    <div className="fade-up" style={{ maxWidth: 1080, margin: "0 auto", padding: "40px 28px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 56,
        }}
      >
        <Brand />
        <button className="btn btn-quiet btn-sm" onClick={onStart}>
          Войти
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.05fr 0.95fr",
          gap: 48,
          alignItems: "center",
        }}
      >
        <div>
          <div className="eyebrow" style={{ marginBottom: 16 }}>
            AI-помощник по ежедневному выбору питания
          </div>

          <h1 style={{ fontSize: 52, lineHeight: 1.04, letterSpacing: "-0.03em" }}>
            Ешь спокойно.
            <br />
            Остальное берём
            <br />
            <span style={{ color: "var(--brand)" }}>на себя.</span>
          </h1>

          <p
            style={{
              fontSize: 18,
              lineHeight: 1.55,
              color: "var(--ink-2)",
              margin: "22px 0 32px",
              maxWidth: 440,
            }}
          >
            Рассчитаем твою норму, оценим каждый приём пищи и подскажем, что лучше
            съесть дальше — без таблиц и подсчётов в уме.
          </p>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button className="btn btn-primary btn-lg" onClick={onStart}>
              Начать <Icon name="arrowR" size={19} />
            </button>
            <span className="muted" style={{ fontSize: 14 }}>
              2 минуты на настройку
            </span>
          </div>

          <div style={{ display: "flex", gap: 26, marginTop: 44 }}>
            {benefits.map((b) => (
              <div key={b.title} style={{ flex: 1 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: "var(--brand-softer)",
                    color: "var(--brand)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  <Icon name={b.icon} size={21} />
                </div>

                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 15,
                    fontFamily: "var(--font-display)",
                    marginBottom: 4,
                  }}
                >
                  {b.title}
                </div>

                <div className="muted" style={{ fontSize: 13.5, lineHeight: 1.45 }}>
                  {b.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        <BeforeAfter />
      </div>

      <Disclaimer style={{ marginTop: 48, maxWidth: 560 }} />
    </div>
  );
}

function NameScreen({ draft, set, onNext, onSkip }) {
  return (
    <OnbCard step={0}>
      <h1 style={{ fontSize: 30 }}>Как к тебе обращаться?</h1>
      <p className="muted" style={{ fontSize: 15, margin: "10px 0 26px" }}>
        Будем называть тебя по имени — так теплее. Можно пропустить.
      </p>

      <input
        className="input"
        autoFocus
        placeholder="Например, Анна"
        value={draft.name}
        onChange={(e) => set({ name: e.target.value })}
        onKeyDown={(e) => e.key === "Enter" && onNext()}
        style={{ fontSize: 17, padding: "16px 18px" }}
      />

      <div style={{ display: "flex", gap: 12, marginTop: 26 }}>
        <button className="btn btn-primary btn-block btn-lg" onClick={onNext}>
          Продолжить <Icon name="arrowR" size={18} />
        </button>
        <button className="btn btn-ghost btn-lg" onClick={onSkip}>
          Пропустить
        </button>
      </div>
    </OnbCard>
  );
}

function GoalScreen({ draft, set, onNext, onBack }) {
  const showPace = shouldShowPace(draft.goal);

  return (
    <OnbCard step={1} wide>
      <h1 style={{ fontSize: 30 }}>Какая у тебя цель?</h1>
      <p className="muted" style={{ fontSize: 15, margin: "10px 0 24px" }}>
        Это поможет точнее рассчитать норму.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {REF.goals.map((g) => {
          const active = draft.goal === g.id;

          return (
            <button
              key={g.id}
              onClick={() => set({ goal: g.id })}
              style={{
                textAlign: "left",
                padding: "16px 18px",
                borderRadius: "var(--r-md)",
                cursor: "pointer",
                border: "2px solid " + (active ? "var(--brand)" : "var(--line)"),
                background: active ? "var(--brand-softer)" : "var(--surface)",
                display: "flex",
                gap: 13,
                alignItems: "center",
                transition: "all .15s ease",
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 11,
                  flexShrink: 0,
                  background: active ? "var(--brand)" : "var(--surface-sunken)",
                  color: active ? "#fff" : "var(--ink-3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name={g.icon} size={21} />
              </div>

              <div>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 15.5,
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {g.label}
                </div>
                <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>
                  {g.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {showPace ? (
        <>
          <div
            style={{
              fontWeight: 800,
              fontSize: 15,
              margin: "26px 0 12px",
              fontFamily: "var(--font-display)",
            }}
          >
            Темп
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            {REF.pace.map((p) => {
              const active = draft.pace === p.id;

              return (
                <button
                  key={p.id}
                  onClick={() => set({ pace: p.id })}
                  style={{
                    flex: 1,
                    padding: "13px 10px",
                    borderRadius: "var(--r-sm)",
                    cursor: "pointer",
                    border: "2px solid " + (active ? "var(--brand)" : "var(--line)"),
                    background: active ? "var(--brand-softer)" : "var(--surface)",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: 14.5 }}>{p.label}</div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 3 }}>
                    {p.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div
          style={{
            marginTop: 22,
            padding: "13px 15px",
            borderRadius: "var(--r-sm)",
            background: "var(--surface-2)",
            color: "var(--ink-3)",
            fontSize: 13.5,
            lineHeight: 1.45,
          }}
        >
          Для этой цели темп изменения веса не нужен — КАЛОРИК рассчитает норму для
          стабильного режима питания.
        </div>
      )}

      <NavRow onBack={onBack} onNext={onNext} />
    </OnbCard>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div
        style={{
          fontWeight: 800,
          fontSize: 14.5,
          marginBottom: 12,
          fontFamily: "var(--font-display)",
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function QuizScreen({ draft, set, onNext, onBack }) {
  return (
    <OnbCard step={2} wide>
      <h1 style={{ fontSize: 28 }}>Расскажи о себе</h1>

      <p className="muted" style={{ fontSize: 14.5, margin: "9px 0 24px" }}>
        Чем точнее данные — тем точнее норма. Поля заполнены демо-профилем —
        измени под себя.
      </p>

      <Section title="Параметры тела">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <EditableNumField
            label="Возраст"
            value={draft.age}
            set={(v) => set({ age: v })}
            min={10}
            max={120}
            unit="лет"
          />

          <div>
            <label className="field-label">Пол</label>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                ["female", "Женский"],
                ["male", "Мужской"],
              ].map(([id, l]) => (
                <button
                  key={id}
                  className={"chip" + (draft.sex === id ? " is-active" : "")}
                  style={{ flex: 1, justifyContent: "center" }}
                  onClick={() => set({ sex: id })}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <EditableNumField
            label="Рост"
            value={draft.height_cm}
            set={(v) => set({ height_cm: v })}
            min={100}
            max={250}
            unit="см"
          />

          <EditableNumField
            label="Вес"
            value={draft.weight_kg}
            set={(v) => set({ weight_kg: v })}
            min={20}
            max={300}
            unit="кг"
          />
        </div>
      </Section>

      <Section title="Уровень активности">
        <ChipGroup
          single
          options={REF.activity_levels}
          value={draft.activity_level}
          set={(v) => set({ activity_level: v })}
        />
      </Section>

      <Section title="Аллергии">
        <ChipGroup
          options={REF.allergies}
          value={draft.allergies}
          set={(v) => set({ allergies: v })}
        />
      </Section>

      <Section title="Религиозные ограничения">
        <ChipGroup
          options={REF.religious_restrictions}
          value={draft.religious_restrictions}
          set={(v) => set({ religious_restrictions: v })}
        />
      </Section>

      <Section title="Пищевые предпочтения">
        <ChipGroup
          options={REF.food_preferences}
          value={draft.food_preferences}
          set={(v) => set({ food_preferences: v })}
        />
      </Section>

      <Section title="Нелюбимые продукты">
        <ChipGroup
          options={REF.dislikes}
          value={draft.dislikes}
          set={(v) => set({ dislikes: v })}
        />
      </Section>

      <Section title="Бюджет на день">
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: "var(--ink-2)" }}>
            Бюджет на день:
          </span>
          <span
            className="num"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 22,
              color: "var(--brand)",
            }}
          >
            {draft.budget} ₽
          </span>
        </div>

        <input
          type="range"
          min={100}
          max={5000}
          step={100}
          value={draft.budget}
          onChange={(e) => set({ budget: +e.target.value })}
          style={{ width: "100%", accentColor: "var(--brand)" }}
        />

        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          {[300, 500, 1000, 2000, 5000].map((v) => (
            <button
              key={v}
              className={"chip" + (draft.budget === v ? " is-active" : "")}
              onClick={() => set({ budget: v })}
            >
              {v} ₽
            </button>
          ))}
        </div>
      </Section>

      <Section title="Время на готовку">
        <ChipGroup
          single
          options={REF.cook_time}
          value={draft.cook_time}
          set={(v) => set({ cook_time: v })}
        />
      </Section>

      <Section title="Кухонная техника">
        <ChipGroup
          options={REF.equipment}
          value={draft.equipment}
          set={(v) => set({ equipment: v })}
        />
      </Section>

      <NavRow onBack={onBack} onNext={onNext} nextLabel="Рассчитать норму" />
    </OnbCard>
  );
}

function TargetsScreen({ draft, onDone, onBack, onHow }) {
  const t = calcTargets(draft);

  const cards = [
    { k: "cal", val: t.calories, label: "Калории", unit: "ккал", icon: "flame" },
    { k: "p", val: t.protein_g, label: "Белки", unit: "г", icon: "egg" },
    { k: "f", val: t.fat_g, label: "Жиры", unit: "г", icon: "sparkle" },
    { k: "c", val: t.carbs_g, label: "Углеводы", unit: "г", icon: "leaf" },
  ];

  return (
    <OnbCard step={3} wide>
      <div style={{ textAlign: "center", marginBottom: 6 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            margin: "0 auto 16px",
            background: "var(--brand-softer)",
            color: "var(--brand)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="target" size={28} />
        </div>

        <h1 style={{ fontSize: 28 }}>
          {draft.name ? draft.name + ", т" : "Т"}воя персональная норма
        </h1>

        <p className="muted" style={{ fontSize: 14.5, margin: "10px auto 0", maxWidth: 420 }}>
          Рассчитана по формуле Миффлина–Сан Жеора с учётом цели и активности.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          margin: "24px 0 16px",
        }}
      >
        {cards.map((c) => {
          const m = MACRO_META[c.k];

          return (
            <div
              key={c.k}
              style={{
                padding: "18px 20px",
                borderRadius: "var(--r-md)",
                background:
                  c.k === "cal"
                    ? "linear-gradient(140deg, var(--brand), #43c99d)"
                    : "var(--surface-2)",
                border:
                  "1.5px solid " + (c.k === "cal" ? "transparent" : "var(--line)"),
                color: c.k === "cal" ? "#fff" : "var(--ink)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 12,
                  color: c.k === "cal" ? "rgba(255,255,255,.9)" : m.color,
                }}
              >
                <Icon name={c.icon} size={18} />
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 13.5,
                    color: c.k === "cal" ? "rgba(255,255,255,.9)" : "var(--ink-2)",
                  }}
                >
                  {c.label}
                </span>
              </div>

              <div
                className="num"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: 36,
                  lineHeight: 1,
                }}
              >
                {c.val}
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    marginLeft: 4,
                    opacity: 0.7,
                  }}
                >
                  {c.unit}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          gap: 16,
          padding: "12px 16px",
          borderRadius: "var(--r-sm)",
          background: "var(--surface-sunken)",
          fontSize: 12.5,
          color: "var(--ink-3)",
        }}
      >
        <span>
          BMR:{" "}
          <b className="num" style={{ color: "var(--ink-2)" }}>
            {Math.round(t.bmr)}
          </b>{" "}
          ккал
        </span>

        <span>
          TDEE:{" "}
          <b className="num" style={{ color: "var(--ink-2)" }}>
            {Math.round(t.tdee)}
          </b>{" "}
          ккал
        </span>
      </div>

      <p className="muted" style={{ fontSize: 12.5, lineHeight: 1.5, marginTop: 12 }}>
        Это ориентировочная норма. Прислушивайся к самочувствию и при необходимости
        скорректируй с врачом.{" "}
        <button
          onClick={onHow}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            color: "var(--brand)",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: 12.5,
          }}
        >
          Как мы считаем?
        </button>
      </p>

      <NavRow onBack={onBack} onNext={onDone} nextLabel="Перейти к дню" />
    </OnbCard>
  );
}

export default function Onboarding() {
  const { finishOnboarding, openHow } = useApp();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState({ ...DEFAULT_PROFILE });

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));

  if (step === 0) return <StartScreen onStart={() => setStep(1)} />;

  if (step === 1) {
    return (
      <NameScreen
        draft={draft}
        set={set}
        onNext={() => setStep(2)}
        onSkip={() => {
          set({ name: "" });
          setStep(2);
        }}
      />
    );
  }

  if (step === 2) {
    return (
      <GoalScreen
        draft={draft}
        set={set}
        onNext={() => setStep(3)}
        onBack={() => setStep(1)}
      />
    );
  }

  if (step === 3) {
    return (
      <QuizScreen
        draft={draft}
        set={set}
        onNext={() => setStep(4)}
        onBack={() => setStep(2)}
      />
    );
  }

  return (
    <TargetsScreen
      draft={draft}
      onBack={() => setStep(3)}
      onDone={() => finishOnboarding(draft)}
      onHow={openHow}
    />
  );
}
