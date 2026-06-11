/* ============================================================
   Backend API client.
   Talks to the FastAPI backend (see attached archive).
   Base URL comes from VITE_API_BASE_URL (default: /api/v1, proxied
   by Vite to http://127.0.0.1:8000 in dev).
   No AI keys live here — the assistant runs on the backend.
   ============================================================ */

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api/v1").replace(/\/$/, "");
const PROFILE_ID_STORAGE = "kalorik_profile_id";
export const PROFILE_ID = Number(import.meta.env.VITE_PROFILE_ID || 1);

export function getActiveProfileId() {
  const stored = Number(localStorage.getItem(PROFILE_ID_STORAGE));
  return Number.isFinite(stored) && stored > 0 ? stored : PROFILE_ID;
}

export function setActiveProfileId(id) {
  if (id) localStorage.setItem(PROFILE_ID_STORAGE, String(id));
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  let res;
  try {
    res = await fetch(BASE_URL + path, {
      headers: isFormData ? undefined : { "Content-Type": "application/json" },
      ...options,
    });
  } catch (e) {
    throw new ApiError("Нет соединения с сервером", 0);
  }
  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail || body);
    } catch (e) {
      /* ignore */
    }
    throw new ApiError(detail || `Ошибка сервера (${res.status})`, res.status);
  }
  if (res.status === 204) return null;
  return res.json();
}

const p = (id) => `/profiles/${id ?? getActiveProfileId()}`;

export const api = {
  // References
  getOnboarding: () => request("/references/onboarding"),

  // Profiles
  createProfile: (body) => request("/profiles", { method: "POST", body: JSON.stringify(body) }),
  getProfile: (id) => request(p(id)),
  updateProfile: (body, id) => request(p(id), { method: "PATCH", body: JSON.stringify(body) }),
  getNutritionTargets: (id) => request(`${p(id)}/nutrition-targets`),

  // Diary
  getDiary: (date, id) => request(`${p(id)}/diary?entry_date=${date}`),
  addDiaryEntry: (body, id) => request(`${p(id)}/diary`, { method: "POST", body: JSON.stringify(body) }),

  // Meal plans
  getMealPlans: (from, to, id) => request(`${p(id)}/meal-plans?date_from=${from}&date_to=${to}`),
  createMealPlan: (body, id) => request(`${p(id)}/meal-plans`, { method: "POST", body: JSON.stringify(body) }),

  // Chat (sends to backend, displays server reply — never fabricated client-side)
  getChatMessages: (id) => request(`${p(id)}/chat/messages`),
  sendChatMessage: (content, id) =>
    request(`${p(id)}/chat/messages`, { method: "POST", body: JSON.stringify({ content }) }),
  sendChatImage: (image, content = "", id) => {
    const form = new FormData();
    form.append("image", image);
    form.append("content", content);
    return request(`${p(id)}/chat/image`, { method: "POST", body: form });
  },
};

/* Mifflin–St Jeor — mirrors backend app/services/nutrition.py exactly,
   so locally-previewed targets match the server. */
const ACTIVITY = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };

export function calcTargets(profile) {
  const sexOffset = profile.sex === "male" ? 5 : -161;
  const bmr = 10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * profile.age + sexOffset;
  const tdee = bmr * (ACTIVITY[profile.activity_level] || 1.2);
  let calories = tdee;
  if (profile.goal === "weight_loss") calories = tdee * 0.85;
  else if (profile.goal === "muscle_gain") calories = tdee * 1.1;
  const protein_g = profile.weight_kg * (profile.goal === "muscle_gain" ? 1.8 : 1.6);
  const fat_g = Math.max(profile.weight_kg * 0.8, (calories * 0.2) / 9);
  const carbs_g = Math.max((calories - protein_g * 4 - fat_g * 9) / 4, 0);
  return {
    bmr: Math.round(bmr * 10) / 10,
    tdee: Math.round(tdee * 10) / 10,
    goal: profile.goal,
    calories: Math.round(calories),
    protein_g: Math.round(protein_g),
    fat_g: Math.round(fat_g),
    carbs_g: Math.round(carbs_g),
  };
}

export { BASE_URL };
