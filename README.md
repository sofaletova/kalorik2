# Nutrition Diary API

Backend for a nutrition diary product. The API stores user profiles, calculates nutrition targets, keeps food diary entries, stores meal plans, and provides a chat endpoint prepared for a future AI assistant.

## Project Structure

```text
app/
  main.py                 FastAPI application, CORS, route registration
  api/
    deps.py               Shared API dependencies
    routes/
      references.py       Onboarding dictionaries: goals, allergies, preferences
      profiles.py         User profile and nutrition targets
      diary.py            Food diary entries and daily summary
      meal_plans.py       Meal plan CRUD
      chat.py             Chat history and AI assistant replies
  core/
    config.py             Environment settings
  db/
    session.py            Database engine and session
  models/
    *.py                  SQLAlchemy database tables
  schemas/
    *.py                  Pydantic request/response JSON contracts
  services/
    nutrition.py          BMR/TDEE and macro calculation
    chat.py               OpenAI-backed chat logic
```

## Run Locally

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API health check:

```http
GET http://127.0.0.1:8000/health
```

Swagger docs:

```http
GET http://127.0.0.1:8000/docs
```

## Environment

Copy `.env.example` to `.env` if you want to override defaults.

By default the API uses SQLite:

```env
DATABASE_URL=sqlite:///./nutrition_diary.db
```

AI chat requires an OpenAI API key. Put it into local `.env` only:

```env
OPENAI_API_KEY=your_real_key_here
OPENAI_MODEL=gpt-5.2
```

Do not put API keys into frontend files, GitHub, chats, or `API.md`.

For PostgreSQL later:

```env
DATABASE_URL=postgresql+psycopg://user:password@localhost:5432/nutrition_diary
```

## Main Endpoints

### Onboarding References

```http
GET /api/v1/references/onboarding
```

Returns available goals, allergies, religious restrictions, food preferences, and activity levels.

### Profile

```http
POST /api/v1/profiles
GET /api/v1/profiles/{profile_id}
PATCH /api/v1/profiles/{profile_id}
GET /api/v1/profiles/{profile_id}/nutrition-targets
```

Example profile create body:

```json
{
  "name": "Sofia",
  "goal": "weight_loss",
  "sex": "female",
  "activity_level": "moderate",
  "age": 24,
  "weight_kg": 70,
  "height_cm": 170,
  "target_weight_kg": 63,
  "allergies": ["nuts"],
  "religious_restrictions": [],
  "food_preferences": ["chicken", "vegetables", "quick_meals"]
}
```

### Food Diary

```http
GET /api/v1/profiles/{profile_id}/diary?entry_date=2026-05-30
POST /api/v1/profiles/{profile_id}/diary
PATCH /api/v1/profiles/{profile_id}/diary/{entry_id}
DELETE /api/v1/profiles/{profile_id}/diary/{entry_id}
```

Example diary entry:

```json
{
  "entry_date": "2026-05-30",
  "meal_name": "Chicken buckwheat bowl",
  "calories": 520,
  "protein_g": 38,
  "fat_g": 14,
  "carbs_g": 58,
  "source": "manual",
  "notes": "Lunch"
}
```

### Meal Plans

```http
GET /api/v1/profiles/{profile_id}/meal-plans?date_from=2026-05-30&date_to=2026-06-06
POST /api/v1/profiles/{profile_id}/meal-plans
PATCH /api/v1/profiles/{profile_id}/meal-plans/items/{item_id}
DELETE /api/v1/profiles/{profile_id}/meal-plans/items/{item_id}
```

Example meal plan:

```json
{
  "start_date": "2026-05-30",
  "end_date": "2026-06-01",
  "items": [
    {
      "plan_date": "2026-05-30",
      "meal_type": "breakfast",
      "meal_name": "Oatmeal with berries",
      "calories": 390,
      "protein_g": 18,
      "fat_g": 11,
      "carbs_g": 55,
      "notes": "Use lactose-free milk if needed"
    }
  ]
}
```

### Chat

```http
GET /api/v1/profiles/{profile_id}/chat/messages
POST /api/v1/profiles/{profile_id}/chat/messages
```

Example chat body:

```json
{
  "content": "Помоги оценить КБЖУ гречки с курицей"
}
```

The chat endpoint calls OpenAI from the backend, stores the user message and assistant reply, and returns both to the frontend. The frontend should never call OpenAI directly and should never store AI API keys.
