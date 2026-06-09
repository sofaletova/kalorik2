import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { api, calcTargets, getActiveProfileId, setActiveProfileId } from "../api/client.js";
import { DEFAULT_PROFILE, DEMO_DIARY, DEMO_PLAN } from "../lib/data.js";

const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

const STORE = "kalorik_state_v1";
const todayStr = () => new Date().toISOString().slice(0, 10);

function mapServerProfile(sp, local) {
  return { ...local, name: sp.name ?? local.name, goal: sp.goal, sex: sp.sex,
    activity_level: sp.activity_level, age: sp.age, weight_kg: sp.weight_kg, height_cm: sp.height_cm,
    target_weight_kg: sp.target_weight_kg ?? local.target_weight_kg,
    allergies: sp.allergies || [], religious_restrictions: sp.religious_restrictions || [],
    food_preferences: sp.food_preferences || [] };
}
function mapServerDiary(list) {
  return (list || []).map((e) => ({
    id: e.id, meal_name: e.meal_name, cal: e.calories, p: e.protein_g, f: e.fat_g, c: e.carbs_g,
    source: e.source || "backend", meal: "snack",
    time: e.created_at ? new Date(e.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }) : "",
  }));
}

export function AppProvider({ children }) {
  const boot = (() => {
    try { return JSON.parse(localStorage.getItem(STORE) || "{}"); } catch (e) { return {}; }
  })();

  const [onboarded, setOnboarded] = useState(boot.onboarded || false);
  const [profile, setProfile] = useState(boot.profile || { ...DEFAULT_PROFILE });
  const [diary, setDiary] = useState(boot.diary || []);
  const [demoDay, setDemoDay] = useState(boot.demoDay || false);
  const [plan, setPlan] = useState(boot.plan || DEMO_PLAN);
  const [profileId, setProfileId] = useState(boot.profileId || getActiveProfileId());
  const [serverTargets, setServerTargets] = useState(null);
  const [dataSource, setDataSource] = useState("checking"); // checking | backend | demo
  const [howOpen, setHowOpen] = useState(false);

  const targets = useMemo(() => serverTargets || calcTargets(profile), [serverTargets, profile]);

  useEffect(() => {
    localStorage.setItem(STORE, JSON.stringify({ onboarded, profile, diary, demoDay, plan, profileId }));
  }, [onboarded, profile, diary, demoDay, plan, profileId]);

  const syncBackend = useCallback(() => {
    setDataSource("checking");
    Promise.all([api.getProfile(profileId), api.getNutritionTargets(profileId), api.getDiary(todayStr(), profileId)])
      .then(([sp, st, sd]) => {
        if (sp) setProfile((p) => mapServerProfile(sp, p));
        if (st) setServerTargets(st);
        if (sd) { setDiary(mapServerDiary(sd.entries || sd)); setDemoDay(false); }
        setDataSource("backend");
      })
      .catch(() => { setServerTargets(null); setDataSource("demo"); });
  }, [profileId]);

  useEffect(() => { if (onboarded) syncBackend(); }, [onboarded, syncBackend]);

  const addDiary = (entry) => setDiary((d) => [...d, entry]);
  const addToPlan = (dish, meal = "snack") => setPlan((p) => [...p, {
    meal, label: { breakfast: "Завтрак", lunch: "Обед", snack: "Перекус", dinner: "Ужин" }[meal],
    dish: dish.name, emoji: dish.emoji, cal: dish.cal, p: dish.p, f: dish.f, c: dish.c }]);
  const toggleDemo = () => {
    if (demoDay) { setDemoDay(false); setDiary([]); }
    else { setDemoDay(true); setDiary(DEMO_DIARY); }
  };

  const finishOnboarding = (draft) => {
    setProfile(draft); setDiary([]); setDemoDay(false); setOnboarded(true);
    api.createProfile({
      name: draft.name || null, goal: draft.goal, sex: draft.sex, activity_level: draft.activity_level,
      age: +draft.age, weight_kg: +draft.weight_kg, height_cm: +draft.height_cm,
      target_weight_kg: draft.target_weight_kg ? +draft.target_weight_kg : null,
      allergies: draft.allergies || [], religious_restrictions: draft.religious_restrictions || [],
      food_preferences: draft.food_preferences || [],
    }).then((created) => {
      setActiveProfileId(created.id);
      setProfileId(created.id);
    }).catch(() => {});
  };
  const resetOnboarding = () => setOnboarded(false);

  const saveProfile = (draft) => {
    setProfile(draft);
    api.updateProfile({
      name: draft.name || null, goal: draft.goal, sex: draft.sex, activity_level: draft.activity_level,
      age: +draft.age, weight_kg: +draft.weight_kg, height_cm: +draft.height_cm,
      target_weight_kg: draft.target_weight_kg ? +draft.target_weight_kg : null,
      allergies: draft.allergies || [], religious_restrictions: draft.religious_restrictions || [],
      food_preferences: draft.food_preferences || [],
    }, profileId).catch(() => {});
  };

  const value = {
    onboarded, profile, targets, diary, demoDay, plan, dataSource, profileId,
    howOpen, openHow: () => setHowOpen(true), closeHow: () => setHowOpen(false),
    setProfile, setPlan, addDiary, addToPlan, toggleDemo, syncBackend,
    finishOnboarding, resetOnboarding, saveProfile,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
