import z from "zod";

export const RoutineSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  title: z.string(),
  category: z.string(),
  icon: z.string(),
  reminder_time: z.string().nullable(),
  is_active: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const GoalSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  icon: z.string(),
  target_frequency: z.number(),
  is_active: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const DiaryEntrySchema = z.object({
  id: z.number(),
  user_id: z.string(),
  content: z.string(),
  entry_date: z.string(),
  mood: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const AchievementSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  icon: z.string().nullable(),
  earned_date: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const UserSettingsSchema = z.object({
  theme: z.string(),
  primary_color: z.string(),
  secondary_color: z.string(),
  font_family: z.string(),
  notifications_enabled: z.number(),
});

export const DashboardStatsSchema = z.object({
  routines: z.object({
    completed: z.number(),
    total: z.number(),
  }),
  goals: z.object({
    completed: z.number(),
    total: z.number(),
  }),
  weekPoints: z.number(),
  achievements: z.number(),
});

export type Routine = z.infer<typeof RoutineSchema>;
export type Goal = z.infer<typeof GoalSchema>;
export type DiaryEntry = z.infer<typeof DiaryEntrySchema>;
export type Achievement = z.infer<typeof AchievementSchema>;
export type UserSettings = z.infer<typeof UserSettingsSchema>;
export type DashboardStats = z.infer<typeof DashboardStatsSchema>;
