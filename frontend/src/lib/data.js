/* ============================================================
   Reference data, labels and demo content.
   REF mirrors backend GET /references/onboarding.
   DISHES / SHOPPING / PROGRESS are demo-base content used until
   the corresponding backend tables are populated — always shown
   to the user as «демо-база», never as their real data.
   ============================================================ */

export const REF = {
  goals: [
    { id: "weight_loss", label: "Похудеть", icon: "leaf", desc: "Мягкий дефицит калорий" },
    { id: "muscle_gain", label: "Набрать массу", icon: "flame", desc: "Профицит и больше белка" },
    { id: "maintenance", label: "Поддерживать вес", icon: "scale", desc: "Баланс и стабильность" },
    { id: "quality", label: "Питаться качественнее", icon: "sparkle", desc: "Больше пользы в тарелке" },
    { id: "protein", label: "Добрать белок", icon: "egg", desc: "Фокус на белке" },
  ],
  pace: [
    { id: "soft", label: "Мягкий", desc: "~0.25 кг/нед" },
    { id: "medium", label: "Средний", desc: "~0.5 кг/нед" },
    { id: "intense", label: "Интенсивный", desc: "~0.75 кг/нед" },
  ],
  activity_levels: [
    { id: "sedentary", label: "Мало активности", desc: "Сидячий день" },
    { id: "light", label: "Лёгкая активность", desc: "1–2 трен./нед" },
    { id: "moderate", label: "Средняя активность", desc: "3–4 трен./нед" },
    { id: "active", label: "Высокая активность", desc: "5–6 трен./нед" },
    { id: "very_active", label: "Очень высокая", desc: "Каждый день" },
  ],
  allergies: [
    { id: "nuts", label: "Орехи" }, { id: "lactose", label: "Лактоза" },
    { id: "gluten", label: "Глютен" }, { id: "seafood", label: "Морепродукты" }, { id: "eggs", label: "Яйца" },
  ],
  religious_restrictions: [
    { id: "halal", label: "Халяль" }, { id: "kosher", label: "Кошер" }, { id: "hindu", label: "Индуистские" },
  ],
  food_preferences: [
    { id: "chicken", label: "Курица" }, { id: "fish", label: "Рыба" }, { id: "vegetables", label: "Овощи" },
    { id: "porridge", label: "Каши" }, { id: "soups", label: "Супы" }, { id: "asian", label: "Азиатская" },
    { id: "mediterranean", label: "Средиземноморская" }, { id: "quick_meals", label: "Быстрые блюда" },
  ],
  dislikes: [
    { id: "liver", label: "Печень" }, { id: "mushrooms", label: "Грибы" }, { id: "cilantro", label: "Кинза" },
    { id: "olives", label: "Оливки" }, { id: "cottage", label: "Творог" },
  ],
  equipment: [
    { id: "stove", label: "Плита" }, { id: "oven", label: "Духовка" }, { id: "micro", label: "Микроволновка" },
    { id: "multi", label: "Мультиварка" }, { id: "blender", label: "Блендер" }, { id: "airfry", label: "Аэрогриль" },
  ],
  cook_time: [
    { id: "t10", label: "До 10 мин" }, { id: "t20", label: "До 20 мин" },
    { id: "t40", label: "До 40 мин" }, { id: "any", label: "Не важно" },
  ],
};

export const GOAL_LABEL = {
  weight_loss: "Похудение", muscle_gain: "Набор массы", maintenance: "Поддержание веса",
  quality: "Качественное питание", protein: "Добор белка",
};
export const ACT_LABEL = {
  sedentary: "Мало активности", light: "Лёгкая активность", moderate: "Средняя активность",
  active: "Высокая активность", very_active: "Очень высокая",
};
export const SEX_LABEL = { female: "Женский", male: "Мужской" };
export const PACE_LABEL = { soft: "Мягкий", medium: "Средний", intense: "Интенсивный" };
export const COOK_LABEL = { t10: "До 10 мин", t20: "До 20 мин", t40: "До 40 мин", any: "Не важно" };
export const MEAL_LABEL = { breakfast: "Завтрак", lunch: "Обед", snack: "Перекус", dinner: "Ужин" };

// price = ориентировочная стоимость по демо-базе (₽)
export const DISHES = [
  { id: "oatmeal", name: "Овсянка с бананом", emoji: "🥣", cal: 320, p: 11, f: 7, c: 54, time: 8, price: 65 },
  { id: "buckwheat", name: "Гречка с курицей", emoji: "🍗", cal: 430, p: 38, f: 9, c: 52, time: 25, price: 130 },
  { id: "cottage", name: "Творог с ягодами", emoji: "🫐", cal: 210, p: 24, f: 5, c: 18, time: 4, price: 95 },
  { id: "omelette", name: "Омлет с овощами", emoji: "🍳", cal: 280, p: 21, f: 18, c: 7, time: 12, price: 85 },
  { id: "ricechicken", name: "Рис с курицей", emoji: "🍚", cal: 460, p: 36, f: 10, c: 56, time: 22, price: 120 },
  { id: "salad", name: "Зелёный салат с тунцом", emoji: "🥗", cal: 240, p: 26, f: 11, c: 9, time: 10, price: 150 },
  { id: "yogurt", name: "Греческий йогурт", emoji: "🥛", cal: 130, p: 15, f: 4, c: 9, time: 1, price: 70 },
  { id: "soup", name: "Куриный суп с овощами", emoji: "🍲", cal: 260, p: 22, f: 8, c: 24, time: 30, price: 110 },
];

export const DEFAULT_PROFILE = {
  name: "Анна", goal: "weight_loss", pace: "soft", sex: "female", age: 21,
  weight_kg: 50, height_cm: 160, target_weight_kg: 48, activity_level: "light",
  allergies: ["lactose"], religious_restrictions: [], food_preferences: ["chicken", "vegetables", "porridge"],
  dislikes: ["mushrooms"], budget: 1000, cook_time: "t20", equipment: ["stove", "micro", "blender"],
};

export const DEMO_DIARY = [
  { id: "d1", meal_name: "Овсянка с бананом", emoji: "🥣", time: "08:30", meal: "breakfast", cal: 320, p: 11, f: 7, c: 54, source: "Текст" },
  { id: "d2", meal_name: "Греческий йогурт", emoji: "🥛", time: "11:15", meal: "snack", cal: 130, p: 15, f: 4, c: 9, source: "База" },
  { id: "d3", meal_name: "Гречка с курицей", emoji: "🍗", time: "14:00", meal: "lunch", cal: 430, p: 38, f: 9, c: 52, source: "Фото" },
];

export const DEMO_PLAN = [
  { meal: "breakfast", label: "Завтрак", dish: "Овсянка с бананом", emoji: "🥣", cal: 320, p: 11, f: 7, c: 54 },
  { meal: "lunch", label: "Обед", dish: "Гречка с курицей", emoji: "🍗", cal: 430, p: 38, f: 9, c: 52 },
  { meal: "snack", label: "Перекус", dish: "Творог с ягодами", emoji: "🫐", cal: 210, p: 24, f: 5, c: 18 },
  { meal: "dinner", label: "Ужин", dish: "Зелёный салат с тунцом", emoji: "🥗", cal: 240, p: 26, f: 11, c: 9 },
];

export const SHOPPING = [
  { cat: "Белок", icon: "egg", items: [
    { name: "Куриное филе", qty: "400 г", price: 180 }, { name: "Тунец консерв.", qty: "1 банка", price: 120 },
    { name: "Творог 5%", qty: "200 г", price: 90 }, { name: "Яйца", qty: "6 шт", price: 70 } ] },
  { cat: "Углеводы", icon: "leaf", items: [
    { name: "Гречка", qty: "300 г", price: 60 }, { name: "Овсяные хлопья", qty: "250 г", price: 55 } ] },
  { cat: "Овощи и фрукты", icon: "sparkle", items: [
    { name: "Банан", qty: "3 шт", price: 50 }, { name: "Микс салата", qty: "1 уп", price: 110 },
    { name: "Огурцы", qty: "3 шт", price: 60 }, { name: "Ягоды (заморозка)", qty: "300 г", price: 140 } ] },
  { cat: "Дополнительно", icon: "flame", items: [
    { name: "Оливковое масло", qty: "1 шт", price: 0 }, { name: "Специи", qty: "по вкусу", price: 0 } ] },
];

export const PROGRESS = {
  weight: [50.4, 50.2, 50.3, 50.0, 49.9, 49.8, 49.7],
  calories: [1280, 1410, 1190, 1350, 1300, 1240, 880],
  days: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
};

export const labelsFor = (group, ids) =>
  (ids || []).map((id) => (REF[group].find((x) => x.id === id) || {}).label || id);

export const sumDiary = (diary) =>
  diary.reduce((a, e) => ({ cal: a.cal + e.cal, p: a.p + e.p, f: a.f + e.f, c: a.c + e.c }), { cal: 0, p: 0, f: 0, c: 0 });
