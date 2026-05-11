# Habits API Documentation

All habit endpoints are prefixed with `/api/v1/habits`. These endpoints require authentication.

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/habits` | List all habits |
| POST | `/habits` | Create new habit |
| GET | `/habits/:id` | Get habit details |
| PUT | `/habits/:id` | Update habit |
| DELETE | `/habits/:id` | Delete habit |
| POST | `/habits/:id/log` | Log habit entry |
| PUT | `/habits/:id/log/:date` | Update entry |
| DELETE | `/habits/:id/log/:date` | Delete entry |
| GET | `/habits/:id/history` | Get habit history |

---

## GET /habits

Retrieve all habits for the authenticated user.

### Request

```http
GET /api/v1/habits
Authorization: Bearer <access_token>
```

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page (max 100) |
| archived | boolean | false | Include archived habits |
| search | string | - | Search by name |
| sortBy | string | createdAt | Sort field (createdAt, name, updatedAt) |
| sortOrder | string | desc | Sort direction (asc, desc) |

### Example Request

```http
GET /api/v1/habits?page=1&limit=10&search=meditation&sortBy=name&sortOrder=asc
```

### Success Response (200)

```typescript
{
  "success": true,
  "message": "Habits retrieved successfully",
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "Morning Meditation",
        "description": "30 min mindfulness practice",
        "schedule": {
          "type": "daily",
          "days": [0, 1, 2, 3, 4, 5, 6],
          "times": ["06:00"]
        },
        "reminder": {
          "enabled": true,
          "times": ["05:45"]
        },
        "color": "#6366F1",
        "archived": false,
        "createdAt": "2026-05-01T10:00:00Z",
        "updatedAt": "2026-05-01T10:00:00Z",
        "stats": {
          "currentStreak": 15,
          "completionRate": 87,
          "totalEntries": 45,
          "lastEntry": "2026-05-11"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

### Error Responses

**401 - Unauthorized**
```typescript
{
  "success": false,
  "message": "Authentication required",
  "error": { "code": "UNAUTHENTICATED" }
}
```

**400 - Invalid Query Parameters**
```typescript
{
  "success": false,
  "message": "Invalid query parameters",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": {
      "limit": ["Must be between 1 and 100"]
    }
  }
}
```

---

## POST /habits

Create a new habit.

### Request

```http
POST /api/v1/habits
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Request Body

```typescript
{
  "name": "Morning Meditation",
  "description": "30 min mindfulness practice",
  "schedule": {
    "type": "daily" | "weekly" | "custom",
    "days": [0, 1, 2, 3, 4, 5, 6],  // 0=Sunday, 6=Saturday (for weekly/custom)
    "times": ["06:00"]
  },
  "reminder": {
    "enabled": true,
    "times": ["05:45", "12:00"]
  },
  "color": "#6366F1"
}
```

### Request Body Schema

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| name | string | Yes | 1-100 characters |
| description | string | No | Max 500 characters |
| schedule.type | string | Yes | 'daily', 'weekly', or 'custom' |
| schedule.days | number[] | Yes | Array of 0-6 (for weekly/custom) |
| schedule.times | string[] | Yes | Array of HH:mm times |
| reminder.enabled | boolean | No | Default false |
| reminder.times | string[] | No | Array of HH:mm times |
| color | string | No | Hex color code, default '#6366F1' |

### Schedule Types Explained

1. **Daily:** Runs every day
   ```typescript
   {
     "type": "daily",
     "days": [0, 1, 2, 3, 4, 5, 6],  // Ignored
     "times": ["06:00"]
   }
   ```

2. **Weekly:** Runs on specific days of the week
   ```typescript
   {
     "type": "weekly",
     "days": [1, 3, 5],  // Mon, Wed, Fri
     "times": ["06:00"]
   }
   ```

3. **Custom:** Complex schedule (e.g., every 3 days)
   ```typescript
   {
     "type": "custom",
     "days": [0, 3, 6],  // Example: day 0, 3, 6 of cycle
     "times": ["06:00"]
   }
   ```

### Success Response (201)

```typescript
{
  "success": true,
  "message": "Habit created successfully",
  "data": {
    "habit": {
      "id": "uuid",
      "name": "Morning Meditation",
      "description": "30 min mindfulness practice",
      "schedule": {
        "type": "daily",
        "days": [0, 1, 2, 3, 4, 5, 6],
        "times": ["06:00"]
      },
      "reminder": {
        "enabled": true,
        "times": ["05:45"]
      },
      "color": "#6366F1",
      "archived": false,
      "createdAt": "2026-05-11T10:00:00Z",
      "updatedAt": "2026-05-11T10:00:00Z"
    }
  }
}
```

### Email Verification Requirement

This endpoint requires email verification. If user hasn't verified email:
```typescript
{
  "success": false,
  "message": "Please verify your email first",
  "error": { "code": "EMAIL_NOT_VERIFIED" }
}
```

### Error Responses

**400 - Validation Error**
```typescript
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": {
      "name": ["Name is required"],
      "schedule.type": ["Invalid schedule type"]
    }
  }
}
```

---

## GET /habits/:id

Get details of a specific habit.

### Request

```http
GET /api/v1/habits/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <access_token>
```

### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Habit UUID |

### Success Response (200)

```typescript
{
  "success": true,
  "message": "Habit retrieved successfully",
  "data": {
    "habit": {
      "id": "uuid",
      "name": "Morning Meditation",
      "description": "30 min mindfulness practice",
      "schedule": {
        "type": "daily",
        "days": [0, 1, 2, 3, 4, 5, 6],
        "times": ["06:00"]
      },
      "reminder": {
        "enabled": true,
        "times": ["05:45"]
      },
      "color": "#6366F1",
      "archived": false,
      "createdAt": "2026-05-01T10:00:00Z",
      "updatedAt": "2026-05-01T10:00:00Z",
      "stats": {
        "currentStreak": 15,
        "longestStreak": 45,
        "completionRate": 87,
        "totalEntries": 45,
        "completedEntries": 39,
        "partialEntries": 3,
        "missedEntries": 3,
        "lastEntry": "2026-05-11",
        "nextScheduled": "2026-05-12T06:00:00Z"
      },
      "todayEntry": {
        "id": "entry-uuid",
        "status": "DONE",
        "value": 100,
        "notes": "Felt great!"
      }
    }
  }
}
```

### Error Responses

**404 - Habit Not Found**
```typescript
{
  "success": false,
  "message": "Habit not found",
  "error": { "code": "HABIT_NOT_FOUND" }
}
```

**403 - Access Denied**
```typescript
{
  "success": false,
  "message": "You don't have access to this habit",
  "error": { "code": "FORBIDDEN" }
}
```

---

## PUT /habits/:id

Update an existing habit.

### Request

```http
PUT /api/v1/habits/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Request Body

All fields are optional - only provided fields will be updated:

```typescript
{
  "name": "Evening Meditation",
  "description": "Updated description",
  "schedule": {
    "type": "weekly",
    "days": [1, 3, 5],
    "times": ["20:00"]
  },
  "reminder": {
    "enabled": true,
    "times": ["19:45"]
  },
  "color": "#8B5CF6"
}
```

### Success Response (200)

```typescript
{
  "success": true,
  "message": "Habit updated successfully",
  "data": {
    "habit": {
      "id": "uuid",
      "name": "Evening Meditation",
      "description": "Updated description",
      "schedule": {
        "type": "weekly",
        "days": [1, 3, 5],
        "times": ["20:00"]
      },
      "reminder": { ... },
      "color": "#8B5CF6",
      "archived": false,
      "createdAt": "2026-05-01T10:00:00Z",
      "updatedAt": "2026-05-11T15:30:00Z"
    }
  }
}
```

### Partial Update Example

Update only the name:
```typescript
{
  "name": "New Name"
}
```

---

## DELETE /habits/:id

Delete a habit and all its entries.

### Request

```http
DELETE /api/v1/habits/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <access_token>
```

### Success Response (204)

No content returned on successful deletion.

### Error Responses

**404 - Not Found**
```typescript
{
  "success": false,
  "message": "Habit not found",
  "error": { "code": "HABIT_NOT_FOUND" }
}
```

### Warning

This action is irreversible. All habit logs associated with this habit will also be deleted.

---

## POST /habits/:id/log

Log an entry for a habit (mark as done/completed).

### Request

```http
POST /api/v1/habits/550e8400-e29b-41d4-a716-446655440000/log
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Request Body

```typescript
{
  "date": "2026-05-11",  // Optional, defaults to today
  "status": "DONE" | "PARTIAL" | "MISSED",
  "value": 100,  // 0-100 percentage
  "notes": "Optional notes about this entry"
}
```

### Request Body Schema

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| date | string | No | YYYY-MM-DD format, defaults to today |
| status | string | Yes | 'DONE', 'PARTIAL', or 'MISSED' |
| value | number | No | 0-100, defaults based on status |
| notes | string | No | Max 500 characters |

### Status Values

- **DONE:** Habit completed (value defaults to 100)
- **PARTIAL:** Partially completed (value defaults to 50)
- **MISSED:** Habit missed (value defaults to 0)

### Success Response (201)

```typescript
{
  "success": true,
  "message": "Habit logged successfully",
  "data": {
    "log": {
      "id": "uuid",
      "habitId": "habit-uuid",
      "date": "2026-05-11",
      "status": "DONE",
      "value": 100,
      "notes": "Optional notes",
      "createdAt": "2026-05-11T18:00:00Z",
      "updatedAt": "2026-05-11T18:00:00Z"
    }
  }
}
```

### Duplicate Entry Handling

If an entry for the date already exists:
```typescript
{
  "success": false,
  "message": "Entry already exists for this date",
  "error": {
    "code": "DUPLICATE_ENTRY",
    "details": {
      "existingEntryId": "uuid"
    }
  }
}
```

Use PUT to update existing entry.

---

## PUT /habits/:id/log/:date

Update an existing habit entry.

### Request

```http
PUT /api/v1/habits/550e8400-e29b-41d4-a716-446655440000/log/2026-05-11
Authorization: Bearer <access_token>
Content-Type: application/json
```

### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Habit UUID |
| date | string | Entry date (YYYY-MM-DD) |

### Request Body

```typescript
{
  "status": "PARTIAL",
  "value": 75,
  "notes": "Updated notes"
}
```

### Success Response (200)

```typescript
{
  "success": true,
  "message": "Habit entry updated successfully",
  "data": {
    "log": {
      "id": "uuid",
      "habitId": "habit-uuid",
      "date": "2026-05-11",
      "status": "PARTIAL",
      "value": 75,
      "notes": "Updated notes",
      "createdAt": "2026-05-11T18:00:00Z",
      "updatedAt": "2026-05-11T20:00:00Z"
    }
  }
}
```

---

## DELETE /habits/:id/log/:date

Delete a habit entry.

### Request

```http
DELETE /api/v1/habits/550e8400-e29b-41d4-a716-446655440000/log/2026-05-11
Authorization: Bearer <access_token>
```

### Success Response (204)

No content returned.

---

## GET /habits/:id/history

Retrieve historical entries for a habit.

### Request

```http
GET /api/v1/habits/550e8400-e29b-41d4-a716-446655440000/history
Authorization: Bearer <access_token>
```

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| startDate | string | - | Start date (YYYY-MM-DD) |
| endDate | string | - | End date (YYYY-MM-DD) |
| page | number | 1 | Page number |
| limit | number | 30 | Items per page |

### Example Request

```http
GET /api/v1/habits/550e8400-e29b-41d4-a716-446655440000/history?startDate=2026-01-01&endDate=2026-05-11&limit=30
```

### Success Response (200)

```typescript
{
  "success": true,
  "message": "Habit history retrieved successfully",
  "data": {
    "habit": {
      "id": "uuid",
      "name": "Morning Meditation"
    },
    "entries": [
      {
        "date": "2026-05-11",
        "status": "DONE",
        "value": 100,
        "notes": "Great session"
      },
      {
        "date": "2026-05-10",
        "status": "DONE",
        "value": 100,
        "notes": null
      },
      {
        "date": "2026-05-09",
        "status": "MISSED",
        "value": 0,
        "notes": "Slept in"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 30,
      "total": 150,
      "totalPages": 5
    },
    "stats": {
      "totalEntries": 150,
      "completed": 120,
      "partial": 15,
      "missed": 15,
      "completionRate": 80,
      "currentStreak": 5,
      "longestStreak": 45
    }
  }
}
```

---

## Legacy Endpoints

The following endpoints are supported for backward compatibility:

| Legacy Path | New Path | Notes |
|-------------|----------|-------|
| POST /habits/:id/entry | POST /habits/:id/log | Same functionality |
| PUT /habits/:id/entry/:date | PUT /habits/:id/log/:date | Same functionality |

---

## Optimistic Updates

The frontend uses optimistic updates for better UX. When logging a habit:

1. UI immediately shows the entry as completed
2. Request is sent to server
3. On success: cache is updated with actual response
4. On error: UI rolls back to previous state

---

**Next:** See [Performance API](./performance.md) for analytics endpoints.