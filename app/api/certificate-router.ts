import { createRouter, authedQuery, adminQuery } from "./middleware";
import { z } from "zod";
import { getDb } from "./queries/connection";
import { certificates, courses, users } from "@db/schema";
import { eq, desc, and } from "drizzle-orm";

function generateSerialNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `ELM-${timestamp}-${random}`;
}

export const certificateRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();

    return db
      .select({
        id: certificates.id,
        courseTitle: courses.title,
        studentName: users.name,
        template: certificates.template,
        fileUrl: certificates.fileUrl,
        issueDate: certificates.issueDate,
        serialNumber: certificates.serialNumber,
        isDownloaded: certificates.isDownloaded,
      })
      .from(certificates)
      .innerJoin(courses, eq(certificates.courseId, courses.id))
      .innerJoin(users, eq(certificates.studentId, users.id))
      .where(eq(certificates.studentId, ctx.user.id))
      .orderBy(desc(certificates.issueDate));
  }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();

      const rows = await db
        .select({
          id: certificates.id,
          courseTitle: courses.title,
          studentName: users.name,
          template: certificates.template,
          fileUrl: certificates.fileUrl,
          issueDate: certificates.issueDate,
          serialNumber: certificates.serialNumber,
          isDownloaded: certificates.isDownloaded,
        })
        .from(certificates)
        .innerJoin(courses, eq(certificates.courseId, courses.id))
        .innerJoin(users, eq(certificates.studentId, users.id))
        .where(
          ctx.user.role === "admin"
            ? eq(certificates.id, input.id)
            : and(
                eq(certificates.id, input.id),
                eq(certificates.studentId, ctx.user.id),
              ),
        )
        .limit(1);

      return rows.at(0) ?? null;
    }),

  generate: adminQuery
    .input(
      z.object({
        studentId: z.number(),
        courseId: z.number(),
        fileUrl: z.string().url("رابط الشهادة غير صحيح"),
        template: z.string().default("uploaded"),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const serialNumber = generateSerialNumber();

      const result = await db.insert(certificates).values({
        studentId: input.studentId,
        courseId: input.courseId,
        template: input.template,
        fileUrl: input.fileUrl,
        serialNumber,
      });

      return {
        id: Number(result[0].insertId),
        serialNumber,
        fileUrl: input.fileUrl,
      };
    }),

  updateFile: adminQuery
    .input(
      z.object({
        id: z.number(),
        fileUrl: z.string().url("رابط الشهادة غير صحيح"),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      await db
        .update(certificates)
        .set({ fileUrl: input.fileUrl })
        .where(eq(certificates.id, input.id));

      return { success: true };
    }),

  markDownloaded: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      await db
        .update(certificates)
        .set({ isDownloaded: true })
        .where(
          ctx.user.role === "admin"
            ? eq(certificates.id, input.id)
            : and(
                eq(certificates.id, input.id),
                eq(certificates.studentId, ctx.user.id),
              ),
        );

      return { success: true };
    }),

  adminList: adminQuery.query(async () => {
    const db = getDb();

    return db
      .select({
        id: certificates.id,
        courseTitle: courses.title,
        studentName: users.name,
        template: certificates.template,
        fileUrl: certificates.fileUrl,
        issueDate: certificates.issueDate,
        serialNumber: certificates.serialNumber,
        isDownloaded: certificates.isDownloaded,
      })
      .from(certificates)
      .innerJoin(courses, eq(certificates.courseId, courses.id))
      .innerJoin(users, eq(certificates.studentId, users.id))
      .orderBy(desc(certificates.issueDate));
  }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();

      await db.delete(certificates).where(eq(certificates.id, input.id));

      return { success: true };
    }),
});