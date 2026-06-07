import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";

import { createRouter, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { habits, users } from "@db/schema";

function isToday(date?: Date | null) {
  if (!date) return false;

  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

export const habitRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();

    return db
      .select()
      .from(habits)
      .where(eq(habits.userId, ctx.user.id))
      .orderBy(desc(habits.createdAt));
  }),

  create: authedQuery
    .input(
      z.object({
        title: z.string().min(2).max(100),
        description: z.string().optional(),
        goalDays: z.number().min(1).max(365),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const [created] = await db
        .insert(habits)
        .values({
          userId: ctx.user.id,
          title: input.title,
          description: input.description,
          goalDays: input.goalDays,
          source: "student",
        })
        .returning({ id: habits.id });

      return {
        success: true,
        id: created.id,
      };
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(2).max(100),
        description: z.string().optional(),
        goalDays: z.number().min(1).max(365),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      await db
        .update(habits)
        .set({
          title: input.title,
          description: input.description,
          goalDays: input.goalDays,
        })
        .where(and(eq(habits.id, input.id), eq(habits.userId, ctx.user.id)));

      return { success: true };
    }),

  delete: authedQuery
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      await db
        .delete(habits)
        .where(and(eq(habits.id, input.id), eq(habits.userId, ctx.user.id)));

      return { success: true };
    }),

  markDone: authedQuery
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const rows = await db
        .select()
        .from(habits)
        .where(and(eq(habits.id, input.id), eq(habits.userId, ctx.user.id)))
        .limit(1);

      const habit = rows[0];

      if (!habit) {
        throw new Error("Habit not found");
      }

      if (isToday(habit.lastCompletedAt)) {
        return {
          success: false,
          message: "تم تسجيل هذه العادة اليوم بالفعل",
        };
      }

      let newStreak = 1;

      if (habit.lastCompletedAt) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const last = new Date(habit.lastCompletedAt);

        const wasYesterday =
          last.getFullYear() === yesterday.getFullYear() &&
          last.getMonth() === yesterday.getMonth() &&
          last.getDate() === yesterday.getDate();

        if (wasYesterday) {
          newStreak = habit.currentStreak + 1;
        }
      }

      await db
        .update(habits)
        .set({
          currentStreak: newStreak,
          lastCompletedAt: new Date(),
        })
        .where(eq(habits.id, habit.id));

      return {
        success: true,
        currentStreak: newStreak,
        completedGoal: newStreak >= habit.goalDays,
      };
    }),

  adminCreate: adminQuery
    .input(
      z.object({
        userId: z.number(),
        title: z.string().min(2).max(100),
        description: z.string().optional(),
        goalDays: z.number().min(1).max(365),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const [created] = await db
        .insert(habits)
        .values({
          userId: input.userId,
          title: input.title,
          description: input.description,
          goalDays: input.goalDays,
          source: "admin",
        })
        .returning({ id: habits.id });

      return {
        success: true,
        id: created.id,
      };
    }),

  students: adminQuery.query(async () => {
    const db = getDb();

    return db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(eq(users.role, "student"));
  }),
});