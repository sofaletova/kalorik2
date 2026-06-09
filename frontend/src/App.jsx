import React from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useApp } from "./context/AppContext.jsx";
import { Brand, Avatar, HowWeCalc } from "./components/ui.jsx";
import Icon from "./components/Icon.jsx";
import { GOAL_LABEL } from "./lib/data.js";

import Onboarding from "./pages/Onboarding.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Chat from "./pages/Chat.jsx";
import AddFood from "./pages/AddFood.jsx";
import AnalyzeDish from "./pages/AnalyzeDish.jsx";
import Recommend from "./pages/Recommend.jsx";
import Recipe from "./pages/Recipe.jsx";
import Plan from "./pages/Plan.jsx";
import Shopping from "./pages/Shopping.jsx";
import Progress from "./pages/Progress.jsx";
import Profile from "./pages/Profile.jsx";
import ProfileEdit from "./pages/ProfileEdit.jsx";

const NAV = [
  { to: "/", label: "Главная", icon: "home" },
  { to: "/chat", label: "Чат с AI", icon: "chat", badge: true },
  { to: "/add", label: "Добавить еду", icon: "plus" },
  { to: "/plan", label: "План", icon: "plan" },
  { to: "/shopping", label: "Покупки", icon: "cart" },
  { to: "/progress", label: "Прогресс", icon: "chart" },
  { to: "/profile", label: "Профиль", icon: "user" },
];

function Sidebar() {
  const { profile, openHow, resetOnboarding } = useApp();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isActive = (to) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <aside style={{ width: 256, flexShrink: 0, background: "var(--surface)", borderRight: "1px solid var(--line)",
      display: "flex", flexDirection: "column", padding: "24px 18px" }}>
      <div style={{ padding: "0 6px 8px" }}><Brand size={0.92} /></div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 22 }}>
        {NAV.map((n) => {
          const active = isActive(n.to);
          return (
            <button key={n.to} onClick={() => navigate(n.to)} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: "var(--r-sm)",
              border: "none", cursor: "pointer", textAlign: "left", fontWeight: 700, fontSize: 14.5, whiteSpace: "nowrap",
              background: active ? "var(--brand-softer)" : "transparent",
              color: active ? "var(--brand-ink)" : "var(--ink-2)", transition: "all .14s ease" }}>
              <Icon name={n.icon} size={20} stroke={active ? 2.2 : 1.9} />
              {n.label}
              {n.badge && <span style={{ marginLeft: "auto", width: 7, height: 7, borderRadius: 99, background: "var(--brand)" }} />}
            </button>
          );
        })}
      </nav>

      <button className="btn btn-quiet btn-sm" style={{ marginTop: 16, justifyContent: "flex-start", color: "var(--ink-3)" }}
        onClick={openHow}><Icon name="info" size={16} /> Как мы считаем</button>

      <div style={{ marginTop: "auto" }}>
        <button onClick={() => navigate("/profile")} style={{ width: "100%", display: "flex", alignItems: "center", gap: 11,
          padding: 10, borderRadius: "var(--r-sm)", border: "1px solid var(--line)", background: "var(--surface-2)", cursor: "pointer" }}>
          <Avatar name={profile.name || "Г"} size={38} />
          <div style={{ textAlign: "left", minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 14 }}>{profile.name || "Профиль"}</div>
            <div className="muted" style={{ fontSize: 11.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {GOAL_LABEL[profile.goal]}
            </div>
          </div>
        </button>
        <button className="btn btn-quiet btn-sm btn-block" style={{ marginTop: 8, color: "var(--ink-4)" }}
          onClick={resetOnboarding}><Icon name="refresh" size={14} /> Пройти онбординг заново</button>
      </div>
    </aside>
  );
}

export default function App() {
  const { onboarded, howOpen, closeHow } = useApp();
  const { pathname } = useLocation();

  if (!onboarded) {
    return (
      <>
        <div style={{ minHeight: "100vh", overflowY: "auto" }}><Onboarding /></div>
        {howOpen && <HowWeCalc onClose={closeHow} />}
      </>
    );
  }

  const isChat = pathname.startsWith("/chat");
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar />
      <main id="main-scroll" style={{ flex: 1, overflowY: isChat ? "hidden" : "auto",
        padding: isChat ? "28px 32px" : "32px 36px 48px", display: isChat ? "flex" : "block" }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/add" element={<AddFood />} />
          <Route path="/add/analyze" element={<AnalyzeDish />} />
          <Route path="/recommend" element={<Recommend />} />
          <Route path="/recommend/recipe" element={<Recipe />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/shopping" element={<Shopping />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<ProfileEdit />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {howOpen && <HowWeCalc onClose={closeHow} />}
    </div>
  );
}
