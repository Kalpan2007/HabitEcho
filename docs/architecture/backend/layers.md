# Backend Architecture - Layers Pattern

This document explains the layered architecture pattern used in the HabitEcho backend, specifically the Controller-Service-Route pattern.

## Layers Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                         │
│                        (Routes)                                 │
│  - HTTP method handling (GET, POST, PUT, DELETE)                │
│  - URL parameter extraction                                     │
│  - Query string parsing                                         │
│  - Delegates to controller                                      │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CONTROL LAYER                              │
│                    (Controllers)                                │
│  - Request validation (after middleware)                       │
│  - Extract and transform input data                             │
│  - Call appropriate service methods                            │
│  - Handle response formatting                                  │
│  - Error propagation                                            │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BUSINESS LAYER                             │
│                      (Services)                                  │
│  - Business logic and rules                                     │
│  - Data transformation                                         │
│  - Orchestrates multiple database operations                   │
│  - Returns domain entities                                      │
│  - Does NOT handle HTTP requests/responses                     │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA ACCESS LAYER                          │
│                   (Prisma/Repository)                            │
│  - Database operations                                         │
│  - Query building                                              │
│  - Entity retrieval and persistence                            │
│  - Transaction management                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Route Layer

Routes define the API contract and handle HTTP protocol specifics.

### Example: Habit Routes

```typescript
// src/routes/habit.routes.ts
import { Router } from 'express';
import { habitController, habitLogController } from '../controllers/index.js';
import { authenticate, validate } from '../middlewares/index.js';
import { createHabitSchema, getHabitsQuerySchema } from '../validations/index.js';

const router = Router();

// All habit routes require authentication
router.use(authenticate);

// POST /habits - Create new habit
router.post(
  '/',
  validate(createHabitSchema),  // Validate request body
  habitController.createHabit    // Delegate to controller
);

// GET /habits - List habits
router.get(
  '/',
  validate(getHabitsQuerySchema, 'query'),  // Validate query params
  habitController.getHabits
);

// GET /habits/:id - Get single habit
router.get(
  '/:id',
  validate(habitIdParamSchema, 'params'),  // Validate URL params
  habitController.getHabit
);

export default router;
```

### Route Responsibilities

1. **Define HTTP contract** - Methods, paths, parameters
2. **Apply middleware** - Auth, validation, rate limiting
3. **Delegate to controller** - Pass validated data
4. **Handle routing** - Mount sub-routes

---

## Controller Layer

Controllers handle the coordination between routes and services. They should be "thin" - minimal logic, mostly delegation.

### Example: Habit Controller

```typescript
// src/controllers/habit.controller.ts
import { Request, Response, NextFunction } from 'express';
import { habitService } from '../services/index.js';
import { successResponse, createdResponse } from '../utils/response.js';

export const habitController = {
  /**
   * Create a new habit
   * POST /habits
   */
  async createHabit(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract user ID from authenticated request
      const userId = req.user!.id;

      // Extract and transform data from request
      const habitData = {
        ...req.body,
        userId,
      };

      // Call service
      const habit = await habitService.create(habitData);

      // Format response
      return createdResponse(res, 'Habit created successfully', { habit });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all habits for user
   * GET /habits
   */
  async getHabits(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      // Extract pagination & filters from query
      const options = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        archived: req.query.archived === 'true',
        search: req.query.search as string,
        sortBy: req.query.sortBy as string || 'createdAt',
        sortOrder: req.query.sortOrder as 'asc' | 'desc' || 'desc',
      };

      const result = await habitService.getHabits(userId, options);

      return successResponse(res, 'Habits retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get single habit by ID
   * GET /habits/:id
   */
  async getHabit(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const habitId = req.params.id;

      const habit = await habitService.getHabitById(userId, habitId);

      if (!habit) {
        throw new NotFoundError('Habit not found');
      }

      return successResponse(res, 'Habit retrieved successfully', { habit });
    } catch (error) {
      next(error);
    }
  },

  // ... other methods
};
```

### Controller Responsibilities

1. **Extract data** - Get data from request (body, params, query)
2. **Get user context** - Extract user ID from authenticated request
3. **Call service** - Invoke appropriate service methods
4. **Format response** - Use response helpers to return data
5. **Error handling** - Pass errors to middleware via `next()`

### What Controllers Should NOT Do

- ❌ Business logic
- ❌ Database queries directly
- ❌ Complex data transformation
- ❌ Validation (that's middleware's job)
- ❌ Authentication (that's middleware's job)

---

## Service Layer

Services contain all business logic and orchestrate database operations.

### Example: Habit Service

```typescript
// src/services/habit.service.ts
import { PrismaClient, Habit, Prisma } from '@prisma/client';
import { AppError, NotFoundError } from '../utils/errors.js';

const prisma = new PrismaClient();

export const habitService = {
  /**
   * Create a new habit
   */
  async create(data: {
    userId: string;
    name: string;
    description?: string;
    schedule: { type: string; days: number[]; times: string[] };
    reminder?: { enabled: boolean; times: string[] };
    color?: string;
  }): Promise<Habit> {
    // Business logic: Validate user hasn't exceeded habit limit
    const userHabitCount = await prisma.habit.count({
      where: { userId: data.userId, archived: false },
    });

    if (userHabitCount >= 50) {
      throw new AppError('Maximum habit limit reached (50)', 400, 'HABIT_LIMIT_REACHED');
    }

    // Create habit in database
    const habit = await prisma.habit.create({
      data: {
        userId: data.userId,
        name: data.name,
        description: data.description,
        schedule: data.schedule as Prisma.JsonObject,
        reminder: data.reminder as Prisma.JsonObject,
        color: data.color || '#6366F1',
      },
    });

    return habit;
  },

  /**
   * Get habits with pagination
   */
  async getHabits(userId: string, options: {
    page: number;
    limit: number;
    archived: boolean;
    search?: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }) {
    const { page, limit, archived, search, sortBy, sortOrder } = options;
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {
      userId,
      archived,
      ...(search && {
        name: { contains: search, mode: 'insensitive' as const },
      }),
    };

    // Execute queries in parallel
    const [habits, total] = await Promise.all([
      prisma.habit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: { select: { logs: true } },
        },
      }),
      prisma.habit.count({ where }),
    ]);

    return {
      items: habits,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Get habit by ID with stats
   */
  async getHabitWithStats(userId: string, habitId: string) {
    const habit = await prisma.habit.findFirst({
      where: { id: habitId, userId },
      include: {
        logs: {
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
    });

    if (!habit) {
      throw new NotFoundError('Habit not found');
    }

    // Calculate stats from logs
    const stats = this.calculateStats(habit.logs);

    return { habit, stats };
  },

  /**
   * Calculate habit statistics from logs
   */
  private calculateStats(logs: any[]) {
    const completed = logs.filter(l => l.status === 'DONE').length;
    const partial = logs.filter(l => l.status === 'PARTIAL').length;
    const missed = logs.filter(l => l.status === 'MISSED').length;

    return {
      totalEntries: logs.length,
      completedEntries: completed,
      partialEntries: partial,
      missedEntries: missed,
      completionRate: logs.length > 0
        ? Math.round(((completed + partial * 0.5) / logs.length) * 100)
        : 0,
      currentStreak: this.calculateStreak(logs),
      longestStreak: this.calculateLongestStreak(logs),
    };
  },

  // ... other methods
};
```

### Service Responsibilities

1. **Business logic** - All domain-specific rules
2. **Data transformation** - Convert between formats
3. **Orchestration** - Combine multiple DB operations
4. **Validation** - Check business rules
5. **Return domain entities** - Raw database objects

### What Services Should NOT Do

- ❌ Handle HTTP requests/responses
- ❌ Know about authentication
- ❌ Validate input format (that's validation middleware)
- ❌ Format API responses (that's controller's job)

---

## Data Flow Example: Creating a Habit

```
STEP 1: Client sends POST request
─────────────────────────────────────────────────────────────
POST /api/v1/habits
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "name": "Morning Meditation",
  "schedule": {
    "type": "daily",
    "times": ["06:00"]
  }
}


STEP 2: Middleware processes request
─────────────────────────────────────────────────────────────
1. Rate limiter checks request count
2. Auth middleware validates JWT, adds user to req.user
3. Validate middleware parses body against createHabitSchema


STEP 3: Route delegates to controller
─────────────────────────────────────────────────────────────
router.post('/', validate(createHabitSchema), habitController.createHabit);

Controller extracts:
- userId = req.user.id (from JWT)
- name = req.body.name
- schedule = req.body.schedule


STEP 4: Controller calls service
─────────────────────────────────────────────────────────────
const habit = await habitService.create({
  userId: 'user-uuid',
  name: 'Morning Meditation',
  schedule: { type: 'daily', times: ['06:00'] }
});


STEP 5: Service executes business logic
─────────────────────────────────────────────────────────────
1. Check habit limit (max 50)
2. Check for duplicate names (optional)
3. Transform data if needed
4. Call Prisma to create record


STEP 6: Service returns to controller
─────────────────────────────────────────────────────────────
{
  id: 'habit-uuid',
  userId: 'user-uuid',
  name: 'Morning Meditation',
  schedule: { type: 'daily', times: ['06:00'] },
  createdAt: '2026-05-11T10:00:00Z'
}


STEP 7: Controller formats response
─────────────────────────────────────────────────────────────
return createdResponse(res, 'Habit created successfully', { habit });


STEP 8: Response sent to client
─────────────────────────────────────────────────────────────
HTTP/1.1 201 Created

{
  "success": true,
  "message": "Habit created successfully",
  "data": {
    "habit": { ... }
  }
}
```

---

## Best Practices

### Keep Controllers Thin

```typescript
// ✅ GOOD - Thin controller
async createHabit(req, res, next) {
  const habit = await habitService.create({
    userId: req.user.id,
    ...req.body
  });
  return createdResponse(res, 'Created', { habit });
}

// ❌ BAD - Fat controller with business logic
async createHabit(req, res, next) {
  const userId = req.user.id;

  // Business logic in controller - BAD!
  const count = await prisma.habit.count({ where: { userId, archived: false }});
  if (count >= 50) throw new Error('Limit reached');

  // More business logic
  const existing = await prisma.habit.findFirst({
    where: { userId, name: req.body.name }
  });

  // Even more logic
  const habit = await prisma.habit.create({ ... });
  // ...
}
```

### Use Response Helpers

```typescript
// ✅ GOOD
return successResponse(res, 'Habits retrieved', { habits, pagination });

// ❌ BAD
res.status(200).json({ success: true, data: { habits } });
```

### Type Everything

```typescript
// ✅ GOOD - Full type safety
interface CreateHabitInput {
  name: string;
  description?: string;
  schedule: {
    type: 'daily' | 'weekly' | 'custom';
    days: number[];
    times: string[];
  };
}

// ❌ BAD - No type safety
const createHabit = async (data) => { ... }
```

### Handle Errors Properly

```typescript
// ✅ GOOD - Let middleware handle errors
async createHabit(req, res, next) {
  try {
    const habit = await habitService.create({ ... });
    return createdResponse(res, 'Created', { habit });
  } catch (error) {
    next(error);  // Pass to error handler
  }
}

// ❌ BAD - Catching and handling manually
async createHabit(req, res) {
  try {
    const habit = await habitService.create({ ... });
    return createdResponse(res, 'Created', { habit });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}
```

---

**Next:** See [Middleware Explained](./middleware.md) for detailed middleware documentation.