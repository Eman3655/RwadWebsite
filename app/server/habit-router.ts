import { z } from "zod";
import { eq, and, desc, sql } from "drizzle-orm"; 

import { createRouter, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { habits, users } from "@db/schema";

function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export const habitRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const todayStr = getTodayStr();

    await db.execute(sql`
      UPDATE ${habits}
      SET current_streak = 0
      WHERE user_id = ${ctx.user.id}
        AND current_streak < goal_days
        AND (
          last_completed_at IS NULL
          OR CAST(last_completed_at AS DATE) NOT IN (
            CAST(${todayStr} AS DATE), 
            CAST(${todayStr} AS DATE) - INTERVAL '1 day'
          )
        )
    `);

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
      const todayStr = getTodayStr();

      const habitExists = await db
        .select({ currentStreak: habits.currentStreak, goalDays: habits.goalDays })
        .from(habits)
        .where(and(eq(habits.id, input.id), eq(habits.userId, ctx.user.id)))
        .limit(1);

      if (habitExists.length === 0) {
        throw new Error("Habit not found");
      }

      const { currentStreak, goalDays } = habitExists[0];

      if (currentStreak >= goalDays) {
        return { success: false, message: "لقد وصلت إلى هدفك بالفعل!" };
      }

      const updatedRows = await db.execute(sql`
        UPDATE ${habits}
        SET
          current_streak = CASE
            WHEN CAST(last_completed_at AS DATE) = CAST(${todayStr} AS DATE) - INTERVAL '1 day'
              THEN LEAST(current_streak + 1, goal_days)
            ELSE 1
          END,
          last_completed_at = CAST(${todayStr} AS DATE)
        WHERE id = ${input.id}
          AND user_id = ${ctx.user.id}
          AND (last_completed_at IS NULL OR CAST(last_completed_at AS DATE) <> CAST(${todayStr} AS DATE))
        RETURNING current_streak, goal_days
      `);

      if (!updatedRows.rows.length) {
        return {
          success: false,
          message: "تم تسجيل هذه العادة اليوم بالفعل",
        };
      }

      const updated = updatedRows.rows[0] as { current_streak: number; goal_days: number };
      const completedGoal = updated.current_streak >= updated.goal_days;

      return {
        success: true,
        currentStreak: updated.current_streak,
        completedGoal: completedGoal,
        message: completedGoal ? "🎉 لقد حققت هدفك!" : "تم تحديث السلسلة",
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