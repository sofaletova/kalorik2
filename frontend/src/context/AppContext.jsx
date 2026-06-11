import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  api,
  calcTargets,
  getActiveProfileId,
  setActiveProfileId,
} from "../api/client.js";
import { DEFAULT_PROFILE, DEMO_DIARY, DEMO_PLAN } from "../lib/data.js";

const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

const STORE = "kalorik_state_v1";
const todayStr = () => new Date().toISOString().slice(0, 10);

function safeReadStore() {
  try {
    return JSON.parse(localStorage.getItem(STORE) || "{}");
  } catch (e) {
    return {};
  }
}

function isProfileNotFoundError(error) {
  const message = String(error?.message || error || "").toLowerCase();

  return (
    message.includes("profile not found") ||
    message.includes("user profile not found") ||
    message.includes("профиль не найден") ||
    message.includes("404")
  );
}

function buildProfilePayload(draft) {
  return {
    name: draft.name || null,
    goal: draft.goal,
    sex: draft.sex,
    activity_level: draft.activity_level,
    age: +draft.age,
    weight_kg: +draft.weight_kg,
    height_cm: +draft.height_cm,
    target_weight_kg: draft.target_weight_kg ? +draft.target_weight_kg : null,
    allergies: draft.allergies || [],
    religious_restrictions: draft.religious_restrictions || [],
    food_preferences: draft.food_preferences || [],
  };
}

function mapServerProfile(sp, local) {
  return {
    ...local,
    name: sp.name ?? local.name,
    goal: sp.goal,
    sex: sp.sex,
    activity_level: sp.activity_level,
    age: sp.age,
    weight_kg: sp.weight_kg,
    height_cm: sp.height_cm,
    target_weight_kg: sp.target_weight_kg ?? local.target_weight_kg,
    allergies: sp.allergies || [],
    religious_restrictions: sp.religious_restrictions || [],
    food_preferences: sp.food_preferences || [],
  };
}

function mapServerDiary(list) {
  return (list || []).map((e) => ({
    id: e.id,
    meal_name: e.meal_name,
    cal: e.calories,
    p: e.protein_g,
    f: e.fat_g,
    c: e.carbs_g,
    source: e.source || "backend",
    meal: e.meal || "snack",
    time: e.created_at
      ? new Date(e.created_at).toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "",
  }));
}

export function AppProvider({ children }) {
  const [boot] = useState(() => safeReadStore());

  const [onboarded, setOnboarded] = useState(boot.onboarded || false);
  const [profile, setProfile] = useState(boot.profile || { ...DEFAULT_PROFILE });
  const [diary, setDiary] = useState(boot.diary || []);
  const [demoDay, setDemoDay] = useState(boot.demoDay || false);
  const [plan, setPlan] = useState(boot.plan || DEMO_PLAN);
  const [profileId, setProfileId] = useState(boot.profileId || getActiveProfileId());
  const [serverTargets, setServerTargets] = useState(null);
  const [dataSource, setDataSource] = useState("checking"); // checking | backend | demo
  const [howOpen, setHowOpen] = useState(false);

  const profileRef = useRef(profile);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  const targets = useMemo(
    () => serverTargets || calcTargets(profile),
    [serverTargets, profile]
  );

  useEffect(() => {
    localStorage.setItem(
      STORE,
      JSON.stringify({
        onboarded,
        profile,
        diary,
        demoDay,
        plan,
        profileId,
      })
    );
  }, [onboarded, profile, diary, demoDay, plan, profileId]);

  const createProfileOnBackend = useCallback(async (draft) => {
    const created = await api.createProfile(buildProfilePayload(draft));

    setActiveProfileId(created.id);
    setProfileId(created.id);

    return created.id;
  }, []);

  const loadBackendData = useCallback(
    async (id) => {
      const sp = await api.getProfile(id);

      if (sp) {
        setProfile((p) => mapServerProfile(sp, p));
      }

      const [targetsResult, diaryResult] = await Promise.allSettled([
        api.getNutritionTargets(id),
        api.getDiary(todayStr(), id),
      ]);

      if (targetsResult.status === "fulfilled" && targetsResult.value) {
        setServerTargets(targetsResult.value);
      } else {
        setServerTargets(null);
      }

      if (diaryResult.status === "fulfilled" && diaryResult.value) {
        const rawDiary = diaryResult.value.entries || diaryResult.value;
        setDiary(mapServerDiary(rawDiary));
        setDemoDay(false);
      } else {
        setDiary([]);
      }

      setDataSource("backend");
    },
    []
  );

  const syncBackend = useCallback(async () => {
    if (!onboarded) {
      return;
    }

    setDataSource("checking");

    const currentId = profileId || getActiveProfileId();

    if (!currentId) {
      try {
        const newId = await createProfileOnBackend(profileRef.current);
        await loadBackendData(newId);
      } catch (e) {
        setServerTargets(null);
        setDataSource("demo");
      }

      return;
    }

    try {
      setActiveProfileId(currentId);
      setProfileId(currentId);
      await loadBackendData(currentId);
    } catch (e) {
      if (isProfileNotFoundError(e)) {
        try {
          const newId = await createProfileOnBackend(profileRef.current);
          await loadBackendData(newId);
        } catch (createError) {
          setServerTargets(null);
          setDataSource("demo");
        }

        return;
      }

      setServerTargets(null);
      setDataSource("demo");
    }
  }, [onboarded, profileId, createProfileOnBackend, loadBackendData]);

  useEffect(() => {
    if (onboarded) {
      syncBackend();
    }
  }, [onboarded, syncBackend]);

  const addDiary = (entry) => {
    setDiary((d) => [...d, entry]);
  };

  const addToPlan = (dish, meal = "snack") => {
    setPlan((p) => [
      ...p,
      {
        meal,
        label:
          {
            breakfast: "Завтрак",
            lunch: "Обед",
            snack: "Перекус",
            dinner: "Ужин",
          }[meal] || "Приём пищи",
        dish: dish.name,
        emoji: dish.emoji,
        cal: dish.cal,
        p: dish.p,
        f: dish.f,
        c: dish.c,
      },
    ]);
  };

  const toggleDemo = () => {
    if (demoDay) {
      setDemoDay(false);
      setDiary([]);
    } else {
      setDemoDay(true);
      setDiary(DEMO_DIARY);
    }
  };

  const finishOnboarding = (draft) => {
    setProfile(draft);
    setDiary([]);
    setDemoDay(false);
    setServerTargets(null);
    setDataSource("checking");

    api
      .createProfile(buildProfilePayload(draft))
      .then((created) => {
        setActiveProfileId(created.id);
        setProfileId(created.id);
        setOnboarded(true);
        setDataSource("backend");
      })
      .catch(() => {
        setProfileId(null);
        setOnboarded(true);
        setDataSource("demo");
      });
  };

  const resetOnboarding = () => {
    setOnboarded(false);
    setDiary([]);
    setDemoDay(false);
    setServerTargets(null);
    setDataSource("demo");
    setProfileId(null);

    try {
      setActiveProfileId(null);
    } catch (e) {
      // Если api/client.js не умеет очищать active profile id,
      // старый id всё равно будет перекрыт после нового онбординга.
    }
  };

  const saveProfile = (draft) => {
    setProfile(draft);
    setServerTargets(null);

    if (!profileId) {
      api
        .createProfile(buildProfilePayload(draft))
        .then((created) => {
          setActiveProfileId(created.id);
          setProfileId(created.id);
          setDataSource("backend");
        })
        .catch(() => {
          setDataSource("demo");
        });

      return;
    }

    api
      .updateProfile(buildProfilePayload(draft), profileId)
      .then(() => {
        syncBackend();
      })
      .catch((e) => {
        if (isProfileNotFoundError(e)) {
          createProfileOnBackend(draft)
            .then((newId) => loadBackendData(newId))
            .catch(() => setDataSource("demo"));
        } else {
          setDataSource("demo");
        }
      });
  };

  const value = {
    onboarded,
    profile,
    targets,
    diary,
    demoDay,
    plan,
    dataSource,
    profileId,
    howOpen,

    openHow: () => setHowOpen(true),
    closeHow: () => setHowOpen(false),

    setProfile,
    setPlan,
    addDiary,
    addToPlan,
    toggleDemo,
    syncBackend,
    finishOnboarding,
    resetOnboarding,
    saveProfile,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
