# Performance API Documentation

Performance endpoints provide analytics and insights for habit tracking. All endpoints require authentication.

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/performance/summary` | Overall user performance |
| GET | `/performance/habit/:id` | Specific habit analytics |

---

## GET /performance/summary

Retrieve overall performance summary for the authenticated user.

### Request

```http
GET /api/v1/performance/summary
Authorization: Bearer <access_token>
```

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| period | string | 'month' | Analysis period (week, month, year) |
| startDate | string | - | Custom start date |
| endDate | string | - | Custom end date |

### Example Request

```http
GET /api/v1/performance/summary?period=month&startDate=2026-01-01&endDate=2026-05-11
```

### Success Response (200)

```typescript
{
  "success": true,
  "message": "Performance summary retrieved successfully",
  "data": {
    "summary": {
      "totalHabits": 5,
      "activeHabits": 4,
      "archivedHabits": 1,
      "overallCompletionRate": 78,
      "currentStreak": 12,
      "longestStreak": 30,
      "todayCompletion": {
        "completed": 3,
        "total": 4,
        "percentage": 75
      },
      "rollingAverages": {
        "last7Days": 82,
        "last14Days": 79,
        "last30Days": 75
      },
      "momentum": {
        "current": 82,
        "previous": 75,
        "trend": "UP" | "DOWN" | "STABLE",
        "percentageChange": 9.33
      },
      "streakBreakdown": {
        "activeStreaks": 3,
        "atRiskStreaks": 1,
        "brokenStreaks": 2,
        "longestActiveStreak": 15
      },
      "completionByDay": {
        "0": 72,  // Sunday
        "1": 85,  // Monday
        "2": 80,  // Tuesday
        "3": 78,  // Wednesday
        "4": 82,  // Thursday
        "5": 75,  // Friday
        "6": 70   // Saturday
      },
      "topPerformingHabits": [
        {
          "habitId": "uuid",
          "name": "Morning Meditation",
          "completionRate": 95
        }
      ],
      "needsAttention": [
        {
          "habitId": "uuid",
          "name": "Evening Run",
          "completionRate": 45,
          "daysSinceCompletion": 5
        }
      ]
    }
  }
}
```

### Response Fields Explained

| Field | Description |
|-------|-------------|
| totalHabits | Total habits (active + archived) |
| activeHabits | Currently active (non-archived) habits |
| overallCompletionRate | Average completion across all habits (0-100) |
| currentStreak | Consecutive days with at least one habit completed |
| longestStreak | Longest streak ever achieved |
| todayCompletion | Today's completion stats |
| rollingAverages | Completion rates for last 7, 14, 30 days |
| momentum | Trend analysis showing if user is improving |
| completionByDay | Average completion rate by day of week (0-6) |

### Momentum Calculation

Momentum is calculated using a weighted formula:

```
momentum = (recentCompletion * 0.6) + (streakScore * 0.3) + (consistencyScore * 0.1)

where:
- recentCompletion = average of last 7 days
- streakScore = normalized current streak (capped at 30)
- consistencyScore = standard deviation inverse (higher = more consistent)
```

### Trend Determination

| Trend | Condition |
|-------|-----------|
| UP | momentum > previous + 5 |
| DOWN | momentum < previous - 5 |
| STABLE | -5 <= momentum change <= 5 |

---

## GET /performance/habit/:id

Retrieve detailed performance analytics for a specific habit.

### Request

```http
GET /api/v1/performance/habit/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <access_token>
```

### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Habit UUID |

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| period | string | 'month' | Analysis period |
| startDate | string | - | Custom start date |
| endDate | string | - | Custom end date |

### Success Response (200)

```typescript
{
  "success": true,
  "message": "Habit performance retrieved successfully",
  "data": {
    "performance": {
      "habitId": "uuid",
      "habitName": "Morning Meditation",
      "description": "30 min mindfulness practice",
      "color": "#6366F1",
      "schedule": {
        "type": "daily",
        "times": ["06:00"]
      },
      "completionRate": 85,
      "currentStreak": 7,
      "longestStreak": 21,
      "totalScheduledDays": 45,
      "totalEntries": 45,
      "completedEntries": 38,
      "partialEntries": 4,
      "missedEntries": 3,
      "rollingAverages": {
        "last7Days": 90,
        "last14Days": 85,
        "last30Days": 82
      },
      "heatmapData": [
        { "date": "2026-05-11", "value": 100, "status": "DONE" },
        { "date": "2026-05-10", "value": 100, "status": "DONE" },
        { "date": "2026-05-09", "value": 0, "status": "MISSED" },
        { "date": "2026-05-08", "value": 100, "status": "DONE" },
        { "date": "2026-05-07", "value": 50, "status": "PARTIAL" }
      ],
      "momentum": {
        "current": 90,
        "previous": 80,
        "trend": "UP",
        "percentageChange": 12.5
      },
      "weeklyPattern": {
        "0": 80,  // Sunday
        "1": 90,  // Monday
        "2": 85,  // Tuesday
        "3": 88,  // Wednesday
        "4": 92,  // Thursday
        "5": 85,  // Friday
        "6": 75   // Saturday
      },
      "monthlyProgress": [
        { "month": "2026-01", "completionRate": 78 },
        { "month": "2026-02", "completionRate": 82 },
        { "month": "2026-03", "completionRate": 85 },
        { "month": "2026-04", "completionRate": 80 },
        { "month": "2026-05", "completionRate": 85 }
      ],
      "bestStreak": {
        "startDate": "2026-03-01",
        "endDate": "2026-03-21",
        "days": 21
      },
      "recentEntries": [
        { "date": "2026-05-11", "status": "DONE", "value": 100 },
        { "date": "2026-05-10", "status": "DONE", "value": 100 },
        { "date": "2026-05-09", "status": "MISSED", "value": 0 }
      ],
      "upcomingScheduled": [
        { "date": "2026-05-12", "time": "06:00" },
        { "date": "2026-05-13", "time": "06:00" }
      ]
    }
  }
}
```

### Response Fields Explained

| Field | Description |
|-------|-------------|
| completionRate | Percentage of scheduled days completed (0-100) |
| currentStreak | Current consecutive completion streak |
| longestStreak | Best streak ever for this habit |
| heatmapData | Daily values for visualization (last 90 days) |
| weeklyPattern | Average completion by day of week |
| monthlyProgress | Month-by-month completion trend |
| bestStreak | Information about longest streak |
| upcomingScheduled | Next scheduled dates/times |

### Heatmap Data Structure

Each heatmap entry contains:

```typescript
{
  "date": "YYYY-MM-DD",
  "value": number,      // 0-100
  "status": "DONE" | "PARTIAL" | "MISSED" | "SCHEDULED"
}
```

### Color Coding for Heatmap

| Value Range | Color | Status |
|-------------|-------|--------|
| 100 | Green | Complete |
| 75-99 | Light Green | Mostly complete |
| 50-74 | Yellow | Partial |
| 1-49 | Orange | Almost missed |
| 0 | Red | Missed |
| null | Gray | Not scheduled |

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

## Performance Calculation Details

### Streak Calculation

```
A streak is defined as consecutive days where:
- status = 'DONE' (value >= 100)
- OR status = 'PARTIAL' (value >= 50) for habits with partial completion allowed

Streak breaks when:
- status = 'MISSED'
- OR status = 'PARTIAL' with value < 50 (strict mode)
- OR no entry for a scheduled day
```

### Completion Rate Formula

```
completionRate = (completedEntries / totalScheduledDays) * 100

where:
- completedEntries = entries where status = 'DONE' or 'PARTIAL'
- totalScheduledDays = days where habit was scheduled to run
```

### At-Risk Streak Detection

A streak is "at risk" when:
- No entry for the current day (past scheduled time)
- OR completion rate in last 7 days < 50%

---

## Frontend Implementation Notes

### Using Performance Data

```typescript
// Fetch overall performance
const { data } = useQuery({
  queryKey: ['performance', 'summary'],
  queryFn: () => fetch('/api/v1/performance/summary').then(res => res.json())
});

// Fetch specific habit performance
const { data } = useQuery({
  queryKey: ['performance', 'habit', habitId],
  queryFn: () => fetch(`/api/v1/performance/habit/${habitId}`).then(res => res.json())
});
```

### Caching Strategy

- Summary: Cache for 5 minutes, stale while revalidating
- Habit Performance: Cache for 2 minutes
- Invalidate on habit log create/update/delete

---

**Next:** See [Error Handling](./errors.md) for complete error codes and responses.