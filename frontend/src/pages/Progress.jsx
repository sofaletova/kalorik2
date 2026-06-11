import React from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { sumDiary } from "../lib/data.js";
import Icon from "../components/Icon.jsx";
import { PageHead, Disclaimer } from "../components/ui.jsx";

function percent(value, target) {
  if (!target || target <= 0) return 0;
  return Math.min(100, Math.round((value / target) * 100));
}

function Bar({ label, value, target, unit }) {
  const p = percent(value, target);

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 7 }}>
        <div style={{ fontWeight: 700, fontSize: 13.5 }}>{label}</div>
        <div className="num" style={{ fontSize: 13.5, color: "var(--ink-3)" }}>
          {Math.round(value)} / {Math.round(target)} {unit}
        </div>
      </div>

      <div
        style={{
          height: 9,
          borderRadius: 99,
          background: "var(--surface-sunken)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${p}%`,
            height: "100%",
            borderRadius: 99,
            background: p > 105 ? "var(--fat)" : "var(--brand)",
          }}
        />
      </div>
    </div>
  );
}

function Insight({ children }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 9,
        alignItems: "flex-start",
        marginBottom: 10,
        fontSize: 14,
        lineHeight: 1.5,
        color: "var(--ink-2)",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: 99,
          background: "var(--brand)",
          marginTop: 7,
          flexShrink: 0,
        }}
      />
      {children}
    </div>
  );
}

export default function Progress() {
  const { profile, targets, diary, demoDay, dataSource } = useApp();
  const navigate = useNavigate();

  const eaten = sumDiary(diary);
  const hasDiary = diary.length > 0;

  const caloriesPercent = percent(eaten.cal, targets.calories);
  const proteinPercent = percent(eaten.p, targets.protein_g);

  const caloriesLeft = Math.round(targets.calories - eaten.cal);
  const proteinLeft = Math.round(targets.protein_g - eaten.p);

  const insights = [];

  if (!hasDiary) {
    insights.push("Пока недостаточно данных: добавь хотя бы один приём пищи, чтобы увидеть анализ дня.");
    insights.push("Когда дневник начнёт заполняться, здесь появятся выводы по калориям, белку и балансу КБЖУ.");
  } else {
    if (caloriesLeft > 150) {
      insights.push(`До дневной нормы осталось примерно ${caloriesLeft} ккал. Можно запланировать ещё один приём пищи.`);
    } else if (caloriesLeft >= -150) {
      insights.push("По калориям ты близко к дневной норме. Это хороший ориентир для контроля питания.");
    } else {
      insights.push(`Дневная норма превышена примерно на ${Math.abs(caloriesLeft)} ккал. AI может подсказать, как мягко скорректировать следующий день.`);
    }

    if (proteinLeft > 12) {
      insights.push(`Белка пока не хватает примерно ${proteinLeft} г. Можно добавить мясо, рыбу, яйца, бобовые или безлактозный белковый вариант.`);
    } else {
      insights.push("Белок почти добран или уже закрыт. Это помогает сохранять сытость и поддерживать мышечную массу.");
    }
  }

  if (demoDay) {
    insights.push("Сейчас показан демо-день, поэтому выводы являются примером, а не реальной аналитикой пользователя.");
  }

  return (
    <div className="fade-up" style={{ maxWidth: 900, margin: "0 auto" }}>
      <PageHead
        title="Прогресс"
        subtitle="Честная аналитика по твоим реальным данным: дневник, КБЖУ и вес"
        right={
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/add")}>
            <Icon name="plus" size={15} /> Добавить еду
          </button>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 11,
                background: "var(--brand-softer)",
                color: "var(--brand)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="chart" size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: 16 }}>Сегодня</h3>
              <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>
                {hasDiary ? "Данные из дневника питания" : "Данных пока мало"}
              </div>
            </div>
          </div>

          <Bar label="Калории" value={eaten.cal} target={targets.calories} unit="ккал" />
          <Bar label="Белки" value={eaten.p} target={targets.protein_g} unit="г" />
          <Bar label="Жиры" value={eaten.f} target={targets.fat_g} unit="г" />
          <Bar label="Углеводы" value={eaten.c} target={targets.carbs_g} unit="г" />

          {!hasDiary && (
            <div
              style={{
                marginTop: 18,
                padding: 14,
                borderRadius: "var(--r-md)",
                background: "var(--surface-2)",
                color: "var(--ink-3)",
                fontSize: 13.5,
                lineHeight: 1.5,
              }}
            >
              <Icon name="info" size={15} /> Добавь еду вручную или через AI-анализ, чтобы прогресс начал считаться.
            </div>
          )}
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 11,
                background: "var(--brand-softer)",
                color: "var(--brand)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="target" size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: 16 }}>Вес и цель</h3>
              <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>
                Пока используется вес из профиля
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div
              style={{
                padding: 16,
                borderRadius: "var(--r-md)",
                background: "var(--surface-2)",
              }}
            >
              <div className="muted" style={{ fontSize: 12.5, marginBottom: 5 }}>
                Текущий вес
              </div>
              <div
                className="num"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: 26,
                }}
              >
                {profile.weight_kg || "—"}{" "}
                <span style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 600 }}>
                  кг
                </span>
              </div>
            </div>

            <div
              style={{
                padding: 16,
                borderRadius: "var(--r-md)",
                background: "var(--surface-2)",
              }}
            >
              <div className="muted" style={{ fontSize: 12.5, marginBottom: 5 }}>
                Целевой вес
              </div>
              <div
                className="num"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: 26,
                }}
              >
                {profile.target_weight_kg || "—"}{" "}
                <span style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 600 }}>
                  кг
                </span>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 16,
              padding: 14,
              borderRadius: "var(--r-md)",
              background: "var(--surface-2)",
              fontSize: 13.5,
              lineHeight: 1.5,
              color: "var(--ink-2)",
            }}
          >
            Сейчас вес берётся только из профиля. Для полноценной динамики нужно добавить отдельную функцию
            “Добавить вес сегодня” и хранить историю замеров.
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 22, marginTop: 18 }}>
        <h3 style={{ fontSize: 17, marginBottom: 14 }}>Вывод по прогрессу</h3>

        {insights.map((item, index) => (
          <Insight key={index}>{item}</Insight>
        ))}

        <div
          style={{
            marginTop: 16,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
          }}
        >
          {[
            ["Калории", `${caloriesPercent}%`, "от дневной нормы"],
            ["Белок", `${proteinPercent}%`, "от дневной нормы"],
            ["Источник", dataSource === "backend" ? "backend" : "demo", "режим данных"],
          ].map(([label, value, hint]) => (
            <div
              key={label}
              style={{
                padding: 16,
                borderRadius: "var(--r-md)",
                background: "var(--surface-2)",
              }}
            >
              <div className="muted" style={{ fontSize: 12.5, marginBottom: 4 }}>
                {label}
              </div>
              <div
                className="num"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: 24,
                }}
              >
                {value}
              </div>
              <div className="muted" style={{ fontSize: 12.2, marginTop: 3 }}>
                {hint}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="card"
        style={{
          padding: 20,
          marginTop: 18,
          display: "flex",
          alignItems: "center",
          gap: 14,
          background: "var(--brand-softer)",
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 13,
            background: "#fff",
            color: "var(--brand)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon name="chat" size={20} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 3 }}>
            Нужна рекомендация по дню?
          </div>
          <div className="muted" style={{ fontSize: 13.5, lineHeight: 1.45 }}>
            Попроси AI объяснить, как добрать белок, скорректировать калории или составить план на завтра.
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => navigate("/chat")}>
          Спросить AI
        </button>
      </div>

      <Disclaimer style={{ marginTop: 18 }} />
    </div>
  );
}
