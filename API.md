# API Contract

Base URL:

```text
http://127.0.0.1:8000/api/v1
```

All responses are JSON. Interactive OpenAPI documentation is available at `/docs`.

## Enums

Goals:

```text
weight_loss | muscle_gain | maintenance
```

Sex:

```text
female | male
```

Activity levels:

```text
sedentary | light | moderate | active | very_active
```

Meal types:

```text
breakfast | lunch | dinner | snack
```

## Frontend Flow

1. Load onboarding options:

```http
GET /references/onboarding
```

2. Create profile after onboarding:

```http
POST /profiles
```

3. Show profile tab:

```http
GET /profiles/{profile_id}
GET /profiles/{profile_id}/nutrition-targets
```

4. Show diary/chat tab:

```http
GET /profiles/{profile_id}/chat/messages
POST /profiles/{profile_id}/chat/messages
GET /profiles/{profile_id}/diary?entry_date=YYYY-MM-DD
POST /profiles/{profile_id}/diary
```

5. Show meal plan tab:

```http
GET /profiles/{profile_id}/meal-plans?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD
POST /profiles/{profile_id}/meal-plans
PATCH /profiles/{profile_id}/meal-plans/items/{item_id}
```
