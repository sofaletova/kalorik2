import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { DISHES } from "../lib/data.js";
import Icon from "../components/Icon.jsx";
import { PageHead, MacroPills, Tag } from "../components/ui.jsx";

const MODE_LABEL = {
  balanced: "Сбалансированный",
  quick: "Быстрый",
  protein: "Больше белка",
  simple: "Простой состав",
};

const MODE_HINT = {
  balanced: "Подходит для обычного дня: без жёстких ограничений, ближе к твоей норме.",
  quick: "Фокус на быстрых блюдах и перекусах, которые проще встроить в день.",
  protein: "Помогает добрать белок без сильного роста калорий.",
  simple: "Более простые блюда из базовых продуктов, без отдельного экрана покупок.",
};

const LACTOSE_WORDS = ["йогурт", "творог", "молоко", "сыр", "кефир", "сметан"];

function hasLactose(dishName = "") {
  const normalized = dishName.toLowerCase();
  return LACTOSE_WORDS.some((word) => normalized.includes(word));
}

function userHasLactoseRestriction(profile) {
  const values = [
    ...(profile?.allergies || []),
    ...(profile?.restrictions || []),
    ...(profile?.disliked_foods || []),
  ];

  return values.some((item) => {
    const value = String(item).toLowerCase();
    return value.includes("лакт") || value.includes("молоч");
  });
}

function filterDishesForProfile(dishes, profile) {
  let result = [...dishes];

  if (userHasLactoseRestriction(profile)) {
    result = result.filter((dish) => !hasLactose(dish.name));
  }

  return result.length ? result : dishes;
}

function scoreDishByMode(dish, mode) {
  if (mode === "quick") {
    return dish.cal <= 350 ? 3 : 1;
  }

  if (mode === "protein") {
    return dish.p * 2 - dish.cal / 100;
  }

  if (mode === "simple") {
    return dish.cal <= 450 ? 2 : 1;
  }

  return Math.abs(450 - dish.cal) * -1;
}

function pickDish(pool, usedNames, mode) {
  const available = pool.filter((dish) => !usedNames.has(dish.name));
  const source = available.length ? available : pool;

  return [...source].sort((a, b) => scoreDishByMode(b, mode) - scoreDishByMode(a, mode))[0];
}

function toPlanItem(oldItem, dish) {
  return {
    ...oldItem,
    dish: dish.name,
    emoji: dish.emoji,
    cal: dish.cal,
    p: dish.p,
    f: dish.f,
    c: dish.c,
  };
}

export default function Plan() {
  const { profile, targets, plan, setPlan } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState("balanced");

  const filteredDishes = useMemo(
    () => filterDishesForProfile(DISHES, profile),
    [profile]
  );

  const total = plan.reduce(
    (a, m) => ({
      cal: a.cal + m.cal,
      p: a.p + m.p,
      f: a.f + m.f,
      c: a.c + m.c,
    }),
    { cal: 0, p: 0, f: 0, c: 0 }
  );

  const caloriesDiff = Math.round(total.cal - targets.calories);
  const proteinDiff = Math.round(total.p - targets.protein_g);

  const planQuality = [
    Math.abs(caloriesDiff) <= 150
      ? "Калории близко к норме."
      : caloriesDiff > 0
        ? `План выше нормы примерно на ${Math.abs(caloriesDiff)} ккал.`
        : `До нормы не хватает примерно ${Math.abs(caloriesDiff)} ккал.`,
    proteinDiff >= 0
      ? "Белок закрыт или почти закрыт."
      : `Белка не хватает примерно ${Math.abs(proteinDiff)} г.`,
    userHasLactoseRestriction(profile)
      ? "Учтено ограничение: блюда с лактозой исключаются из замен."
      : "Замены подбираются из общей базы блюд.",
  ];

  const swap = (idx) => {
    const usedNames = new Set(plan.map((item, i) => (i === idx ? null : item.dish)));
    const next = pickDish(filteredDishes, usedNames, mode);

    setPlan(plan.map((m, i) => (i === idx ? toPlanItem(m, next) : m)));
  };

  const rebuildPlan = (nextMode = mode) => {
    const usedNames = new Set();

    const nextPlan = plan.map((item) => {
      const nextDish = pickDish(filteredDishes, usedNames, nextMode);
      usedNames.add(nextDish.name);
      return toPlanItem(item, nextDish);
    });

    setPlan(nextPlan);
  };

  const changeMode = (nextMode) => {
    setMode(nextMode);
    rebuildPlan(nextMode);
  };

  return (
    <div className="fade-up" style={{ maxWidth: 900, margin: "0 auto" }}>
      <PageHead
        title="План на день"
        subtitle="Собери рацион под свою норму — без отдельного списка покупок и спорных цен"
        right={
          <Tag color="var(--brand)" soft="var(--brand-softer)">
            <Icon name="plan" size={14} /> {MODE_LABEL[mode]}
          </Tag>
        }
      />

      <div
        className="card"
        style={{
          padding: 18,
          marginBottom: 16,
          display: "grid",
          gridTemplateColumns: "1.15fr .85fr",
          gap: 16,
          alignItems: "center",
        }}
      >
        <div>
          <h3 style={{ fontSize: 17, marginBottom: 8 }}>Режим плана</h3>
          <p className="muted" style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5 }}>
            {MODE_HINT[mode]}
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {Object.entries(MODE_LABEL).map(([key, label]) => (
            <button
              key={key}
              className={mode === key ? "btn btn-primary btn-sm" : "btn btn-ghost btn-sm"}
              onClick={() => changeMode(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {plan.map((m, i) => (
          <div
            key={`${m.label}-${i}`}
            className="card"
            style={{
              padding: 18,
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: 14,
                background: "var(--surface-sunken)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                flexShrink: 0,
              }}
            >
              {m.emoji}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="eyebrow" style={{ marginBottom: 4, color: "var(--ink-3)" }}>
                {m.label}
              </div>

              <div
                style={{
                  fontWeight: 800,
                  fontSize: 16,
                  fontFamily: "var(--font-display)",
                }}
              >
                {m.dish}
              </div>

              <div style={{ marginTop: 8 }}>
                <MacroPills p={m.p} f={m.f} c={m.c} size="sm" />
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div className="num" style={{ fontWeight: 800, fontSize: 18 }}>
                {Math.round(m.cal)}
              </div>
              <div className="muted" style={{ fontSize: 11.5 }}>ккал</div>

              <button
                className="btn btn-quiet btn-sm"
                style={{ marginTop: 8, padding: "6px 10px" }}
                onClick={() => swap(i)}
              >
                <Icon name="replace" size={14} /> Заменить
              </button>
            </div>
          </div>
        ))}
      </div>

      <div
        className="card"
        style={{
          padding: 20,
          marginTop: 14,
          background: "var(--ink)",
          color: "#fff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
          <div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.7)", fontWeight: 600 }}>
              Итого за день
            </div>

            <div
              className="num"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 30,
                marginTop: 2,
              }}
            >
              {Math.round(total.cal)}{" "}
              <span style={{ fontSize: 15, color: "rgba(255,255,255,.6)" }}>
                / {Math.round(targets.calories)} ккал
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 18 }}>
            {[
              ["Б", total.p],
              ["Ж", total.f],
              ["У", total.c],
            ].map(([l, v]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div className="num" style={{ fontWeight: 800, fontSize: 20 }}>
                  {Math.round(v)}
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.6)", marginTop: 2 }}>
                  {l} (г)
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="card"
        style={{
          padding: 18,
          marginTop: 14,
          background: "var(--surface-2)",
        }}
      >
        <h3 style={{ fontSize: 16, marginBottom: 10 }}>Вывод по плану</h3>

        {planQuality.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              gap: 9,
              alignItems: "flex-start",
              marginBottom: 8,
              fontSize: 13.5,
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
            {item}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
        <button className="btn btn-ghost" onClick={() => rebuildPlan()}>
          <Icon name="replace" size={17} /> Пересобрать план
        </button>

        <button className="btn btn-ghost" onClick={() => navigate("/chat")}>
          <Icon name="chat" size={17} /> Доработать через AI
        </button>

        <button className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={() => navigate("/add")}>
          <Icon name="plus" size={17} /> Добавить еду в дневник
        </button>
      </div>
    </div>
  );
}
