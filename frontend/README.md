# КАЛОРИК — Frontend

AI-помощник по ежедневному выбору питания. Веб-приложение (React + Vite),
которое работает поверх FastAPI backend из прилагаемого архива.

## Возможности

- Онбординг: имя → цель и темп → анкета → персональная норма КБЖУ
  (формула Миффлина — Сан Жеора, совпадает с расчётом на backend).
- Дашборд дня: кольцо калорий, прогресс по Б/Ж/У, итог дня, пустое состояние
  (после регистрации дневник пуст) и переключатель «Показать демо-день».
- Добавление еды: текст / база блюд / фото. Распознавание по фото и авто-разбор
  текста помечены как «будет подключено позже» — fake-результаты не показываются.
- AI-чат: сообщения отправляются на backend (`POST /chat/messages`), отображается
  ответ сервера. Состояния: загрузка, пусто, «КАЛОРИК думает…», ошибка.
- План питания, список покупок, прогресс, профиль с редактированием.
- Цены показываются как ориентировочные «по демо-базе»; индикатор источника данных
  (backend / демо) и раздел «Как мы считаем».

## Архитектура

```
src/
  main.jsx              точка входа (Router + AppProvider)
  App.jsx               сайдбар + маршрутизация (react-router)
  index.css             дизайн-система (CSS-переменные, кнопки, карточки)
  api/client.js         клиент backend API + calcTargets (Mifflin–St Jeor)
  context/AppContext.jsx глобальное состояние, синхронизация с backend
  lib/data.js           справочники, демо-блюда, лейблы, утилиты
  components/            Icon, ui (Ring, MacroBar, Modal, и т.д.)
  pages/                Onboarding, Dashboard, Chat, AddFood, AnalyzeDish,
                        Recommend, Recipe, Plan, Shopping, Progress,
                        Profile, ProfileEdit
```

## Подключение к backend

Фронт обращается к API по адресу `http://127.0.0.1:8000/api/v1`.

В режиме разработки Vite проксирует `/api` → `http://127.0.0.1:8000`
(см. `vite.config.js`), поэтому браузер делает same-origin запросы без CORS.

Используемые эндпоинты:

| Назначение            | Метод и путь                                  |
| --------------------- | --------------------------------------------- |
| Справочники онбординга| `GET  /references/onboarding`                 |
| Создать профиль       | `POST /profiles`                              |
| Профиль               | `GET  /profiles/{id}`                         |
| Обновить профиль      | `PATCH /profiles/{id}`                        |
| Норма КБЖУ            | `GET  /profiles/{id}/nutrition-targets`       |
| Дневник               | `GET/POST /profiles/{id}/diary`               |
| План питания          | `GET/POST /profiles/{id}/meal-plans`          |
| Чат                   | `GET/POST /profiles/{id}/chat/messages`       |

> AI не вызывается с фронтенда и API-ключи во фронте не хранятся. Генерация
> ответов помощника — задача backend (там позже подключается OpenAI).

Если backend недоступен, интерфейс остаётся рабочим на демо-данных и явно
помечает их как «Демо-данные»; чат показывает состояние ошибки.

## Конфигурация

Скопируй `.env.example` в `.env` и при необходимости поменяй значения:

```
VITE_API_BASE_URL=/api/v1      # или http://127.0.0.1:8000/api/v1 без прокси
VITE_PROFILE_ID=1              # демо-профиль до появления авторизации
```

## Запуск

```bash
# 1. backend (из архива)
cd eda_backend_clean_for_claude
pip install -r requirements.txt
uvicorn app.main:app --reload          # http://127.0.0.1:8000

# 2. frontend
cd frontend
npm install
npm run dev                            # http://localhost:5173
```

Сборка продакшена: `npm run build`, предпросмотр: `npm run preview`.
