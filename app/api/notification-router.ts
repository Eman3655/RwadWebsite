import { createRouter, authedQuery, adminQuery } from "./middleware";
import { z } from "zod";
import { getDb } from "./queries/connection";
import { notifications, users } from "@db/schema";
import { eq, desc, asc } from "drizzle-orm";

export const notificationRouter = createRouter({
  students: adminQuery.query(async () => {
    const db = getDb();

    return db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .where(eq(users.role, "student"))
      .orderBy(asc(users.name));
  }),

  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();

    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, ctx.user.id))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  }),

  unreadCount: authedQuery.query(async ({ ctx }) => {
    const db = getDb();

    const rows = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, ctx.user.id));

    return rows.filter((n) => !n.isRead).length;
  }),

  markAsRead: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, input.id));

      return { success: true };
    }),

  markAllRead: authedQuery.mutation(async ({ ctx }) => {
    const db = getDb();

    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, ctx.user.id));

    return { success: true };
  }),

  send: adminQuery
    .input(
      z.object({
        userId: z.number(),
        title: z.string().min(1),
        message: z.string().min(1),
        type: z.enum(["info", "success", "warning"]).default("info"),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const result = await db.insert(notifications).values({
        userId: input.userId,
        title: input.title,
        message: input.message,
        type: input.type,
      });

      return { id: Number(result[0].insertId) };
    }),
});