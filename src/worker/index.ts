import { Hono } from "hono";
import {
  exchangeCodeForSessionToken,
  getOAuthRedirectUrl,
  authMiddleware,
  deleteSession,
  MOCHA_SESSION_TOKEN_COOKIE_NAME,
} from "@getmocha/users-service/backend";
import { getCookie, setCookie } from "hono/cookie";
import type { MochaUser } from "@getmocha/users-service/shared";

const app = new Hono<{ Bindings: Env }>();

// OAuth endpoints
app.get('/api/oauth/google/redirect_url', async (c) => {
  const redirectUrl = await getOAuthRedirectUrl('google', {
    apiUrl: (c.env as any).MOCHA_USERS_SERVICE_API_URL,
    apiKey: (c.env as any).MOCHA_USERS_SERVICE_API_KEY,
  });

  return c.json({ redirectUrl }, 200);
});

app.post("/api/sessions", async (c) => {
  const body = await c.req.json();

  if (!body.code) {
    return c.json({ error: "No authorization code provided" }, 400);
  }

  const sessionToken = await exchangeCodeForSessionToken(body.code, {
    apiUrl: (c.env as any).MOCHA_USERS_SERVICE_API_URL,
    apiKey: (c.env as any).MOCHA_USERS_SERVICE_API_KEY,
  });

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 60 * 24 * 60 * 60,
  });

  return c.json({ success: true }, 200);
});

app.get("/api/users/me", authMiddleware, async (c) => {
  const user = c.get("user") as MochaUser;
  
  // Check if user exists in our database, if not create them
  const existingUser = await c.env.DB.prepare(
    "SELECT * FROM users WHERE id = ?"
  ).bind(user.id).first();

  if (!existingUser) {
    const name = user.google_user_data.given_name || user.google_user_data.name || user.email.split('@')[0];
    await c.env.DB.prepare(
      "INSERT INTO users (id, name, email) VALUES (?, ?, ?)"
    ).bind(user.id, name, user.email).run();
  }

  return c.json(user);
});

app.get('/api/logout', async (c) => {
  const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);

  if (typeof sessionToken === 'string') {
    await deleteSession(sessionToken, {
      apiUrl: (c.env as any).MOCHA_USERS_SERVICE_API_URL,
      apiKey: (c.env as any).MOCHA_USERS_SERVICE_API_KEY,
    });
  }

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, '', {
    httpOnly: true,
    path: '/',
    sameSite: 'none',
    secure: true,
    maxAge: 0,
  });

  return c.json({ success: true }, 200);
});

// User settings endpoints
app.get("/api/settings", authMiddleware, async (c) => {
  const user = c.get("user") as MochaUser;
  
  const settings = await c.env.DB.prepare(
    "SELECT theme, primary_color, secondary_color, font_family, notifications_enabled FROM users WHERE id = ?"
  ).bind(user.id).first();

  return c.json(settings);
});

app.patch("/api/settings", authMiddleware, async (c) => {
  const user = c.get("user") as MochaUser;
  const body = await c.req.json();

  const updates: string[] = [];
  const values: any[] = [];

  if (body.theme !== undefined) {
    updates.push("theme = ?");
    values.push(body.theme);
  }
  if (body.primary_color !== undefined) {
    updates.push("primary_color = ?");
    values.push(body.primary_color);
  }
  if (body.secondary_color !== undefined) {
    updates.push("secondary_color = ?");
    values.push(body.secondary_color);
  }
  if (body.font_family !== undefined) {
    updates.push("font_family = ?");
    values.push(body.font_family);
  }
  if (body.notifications_enabled !== undefined) {
    updates.push("notifications_enabled = ?");
    values.push(body.notifications_enabled ? 1 : 0);
  }

  if (updates.length > 0) {
    updates.push("updated_at = CURRENT_TIMESTAMP");
    values.push(user.id);

    await c.env.DB.prepare(
      `UPDATE users SET ${updates.join(", ")} WHERE id = ?`
    ).bind(...values).run();
  }

  return c.json({ success: true });
});

// Routines endpoints
app.get("/api/routines", authMiddleware, async (c) => {
  const user = c.get("user") as MochaUser;
  
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM routines WHERE user_id = ? AND is_active = 1 ORDER BY created_at DESC"
  ).bind(user.id).all();

  return c.json(results);
});

app.post("/api/routines", authMiddleware, async (c) => {
  const user = c.get("user") as MochaUser;
  const body = await c.req.json();

  const result = await c.env.DB.prepare(
    "INSERT INTO routines (user_id, title, category, icon, reminder_time) VALUES (?, ?, ?, ?, ?)"
  ).bind(user.id, body.title, body.category, body.icon, body.reminder_time || null).run();

  return c.json({ id: result.meta.last_row_id }, 201);
});

app.patch("/api/routines/:id", authMiddleware, async (c) => {
  const user = c.get("user") as MochaUser;
  const id = c.req.param("id");
  const body = await c.req.json();

  const updates: string[] = [];
  const values: any[] = [];

  if (body.title !== undefined) {
    updates.push("title = ?");
    values.push(body.title);
  }
  if (body.category !== undefined) {
    updates.push("category = ?");
    values.push(body.category);
  }
  if (body.icon !== undefined) {
    updates.push("icon = ?");
    values.push(body.icon);
  }
  if (body.reminder_time !== undefined) {
    updates.push("reminder_time = ?");
    values.push(body.reminder_time);
  }
  if (body.is_active !== undefined) {
    updates.push("is_active = ?");
    values.push(body.is_active ? 1 : 0);
  }

  if (updates.length > 0) {
    updates.push("updated_at = CURRENT_TIMESTAMP");
    values.push(user.id, id);

    await c.env.DB.prepare(
      `UPDATE routines SET ${updates.join(", ")} WHERE user_id = ? AND id = ?`
    ).bind(...values).run();
  }

  return c.json({ success: true });
});

app.delete("/api/routines/:id", authMiddleware, async (c) => {
  const user = c.get("user") as MochaUser;
  const id = c.req.param("id");

  await c.env.DB.prepare(
    "UPDATE routines SET is_active = 0 WHERE user_id = ? AND id = ?"
  ).bind(user.id, id).run();

  return c.json({ success: true });
});

// Routine completions
app.post("/api/routines/:id/complete", authMiddleware, async (c) => {
  const user = c.get("user") as MochaUser;
  const id = c.req.param("id");
  const today = new Date().toISOString().split('T')[0];

  // Check if already completed today
  const existing = await c.env.DB.prepare(
    "SELECT id FROM routine_completions WHERE routine_id = ? AND user_id = ? AND completed_date = ?"
  ).bind(id, user.id, today).first();

  if (existing) {
    return c.json({ error: "Already completed today" }, 400);
  }

  await c.env.DB.prepare(
    "INSERT INTO routine_completions (routine_id, user_id, completed_date, points) VALUES (?, ?, ?, 10)"
  ).bind(id, user.id, today).run();

  return c.json({ success: true, points: 10 });
});

app.get("/api/routines/completions", authMiddleware, async (c) => {
  const user = c.get("user") as MochaUser;
  const days = c.req.query("days") || "30";

  const { results } = await c.env.DB.prepare(
    `SELECT rc.*, r.title, r.category 
     FROM routine_completions rc 
     JOIN routines r ON rc.routine_id = r.id 
     WHERE rc.user_id = ? 
     AND rc.completed_date >= date('now', '-' || ? || ' days')
     ORDER BY rc.completed_date DESC`
  ).bind(user.id, days).all();

  return c.json(results);
});

// Goals endpoints
app.get("/api/goals", authMiddleware, async (c) => {
  const user = c.get("user") as MochaUser;
  
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM goals WHERE user_id = ? AND is_active = 1 ORDER BY created_at DESC"
  ).bind(user.id).all();

  return c.json(results);
});

app.post("/api/goals", authMiddleware, async (c) => {
  const user = c.get("user") as MochaUser;
  const body = await c.req.json();

  const result = await c.env.DB.prepare(
    "INSERT INTO goals (user_id, title, description, icon, target_frequency) VALUES (?, ?, ?, ?, ?)"
  ).bind(user.id, body.title, body.description || null, body.icon, body.target_frequency || 7).run();

  return c.json({ id: result.meta.last_row_id }, 201);
});

app.patch("/api/goals/:id", authMiddleware, async (c) => {
  const user = c.get("user") as MochaUser;
  const id = c.req.param("id");
  const body = await c.req.json();

  const updates: string[] = [];
  const values: any[] = [];

  if (body.title !== undefined) {
    updates.push("title = ?");
    values.push(body.title);
  }
  if (body.description !== undefined) {
    updates.push("description = ?");
    values.push(body.description);
  }
  if (body.icon !== undefined) {
    updates.push("icon = ?");
    values.push(body.icon);
  }
  if (body.target_frequency !== undefined) {
    updates.push("target_frequency = ?");
    values.push(body.target_frequency);
  }
  if (body.is_active !== undefined) {
    updates.push("is_active = ?");
    values.push(body.is_active ? 1 : 0);
  }

  if (updates.length > 0) {
    updates.push("updated_at = CURRENT_TIMESTAMP");
    values.push(user.id, id);

    await c.env.DB.prepare(
      `UPDATE goals SET ${updates.join(", ")} WHERE user_id = ? AND id = ?`
    ).bind(...values).run();
  }

  return c.json({ success: true });
});

app.delete("/api/goals/:id", authMiddleware, async (c) => {
  const user = c.get("user") as MochaUser;
  const id = c.req.param("id");

  await c.env.DB.prepare(
    "UPDATE goals SET is_active = 0 WHERE user_id = ? AND id = ?"
  ).bind(user.id, id).run();

  return c.json({ success: true });
});

// Goal progress
app.post("/api/goals/:id/progress", authMiddleware, async (c) => {
  const user = c.get("user") as MochaUser;
  const id = c.req.param("id");
  const today = new Date().toISOString().split('T')[0];

  // Check if already marked today
  const existing = await c.env.DB.prepare(
    "SELECT id FROM goal_progress WHERE goal_id = ? AND user_id = ? AND completed_date = ?"
  ).bind(id, user.id, today).first();

  if (existing) {
    return c.json({ error: "Already marked today" }, 400);
  }

  await c.env.DB.prepare(
    "INSERT INTO goal_progress (goal_id, user_id, completed_date) VALUES (?, ?, ?)"
  ).bind(id, user.id, today).run();

  return c.json({ success: true });
});

app.delete("/api/goals/:id/progress", authMiddleware, async (c) => {
  const user = c.get("user") as MochaUser;
  const id = c.req.param("id");
  const today = new Date().toISOString().split('T')[0];

  await c.env.DB.prepare(
    "DELETE FROM goal_progress WHERE goal_id = ? AND user_id = ? AND completed_date = ?"
  ).bind(id, user.id, today).run();

  return c.json({ success: true });
});

app.get("/api/goals/:id/progress", authMiddleware, async (c) => {
  const user = c.get("user") as MochaUser;
  const id = c.req.param("id");
  const days = c.req.query("days") || "30";

  const { results } = await c.env.DB.prepare(
    `SELECT * FROM goal_progress 
     WHERE goal_id = ? AND user_id = ? 
     AND completed_date >= date('now', '-' || ? || ' days')
     ORDER BY completed_date DESC`
  ).bind(id, user.id, days).all();

  return c.json(results);
});

// Diary entries
app.get("/api/diary", authMiddleware, async (c) => {
  const user = c.get("user") as MochaUser;
  const limit = c.req.query("limit") || "30";

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM diary_entries WHERE user_id = ? ORDER BY entry_date DESC LIMIT ?"
  ).bind(user.id, limit).all();

  return c.json(results);
});

app.post("/api/diary", authMiddleware, async (c) => {
  const user = c.get("user") as MochaUser;
  const body = await c.req.json();
  const today = new Date().toISOString().split('T')[0];

  // Check if entry exists for today
  const existing = await c.env.DB.prepare(
    "SELECT id FROM diary_entries WHERE user_id = ? AND entry_date = ?"
  ).bind(user.id, today).first();

  if (existing) {
    await c.env.DB.prepare(
      "UPDATE diary_entries SET content = ?, mood = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).bind(body.content, body.mood || null, existing.id).run();

    return c.json({ id: existing.id });
  }

  const result = await c.env.DB.prepare(
    "INSERT INTO diary_entries (user_id, content, entry_date, mood) VALUES (?, ?, ?, ?)"
  ).bind(user.id, body.content, today, body.mood || null).run();

  return c.json({ id: result.meta.last_row_id }, 201);
});

// Achievements
app.get("/api/achievements", authMiddleware, async (c) => {
  const user = c.get("user") as MochaUser;
  
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM achievements WHERE user_id = ? ORDER BY earned_date DESC"
  ).bind(user.id).all();

  return c.json(results);
});

app.post("/api/achievements", authMiddleware, async (c) => {
  const user = c.get("user") as MochaUser;
  const body = await c.req.json();
  const today = new Date().toISOString().split('T')[0];

  const result = await c.env.DB.prepare(
    "INSERT INTO achievements (user_id, title, description, icon, earned_date) VALUES (?, ?, ?, ?, ?)"
  ).bind(user.id, body.title, body.description || null, body.icon || null, today).run();

  return c.json({ id: result.meta.last_row_id }, 201);
});

// Dashboard stats
app.get("/api/dashboard", authMiddleware, async (c) => {
  const user = c.get("user") as MochaUser;
  const today = new Date().toISOString().split('T')[0];

  // Get today's completed routines
  const completedRoutines = await c.env.DB.prepare(
    `SELECT COUNT(*) as count FROM routine_completions 
     WHERE user_id = ? AND completed_date = ?`
  ).bind(user.id, today).first();

  // Get total routines
  const totalRoutines = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM routines WHERE user_id = ? AND is_active = 1"
  ).bind(user.id).first();

  // Get today's completed goals
  const completedGoals = await c.env.DB.prepare(
    `SELECT COUNT(*) as count FROM goal_progress 
     WHERE user_id = ? AND completed_date = ?`
  ).bind(user.id, today).first();

  // Get total goals
  const totalGoals = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM goals WHERE user_id = ? AND is_active = 1"
  ).bind(user.id).first();

  // Get total points this week
  const weekPoints = await c.env.DB.prepare(
    `SELECT COALESCE(SUM(points), 0) as total FROM routine_completions 
     WHERE user_id = ? AND completed_date >= date('now', '-7 days')`
  ).bind(user.id).first();

  // Get achievement count
  const achievementCount = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM achievements WHERE user_id = ?"
  ).bind(user.id).first();

  return c.json({
    routines: {
      completed: completedRoutines?.count || 0,
      total: totalRoutines?.count || 0
    },
    goals: {
      completed: completedGoals?.count || 0,
      total: totalGoals?.count || 0
    },
    weekPoints: weekPoints?.total || 0,
    achievements: achievementCount?.count || 0
  });
});

export default app;
