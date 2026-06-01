import { createRouter, publicQuery, authedQuery, adminQuery } from "./middleware";
import { z } from "zod";
import { getDb } from "./queries/connection";
import { lessons, lessonProgress, enrollments, courses } from "@db/schema";
import { eq, and, asc } from "drizzle-orm";

export const lessonRouter = createRouter({
  list: publicQuery
    .input(z.object({ courseId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(lessons)
        .where(eq(lessons.courseId, input.courseId))
        .orderBy(asc(lessons.orderIndex));
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db
        .select()
        .from(lessons)
        .where(eq(lessons.id, input.id))
        .limit(1);
      return rows.at(0) ?? null;
    }),

  create: adminQuery
    .input(
      z.object({
        courseId: z.number(),
        title: z.string().min(2),
        description: z.string().optional(),
        type: z.enum(["video", "pdf", "quiz", "text"]).default("video"),
        content: z.string().optional(),
        fileUrl: z.string().optional(),
        orderIndex: z.number().default(0),
        duration: z.number().optional().default(0),
        isFree: z.boolean().optional().default(false),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(lessons).values(input);

      // Update course totalLessons
      const lessonCount = await db
        .select()
        .from(lessons)
        .where(eq(lessons.courseId, input.courseId));

      await db
        .update(courses)
        .set({ totalLessons: lessonCount.length })
        .where(eq(courses.id, input.courseId));

      return { id: Number(result[0].insertId) };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(2).optional(),
        description: z.string().optional(),
        type: z.enum(["video", "pdf", "quiz", "text"]).optional(),
        content: z.string().optional(),
        fileUrl: z.string().optional(),
        orderIndex: z.number().optional(),
        duration: z.number().optional(),
        isFree: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(lessons).set(data).where(eq(lessons.id, id));
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const lesson = await db
        .select()
        .from(lessons)
        .where(eq(lessons.id, input.id))
        .limit(1);

      if (lesson.length > 0) {
        await db.delete(lessons).where(eq(lessons.id, input.id));

        // Update course totalLessons
        const lessonCount = await db
          .select()
          .from(lessons)
          .where(eq(lessons.courseId, lesson[0].courseId));

        await db
          .update(courses)
          .set({ totalLessons: lessonCount.length })
          .where(eq(courses.id, lesson[0].courseId));
      }

      return { success: true };
    }),

  complete: authedQuery
    .input(z.object({ lessonId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      // Find enrollment for this lesson's course
      const lesson = await db
        .select()
        .from(lessons)
        .where(eq(lessons.id, input.lessonId))
        .limit(1);

      if (lesson.length === 0) throw new Error("Lesson not found");

      const enrollment = await db
        .select()
        .from(enrollments)
        .where(
          and(
            eq(enrollments.studentId, ctx.user.id),
            eq(enrollments.courseId, lesson[0].courseId),
          ),
        )
        .limit(1);

      if (enrollment.length === 0) throw new Error("Not enrolled in this course");

      const existingProgress = await db
        .select()
        .from(lessonProgress)
        .where(
          and(
            eq(lessonProgress.enrollmentId, enrollment[0].id),
            eq(lessonProgress.lessonId, input.lessonId),
          ),
        )
        .limit(1);

      if (existingProgress.length > 0) {
        await db
          .update(lessonProgress)
          .set({ isCompleted: true, completedAt: new Date() })
          .where(eq(lessonProgress.id, existingProgress[0].id));
      } else {
        await db.insert(lessonProgress).values({
          enrollmentId: enrollment[0].id,
          lessonId: input.lessonId,
          isCompleted: true,
          isLocked: false,
          completedAt: new Date(),
        });
      }

      // Calculate and update overall progress
      const allLessons = await db
        .select()
        .from(lessons)
        .where(eq(lessons.courseId, lesson[0].courseId));

      const completedLessons = await db
        .select()
        .from(lessonProgress)
        .where(
          and(
            eq(lessonProgress.enrollmentId, enrollment[0].id),
            eq(lessonProgress.isCompleted, true),
          ),
        );

      const progress = Math.round(
        (completedLessons.length / allLessons.length) * 100,
      );

      await db
        .update(enrollments)
        .set({
          progress,
          status: progress === 100 ? "completed" : "active",
          completedAt: progress === 100 ? new Date() : null,
        })
        .where(eq(enrollments.id, enrollment[0].id));

      return { success: true, progress };
    }),

  getProgress: authedQuery
    .input(z.object({ courseId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();

      const enrollment = await db
        .select()
        .from(enrollments)
        .where(
          and(
            eq(enrollments.studentId, ctx.user.id),
            eq(enrollments.courseId, input.courseId),
          ),
        )
        .limit(1);

      if (enrollment.length === 0) return [];

      return db
        .select()
        .from(lessonProgress)
        .where(eq(lessonProgress.enrollmentId, enrollment[0].id));
    }),
});
