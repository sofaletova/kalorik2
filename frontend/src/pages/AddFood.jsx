import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DISHES } from "../lib/data.js";
import { api } from "../api/client.js";
import Icon from "../components/Icon.jsx";
import { PageHead, ImageSlot } from "../components/ui.jsx";

const MAX_PHOTO_MB = 8;

function Note({ children, tone = "info" }) {
  const isDanger = tone === "danger";

  return (
    <div
      style={{
        display: "flex",
        gap: 9,
        alignItems: "flex-start",
        padding: "12px 15px",
        borderRadius: "var(--r-sm)",
        background: isDanger ? "var(--danger-soft)" : "var(--surface-2)",
        color: isDanger ? "var(--danger)" : "var(--ink-2)",
        fontSize: 13,
        lineHeight: 1.5,
        border: "1px solid var(--line)",
      }}
    >
      <Icon
        name={isDanger ? "alert" : "info"}
        size={16}
        style={{
          color: isDanger ? "var(--danger)" : "var(--brand)",
          flexShrink: 0,
          marginTop: 1,
        }}
      />
      {children}
    </div>
  );
}

function extractAverage(text, labelPatterns, fallback) {
  const normalized = String(text || "").replace(/—/g, "-").replace(/–/g, "-");

  for (const pattern of labelPatterns) {
    const match = normalized.match(pattern);

    if (match) {
      const first = Number(match[1]);
      const second = Number(match[2]);

      if (Number.isFinite(first) && Number.isFinite(second)) {
        return Math.round((first + second) / 2);
      }

      if (Number.isFinite(first)) {
        return Math.round(first);
      }
    }
  }

  return fallback;
}

function extractDishName(text) {
  const lines = String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const looksLike = lines.find((line) =>
    /похоже на|вижу|предполагаем/i.test(line)
  );

  if (looksLike) {
    return (
      looksLike
        .replace(/^[-—•\d.\s]*/g, "")
        .replace(/^(что вижу на фото|что вижу|похоже на фото|похоже на)[:\s-]*/i, "")
        .slice(0, 70)
        .trim() || "Блюдо по фото"
    );
  }

  const firstMeaningful = lines.find(
    (line) =>
      !/кбжу|калории|белки|жиры|углеводы|уверенность|уточнить|вписать/i.test(line)
  );

  return firstMeaningful?.slice(0, 70) || "Блюдо по фото";
}

function parseAiDish(text, fileName) {
  const cal = extractAverage(
    text,
    [
      /калор(?:ии|ий|ийность)?[^0-9]{0,40}(\d{2,4})(?:\s*-\s*(\d{2,4}))?/i,
      /(\d{2,4})(?:\s*-\s*(\d{2,4}))?\s*ккал/i,
    ],
    450
  );

  const p = extractAverage(
    text,
    [/белк(?:и|ов)?[^0-9]{0,40}(\d{1,3})(?:\s*-\s*(\d{1,3}))?/i],
    25
  );

  const f = extractAverage(
    text,
    [/жир(?:ы|ов)?[^0-9]{0,40}(\d{1,3})(?:\s*-\s*(\d{1,3}))?/i],
    15
  );

  const c = extractAverage(
    text,
    [/углевод(?:ы|ов)?[^0-9]{0,40}(\d{1,3})(?:\s*-\s*(\d{1,3}))?/i],
    55
  );

  return {
    id: "photo-" + Date.now(),
    name: extractDishName(text),
    emoji: "📷",
    cal,
    p,
    f,
    c,
    price: null,
    source: "Фото AI",
    aiText: text,
    photoName: fileName,
    isPhotoEstimate: true,
  };
}

function getAssistantText(response) {
  return (
    response?.assistant_message?.content ||
    response?.assistant_message?.text ||
    response?.content ||
    response?.text ||
    ""
  );
}

export default function AddFood() {
  const navigate = useNavigate();

  const [tab, setTab] = useState("photo");
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [aiDish, setAiDish] = useState(null);
  const [aiRawText, setAiRawText] = useState("");

  const fileInputRef = useRef(null);

  const open = (d, source) => {
    navigate("/add/analyze", {
      state: {
        dish: {
          ...d,
          source,
        },
      },
    });
  };

  const tabs = [
    { id: "photo", label: "Фото", icon: "camera" },
    { id: "text", label: "Текст", icon: "text" },
    { id: "base", label: "База", icon: "search" },
  ];

  const filtered = DISHES.filter((d) =>
    d.name.toLowerCase().includes(query.toLowerCase())
  );

  const textMatches = text.trim()
    ? DISHES.filter((d) =>
        text
          .toLowerCase()
          .split(/[\s,]+/)
          .some((w) => w.length > 2 && d.name.toLowerCase().includes(w))
      )
    : [];

  const photoHint = useMemo(() => {
    if (!photoFile) {
      return "Загрузи фото блюда — AI примерно определит название, калории и КБЖУ.";
    }

    if (aiDish) {
      return "AI уже сделал примерную оценку. Проверь блюдо и порцию перед добавлением.";
    }

    return "Фото выбрано. Нажми “Проанализировать фото”, чтобы получить примерную оценку.";
  }, [photoFile, aiDish]);

  const handlePhotoSelect = (event) => {
    const file = event.target.files?.[0];

    setPhotoError("");
    setAiDish(null);
    setAiRawText("");

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setPhotoError("Выбери файл изображения: JPG, PNG или WEBP.");
      return;
    }

    const sizeMb = file.size / 1024 / 1024;

    if (sizeMb > MAX_PHOTO_MB) {
      setPhotoError(`Фото слишком большое: максимум ${MAX_PHOTO_MB} МБ.`);
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const analyzePhoto = async () => {
    if (!photoFile || analyzing) {
      return;
    }

    setPhotoError("");
    setAnalyzing(true);

    try {
      const response = await api.analyzeFoodPhoto(
        photoFile,
        "Определи блюдо на фото и примерно оцени калории, белки, жиры и углеводы. Ответь по-русски."
      );

      const assistantText = getAssistantText(response);

      if (!assistantText) {
        throw new Error("Backend вернул пустой ответ по фото.");
      }

      const parsed = parseAiDish(assistantText, photoFile.name);

      setAiRawText(assistantText);
      setAiDish(parsed);
    } catch (err) {
      setPhotoError(err.message || "Не удалось проанализировать фото.");
    } finally {
      setAnalyzing(false);
    }
  };

  const DishRow = ({ d, source }) => (
    <button
      onClick={() => open(d, source)}
      style={{
        textAlign: "left",
        border: "1.5px solid var(--line)",
        background: "var(--surface)",
        borderRadius: "var(--r-md)",
        padding: 14,
        cursor: "pointer",
        display: "flex",
        gap: 12,
        alignItems: "center",
        width: "100%",
      }}
    >
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 12,
          background: "var(--surface-sunken)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
          flexShrink: 0,
        }}
      >
        {d.emoji}
      </div>

      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 14,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {d.name}
        </div>
        <div className="num muted" style={{ fontSize: 12.5, marginTop: 3 }}>
          {d.cal} ккал · Б{d.p} Ж{d.f} У{d.c}
        </div>
      </div>

      <Icon name="arrowR" size={17} style={{ color: "var(--ink-4)" }} />
    </button>
  );

  return (
    <div className="fade-up" style={{ maxWidth: 760, margin: "0 auto" }}>
      <PageHead
        title="Добавить еду"
        subtitle="Загрузи фото, опиши словами или выбери блюдо из базы"
      />

      <div className="card" style={{ padding: 8, display: "flex", gap: 6, marginBottom: 18 }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1,
              border: "none",
              cursor: "pointer",
              borderRadius: "var(--r-md)",
              padding: "13px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 9,
              fontWeight: 700,
              fontSize: 15,
              background: tab === t.id ? "var(--brand-softer)" : "transparent",
              color: tab === t.id ? "var(--brand-ink)" : "var(--ink-3)",
            }}
          >
            <Icon name={t.icon} size={19} /> {t.label}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 26 }}>
        {tab === "photo" && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              style={{ display: "none" }}
              onChange={handlePhotoSelect}
            />

            <div onClick={() => fileInputRef.current?.click()} style={{ cursor: "pointer" }}>
              {photoPreview ? (
                <div
                  style={{
                    height: 240,
                    borderRadius: "var(--r-md)",
                    overflow: "hidden",
                    background: "var(--surface-sunken)",
                    border: "1px solid var(--line)",
                  }}
                >
                  <img
                    src={photoPreview}
                    alt="Фото блюда"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </div>
              ) : (
                <ImageSlot label="нажми, чтобы загрузить фото блюда" h={220} icon="camera" />
              )}
            </div>

            <div style={{ marginTop: 16 }}>
              <Note>{photoHint}</Note>
            </div>

            {photoError && (
              <div style={{ marginTop: 12 }}>
                <Note tone="danger">{photoError}</Note>
              </div>
            )}

            {aiDish && (
              <div
                style={{
                  marginTop: 16,
                  padding: 16,
                  borderRadius: "var(--r-md)",
                  background: "var(--surface-2)",
                  border: "1px solid var(--line)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 12,
                      background: "var(--brand-softer)",
                      color: "var(--brand)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                      flexShrink: 0,
                    }}
                  >
                    📷
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 15 }}>{aiDish.name}</div>
                    <div className="num muted" style={{ fontSize: 12.5, marginTop: 3 }}>
                      ≈ {aiDish.cal} ккал · Б{aiDish.p} Ж{aiDish.f} У{aiDish.c}
                    </div>
                  </div>
                </div>

                {aiRawText && (
                  <details style={{ marginTop: 12 }}>
                    <summary
                      style={{
                        cursor: "pointer",
                        fontWeight: 700,
                        fontSize: 13,
                        color: "var(--brand)",
                      }}
                    >
                      Показать полный анализ AI
                    </summary>

                    <div
                      style={{
                        marginTop: 10,
                        whiteSpace: "pre-wrap",
                        fontSize: 13,
                        lineHeight: 1.5,
                        color: "var(--ink-2)",
                      }}
                    >
                      {aiRawText}
                    </div>
                  </details>
                )}
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
              <button
                className="btn btn-ghost btn-block"
                onClick={() => fileInputRef.current?.click()}
              >
                <Icon name="camera" size={17} />
                {photoFile ? "Выбрать другое фото" : "Загрузить фото"}
              </button>

              <button
                className="btn btn-primary btn-block"
                disabled={!photoFile || analyzing}
                onClick={analyzePhoto}
              >
                <Icon name="sparkle" size={17} />
                {analyzing ? "AI анализирует…" : "Проанализировать фото"}
              </button>
            </div>

            {aiDish && (
              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button
                  className="btn btn-primary btn-block"
                  onClick={() =>
                    navigate("/add/analyze", {
                      state: {
                        dish: aiDish,
                      },
                    })
                  }
                >
                  <Icon name="check" size={17} />
                  Проверить и добавить в дневник
                </button>
              </div>
            )}
          </div>
        )}

        {tab === "text" && (
          <div>
            <label className="field-label">Опиши, что ты съел(а)</label>
            <textarea
              className="input"
              rows={2}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Например: гречка с курицей"
              style={{ resize: "none", lineHeight: 1.5 }}
            />

            <div style={{ display: "flex", gap: 8, margin: "12px 0 16px", flexWrap: "wrap" }}>
              {["Овсянка", "Гречка с курицей", "Омлет", "Творог"].map((s) => (
                <button key={s} className="chip" onClick={() => setText(s)}>
                  {s}
                </button>
              ))}
            </div>

            <Note>
              Пока текстовый разбор ищет похожее блюдо в базе. Для более свободного описания
              можно спросить AI в чате.
            </Note>

            {text.trim() && (
              <div style={{ marginTop: 16 }}>
                <div className="field-label">
                  {textMatches.length ? "Похоже на эти блюда:" : "Совпадений в базе не найдено"}
                </div>

                {textMatches.length ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {textMatches.map((d) => (
                      <DishRow key={d.id} d={d} source="Текст" />
                    ))}
                  </div>
                ) : (
                  <button
                    className="btn btn-ghost btn-block"
                    onClick={() => {
                      setQuery("");
                      setTab("base");
                    }}
                  >
                    Открыть базу блюд <Icon name="arrowR" size={16} />
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {tab === "base" && (
          <div>
            <div style={{ position: "relative", marginBottom: 16 }}>
              <Icon
                name="search"
                size={18}
                style={{
                  position: "absolute",
                  left: 15,
                  top: 14,
                  color: "var(--ink-4)",
                }}
              />
              <input
                className="input"
                style={{ paddingLeft: 44 }}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск блюда…"
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {filtered.map((d) => (
                <DishRow key={d.id} d={d} source="База" />
              ))}

              {filtered.length === 0 && (
                <div
                  className="muted"
                  style={{ gridColumn: "1/-1", textAlign: "center", padding: 24 }}
                >
                  Ничего не найдено
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
