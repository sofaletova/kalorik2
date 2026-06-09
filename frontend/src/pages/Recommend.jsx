import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { DISHES, sumDiary } from "../lib/data.js";
import Icon from "../components/Icon.jsx";
import { PageHead, MacroPills, Disclaimer, PriceTag } from "../components/ui.jsx";

export default function Recommend() {
  const { addToPlan, targets, diary, openHow } = useApp();
  const navigate = useNavigate();
  const eaten = sumDiary(diary);
  const emptyDay = diary.length === 0;
  const remaining = Math.max(0, Math.round(targets.calories - eaten.cal));
  const proteinLeft = Math.max(0, Math.round(targets.protein_g - eaten.p));

  const base = [
    { kind: "Лучший вариант", icon: "target", accent: "var(--brand)", meal: "dinner", id: "salad",
      why: `Закрывает ~${proteinLeft} г белка ${emptyDay ? "из дневной нормы" : "из остатка"} и оставляет запас по калориям.` },
    { kind: "Быстрый вариант", icon: "bolt", accent: "var(--protein)", meal: "snack", id: "yogurt", why: "Готов за минуту, без техники — когда нет времени." },
    { kind: "Бюджетный вариант", icon: "wallet", accent: "var(--fat)", meal: "lunch", id: "buckwheat", why: "Дёшево и сытно, укладывается в дневной бюджет." },
  ];
  const [dishes, setDishes] = useState(() => base.map((b) => DISHES.find((d) => d.id === b.id)));
  const [added, setAdded] = useState({});

  const replace = (idx) => {
    const used = dishes.map((d) => d.id);
    const pool = DISHES.filter((d) => !used.includes(d.id));
    if (!pool.length) return;
    setDishes(dishes.map((d, i) => (i === idx ? pool[Math.floor(Math.random() * pool.length)] : d)));
  };
  const choose = (d, meal, idx) => { addToPlan(d, meal); setAdded({ ...added, [idx]: true }); setTimeout(() => navigate("/plan"), 550); };

  return (
    <div className="fade-up" style={{ maxWidth: 1000, margin: "0 auto" }}>
      <PageHead title="Что съесть сейчас?" subtitle={emptyDay
        ? `День ещё пустой — рекомендации построены от полной нормы ${Math.round(targets.calories)} ккал`
        : `Осталось ${remaining} ккал · подобрали 3 варианта под остаток дня`} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        {base.map((r, idx) => {
          const dish = dishes[idx];
          return (
            <div key={r.kind} className="card" style={{ padding: 22, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, color: "#fff", background: r.accent, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={r.icon} size={17} /></div>
                <span style={{ fontWeight: 800, fontSize: 13.5, color: r.accent, fontFamily: "var(--font-display)" }}>{r.kind}</span>
              </div>
              <div style={{ height: 96, borderRadius: "var(--r-md)", background: "var(--surface-sunken)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52, marginBottom: 14 }}>{dish.emoji}</div>
              <h3 style={{ fontSize: 18, marginBottom: 10 }}>{dish.name}</h3>
              <div style={{ marginBottom: 12 }}><MacroPills p={dish.p} f={dish.f} c={dish.c} size="sm" /></div>
              <div style={{ display: "flex", gap: 14, marginBottom: 8, fontSize: 13, color: "var(--ink-2)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Icon name="flame" size={15} style={{ color: "var(--cal)" }} /><b className="num">{dish.cal}</b> ккал</span>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Icon name="clock" size={15} style={{ color: "var(--ink-3)" }} /><span className="num">{dish.time}</span> мин</span>
              </div>
              <div style={{ marginBottom: 14 }}><PriceTag price={dish.price} demo size="sm" /></div>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "11px 13px", borderRadius: "var(--r-sm)", background: "var(--surface-2)", fontSize: 13, lineHeight: 1.45, color: "var(--ink-2)", marginBottom: 16, flex: 1 }}>
                <Icon name="info" size={15} style={{ color: r.accent, flexShrink: 0, marginTop: 1 }} />
                <span><b style={{ color: "var(--ink)" }}>Почему подходит:</b> {r.why}</span>
              </div>
              <button className="btn btn-primary btn-block" onClick={() => choose(dish, r.meal, idx)} disabled={added[idx]}>
                <Icon name={added[idx] ? "check" : "plus"} size={16} /> {added[idx] ? "Добавлено в план" : "Добавить в план"}
              </button>
              <div style={{ display: "flex", gap: 8, marginTop: 9 }}>
                <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => navigate("/recommend/recipe", { state: { dish } })}><Icon name="recipe" size={15} /> Рецепт</button>
                <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => replace(idx)}><Icon name="replace" size={15} /> Заменить</button>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, fontSize: 12.5, color: "var(--ink-3)", lineHeight: 1.5 }}>
        <Icon name="info" size={15} style={{ flexShrink: 0 }} />
        Стоимость ориентировочная (по демо-базе) и зависит от магазина, региона и размера порции.
        <button onClick={openHow} style={{ background: "none", border: "none", color: "var(--brand)", fontWeight: 700, cursor: "pointer", fontSize: 12.5 }}>Как мы считаем?</button>
      </div>
      <Disclaimer style={{ marginTop: 14 }} />
    </div>
  );
}
