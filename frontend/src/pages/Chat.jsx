import React, { useState, useEffect, useRef, useCallback } from "react";
import { useApp } from "../context/AppContext.jsx";
import { api } from "../api/client.js";
import Icon from "../components/Icon.jsx";
import { Avatar } from "../components/ui.jsx";

const SUGGESTIONS = [
  "Что мне съесть на ужин в рамках нормы?",
  "Чем заменить курицу?",
  "Я съел бургер, как скорректировать день?",
  "Как добрать белок без лишних жиров?",
];

function AssistantAvatar() {
  return (
    <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: "linear-gradient(135deg, var(--brand), #43c99d)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Icon name="sparkle" size={17} style={{ color: "#fff" }} />
    </div>
  );
}

function Bubble({ m, name }) {
  if (m.role === "user") {
    return (
      <div style={{ display: "flex", gap: 10, alignSelf: "flex-end", maxWidth: "80%", alignItems: "flex-end" }}>
        <div style={{ background: m.failed ? "var(--danger-soft)" : "var(--brand)", color: m.failed ? "var(--danger)" : "#fff",
          borderRadius: "16px 16px 4px 16px", padding: "12px 16px", fontSize: 14.5, lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{m.content}</div>
        <Avatar name={name || "Я"} size={34} />
      </div>
    );
  }
  return (
    <div style={{ display: "flex", gap: 10, alignSelf: "flex-start", maxWidth: "84%" }}>
      <AssistantAvatar />
      <div style={{ background: "var(--surface-sunken)", color: "var(--ink)", borderRadius: "4px 16px 16px 16px", padding: "12px 16px", fontSize: 14.5, lineHeight: 1.55, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{m.content}</div>
    </div>
  );
}

function CenterState({ icon, title, text, action, tone, spin }) {
  return (
    <div style={{ margin: "auto", textAlign: "center", maxWidth: 380 }}>
      <div className={spin ? "spin" : ""} style={{ width: 54, height: 54, borderRadius: 16, margin: "0 auto 16px",
        background: tone === "danger" ? "var(--danger-soft)" : "var(--brand-softer)", color: tone === "danger" ? "var(--danger)" : "var(--brand)",
        display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={icon} size={26} /></div>
      <h3 style={{ fontSize: 17 }}>{title}</h3>
      {text && <p className="muted" style={{ fontSize: 13, lineHeight: 1.5, margin: "8px 0 0", wordBreak: "break-word" }}>{text}</p>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}

export default function Chat() {
  const { profile } = useApp();
  const [messages, setMessages] = useState([]);
  const [loadState, setLoadState] = useState("loading"); // loading | ready | error
  const [loadError, setLoadError] = useState("");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const scrollRef = useRef(null);

  const loadHistory = useCallback(() => {
    setLoadState("loading"); setLoadError("");
    api.getChatMessages()
      .then((data) => { setMessages((data || []).map((m) => ({ id: m.id, role: m.role, content: m.content }))); setLoadState("ready"); })
      .catch((err) => { setLoadError(err.message || "Не удалось загрузить чат"); setLoadState("error"); });
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, sending]);

  const send = (textArg) => {
    const content = (textArg ?? input).trim();
    if (!content || sending) return;
    setInput(""); setSendError("");
    const tempUser = { id: "tmp-" + Date.now(), role: "user", content };
    setMessages((m) => [...m, tempUser]);
    setSending(true);
    api.sendChatMessage(content)
      .then((res) => {
        setMessages((m) => {
          const without = m.filter((x) => x.id !== tempUser.id);
          return [...without,
            { id: res.user_message.id, role: "user", content: res.user_message.content },
            { id: res.assistant_message.id, role: "assistant", content: res.assistant_message.content }];
        });
      })
      .catch((err) => {
        setSendError(err.message || "Сообщение не отправлено");
        setMessages((m) => m.map((x) => (x.id === tempUser.id ? { ...x, failed: true } : x)));
      })
      .finally(() => setSending(false));
  };

  return (
    <div className="fade-up" style={{ maxWidth: 860, margin: "0 auto", height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 18 }}>
        <div style={{ width: 46, height: 46, borderRadius: 14, background: "linear-gradient(135deg, var(--brand), #43c99d)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--sh-brand)" }}>
          <Icon name="sparkle" size={23} style={{ color: "#fff" }} />
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 22 }}>AI-помощник</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
            <span style={{ width: 7, height: 7, borderRadius: 99, background: loadState === "ready" ? "var(--brand)" : loadState === "error" ? "var(--danger)" : "var(--fat)" }} />
            <span className="muted" style={{ fontSize: 12.5 }}>
              {loadState === "ready" ? "Подключено к backend" : loadState === "error" ? "Нет связи с backend" : "Подключаюсь…"}
            </span>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={loadHistory}><Icon name="refresh" size={16} /> Обновить</button>
      </div>

      <div ref={scrollRef} className="card" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
        {loadState === "loading" && <CenterState icon="chat" title="Загружаю историю…" spin />}
        {loadState === "error" && (
          <CenterState icon="alert" tone="danger" title="Не удалось получить ответ. Проверь подключение backend" text={loadError}
            action={<button className="btn btn-primary btn-sm" onClick={loadHistory}><Icon name="refresh" size={15} /> Повторить</button>} />
        )}
        {loadState === "ready" && messages.length === 0 && (
          <div style={{ margin: "auto", textAlign: "center", maxWidth: 420 }}>
            <div style={{ width: 60, height: 60, borderRadius: 18, margin: "0 auto 18px", background: "var(--brand-softer)", color: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="chat" size={30} /></div>
            <h2 style={{ fontSize: 20 }}>Задай вопрос о питании{profile.name ? ", " + profile.name : ""}</h2>
            <p className="muted" style={{ fontSize: 14, lineHeight: 1.5, margin: "10px 0 20px" }}>Спроси про КБЖУ, варианты блюд или как скорректировать день — ответ придёт с backend.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {SUGGESTIONS.map((s) => (
                <button key={s} className="chip" style={{ justifyContent: "flex-start", width: "100%" }} onClick={() => send(s)}>
                  <Icon name="sparkle" size={14} style={{ color: "var(--brand)" }} /> {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {loadState === "ready" && messages.map((m) => <Bubble key={m.id} m={m} name={profile.name} />)}
        {sending && (
          <div style={{ display: "flex", gap: 10, alignItems: "center", alignSelf: "flex-start" }}>
            <AssistantAvatar />
            <div style={{ background: "var(--surface-sunken)", borderRadius: "4px 16px 16px 16px", padding: "13px 17px", display: "flex", alignItems: "center", gap: 9 }}>
              <span style={{ fontSize: 14, color: "var(--ink-3)" }}>КАЛОРИК думает</span>
              <span style={{ display: "flex", gap: 3 }}>
                {[0, 1, 2].map((i) => (
                  <span key={i} style={{ width: 6, height: 6, borderRadius: 99, background: "var(--brand)", animation: "dotpulse 1.2s ease-in-out infinite", animationDelay: i * 0.18 + "s" }} />
                ))}
              </span>
            </div>
          </div>
        )}
      </div>

      {sendError && (
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 10, padding: "10px 14px", borderRadius: "var(--r-sm)", background: "var(--danger-soft)", color: "var(--danger)", fontSize: 13 }}>
          <Icon name="alert" size={15} /> Не удалось получить ответ. Проверь подключение backend.
          <button className="btn btn-sm" style={{ marginLeft: "auto", background: "#fff", color: "var(--danger)" }}
            onClick={() => { const last = [...messages].reverse().find((x) => x.role === "user"); if (last) send(last.content); }}>Повторить</button>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 14, alignItems: "flex-end" }}>
        <textarea className="input" rows={1} value={input} disabled={loadState !== "ready"} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder={loadState === "ready" ? "Напиши сообщение…" : "Чат недоступен — проверь подключение"} style={{ resize: "none", lineHeight: 1.5, maxHeight: 120 }} />
        <button className="btn btn-primary" style={{ padding: "13px 16px", height: 50 }} disabled={!input.trim() || sending || loadState !== "ready"} onClick={() => send()}>
          <Icon name="send" size={19} />
        </button>
      </div>
    </div>
  );
}
