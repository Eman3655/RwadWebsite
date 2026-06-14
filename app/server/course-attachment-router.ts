import { createRouter, publicQuery, adminQuery } from "./middleware";
import { z } from "zod";
import { getDb } from "./queries/connection";
import { courseAttachments } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const courseAttachmentRouter = createRouter({
  listByCourse: publicQuery
    .input(z.object({ courseId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();

      return db
        .select()
        .from(courseAttachments)
        .where(eq(courseAttachments.courseId, input.courseId))
        .orderBy(desc(courseAttachments.createdAt));
    }),

  create: adminQuery
    .input(
      z.object({
        courseId: z.number(),
        title: z.string().min(2),
        fileUrl: z.string().url(),
        fileType: z.string().optional(),
        fileSize: z.number().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const [created] = await db
        .insert(courseAttachments)
        .values({
          courseId: input.courseId,
          title: input.title,
          fileUrl: input.fileUrl,
          fileType: input.fileType,
          fileSize: input.fileSize,
        })
        .returning({ id: courseAttachments.id });

      return {
        success: true,
        id: created.id,
      };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();

      await db
        .delete(courseAttachments)
        .where(eq(courseAttachments.id, input.id));

      return { success: true };
    }),
});