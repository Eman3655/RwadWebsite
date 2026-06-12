import { createRouter, publicQuery, authedQuery, adminQuery } from "./middleware";
import { z } from "zod";
import { getDb } from "../server/queries/connection";
import {
  courses,
  lessons,
  quizzes,
  enrollments,
  categories,
  users,
} from "@db/schema";
import { eq, desc, like, and, count, type SQL } from "drizzle-orm";

export const courseRouter = createRouter({
  list: publicQuery
    .input(
      z
        .object({
          search: z.string().optional(),
          categoryId: z.number().optional(),
          level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
          page: z.number().default(1),
          limit: z.number().default(12),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = getDb();
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 12;
      const offset = (page - 1) * limit;

const conditions: SQL[] = [];
      if (input?.search) {
        conditions.push(like(courses.title, `%${input.search}%`));
      }

      if (input?.categoryId) {
        conditions.push(eq(courses.categoryId, input.categoryId));
      }

      if (input?.level) {
        conditions.push(eq(courses.level, input.level));
      }

      conditions.push(eq(courses.isPublished, true));

      const whereClause =
        conditions.length > 1 ? and(...conditions) : conditions[0];

      const items = await db
        .select({
          id: courses.id,
          title: courses.title,
          description: courses.description,
          image: courses.image,
          price: courses.price,
          duration: courses.duration,
          level: courses.level,
          isPublished: courses.isPublished,
          totalLessons: courses.totalLessons,
          totalQuizzes: courses.totalQuizzes,
          createdAt: courses.createdAt,
          instructorName: users.name,
          categoryName: categories.name,
        })
        .from(courses)
        .leftJoin(users, eq(courses.instructorId, users.id))
        .leftJoin(categories, eq(courses.categoryId, categories.id))
        .where(whereClause)
        .orderBy(desc(courses.createdAt))
        .limit(limit)
        .offset(offset);

      const totalResult = await db
        .select({ count: count() })
        .from(courses)
        .where(whereClause);

      return {
        items,
        total: totalResult[0]?.count ?? 0,
        page,
        limit,
      };
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();

      const courseRows = await db
        .select({
          id: courses.id,
          title: courses.title,
          description: courses.description,
          image: courses.image,
          price: courses.price,
          duration: courses.duration,
          level: courses.level,
          isPublished: courses.isPublished,
          totalLessons: courses.totalLessons,
          totalQuizzes: courses.totalQuizzes,
          createdAt: courses.createdAt,
          instructorId: courses.instructorId,
          instructorName: users.name,
          instructorAvatar: users.avatar,
          categoryName: categories.name,
        })
        .from(courses)
        .leftJoin(users, eq(courses.instructorId, users.id))
        .leftJoin(categories, eq(courses.categoryId, categories.id))
        .where(eq(courses.id, input.id))
        .limit(1);

      if (courseRows.length === 0) return null;

      const course = courseRows[0];

      const courseLessons = await db
        .select()
        .from(lessons)
        .where(eq(lessons.courseId, input.id))
        .orderBy(lessons.orderIndex);

      const courseQuizzes = await db
        .select()
        .from(quizzes)
        .where(eq(quizzes.courseId, input.id));

      return { ...course, lessons: courseLessons, quizzes: courseQuizzes };
    }),

  create: adminQuery
    .input(
      z.object({
        title: z.string().min(2),
        description: z.string().optional(),
        image: z.string().optional(),
        categoryId: z.number().optional(),
        instructorId: z.number(),
        price: z.string().optional().default("0"),
        duration: z.number().optional().default(0),
        level: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
        isPublished: z.boolean().optional().default(false),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const [created] = await db
        .insert(courses)
        .values({
          ...input,
          totalLessons: 0,
          totalQuizzes: 0,
        })
        .returning({ id: courses.id });

      return { id: created.id };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(2).optional(),
        description: z.string().optional(),
        image: z.string().optional(),
        categoryId: z.number().optional(),
        instructorId: z.number().optional(),
        price: z.string().optional(),
        duration: z.number().optional(),
        level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
        isPublished: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;

      await db.update(courses).set(data).where(eq(courses.id, id));

      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();

      await db.delete(courses).where(eq(courses.id, input.id));

      return { success: true };
    }),

  adminList: adminQuery.query(async () => {
    const db = getDb();

    return db
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        image: courses.image,
        price: courses.price,
        duration: courses.duration,
        level: courses.level,
        isPublished: courses.isPublished,
        totalLessons: courses.totalLessons,
        totalQuizzes: courses.totalQuizzes,
        createdAt: courses.createdAt,
        instructorName: users.name,
        categoryName: categories.name,
        categoryId: courses.categoryId,
        instructorId: courses.instructorId,
      })
      .from(courses)
      .leftJoin(users, eq(courses.instructorId, users.id))
      .leftJoin(categories, eq(courses.categoryId, categories.id))
      .orderBy(desc(courses.createdAt));
  }),

  categories: publicQuery.query(async () => {
    const db = getDb();

    return db.select().from(categories).orderBy(categories.name);
  }),

  enroll: authedQuery
    .input(z.object({ courseId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const existing = await db
        .select()
        .from(enrollments)
        .where(
          and(
            eq(enrollments.studentId, ctx.user.id),
            eq(enrollments.courseId, input.courseId),
          ),
        )
        .limit(1);

      if (existing.length > 0) {
        return { success: true, enrollmentId: existing[0].id };
      }

      const [created] = await db
        .insert(enrollments)
        .values({
          studentId: ctx.user.id,
          courseId: input.courseId,
          status: "active",
          progress: 0,
        })
        .returning({ id: enrollments.id });

      return { success: true, enrollmentId: created.id };
    }),

  myCourses: authedQuery.query(async ({ ctx }) => {
    const db = getDb();

    return db
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        image: courses.image,
        price: courses.price,
        duration: courses.duration,
        level: courses.level,
        totalLessons: courses.totalLessons,
        totalQuizzes: courses.totalQuizzes,
        progress: enrollments.progress,
        status: enrollments.status,
        enrolledAt: enrollments.enrolledAt,
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(eq(enrollments.studentId, ctx.user.id))
      .orderBy(desc(enrollments.enrolledAt));
  }),

  stats: publicQuery.query(async () => {
    const db = getDb();

    const [courseCount] = await db.select({ count: count() }).from(courses);

    const [studentCount] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, "student"));

    const [teacherCount] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, "teacher"));

    const [enrollmentCount] = await db
      .select({ count: count() })
      .from(enrollments);

    return {
      courses: courseCount?.count ?? 0,
      students: studentCount?.count ?? 0,
      teachers: teacherCount?.count ?? 0,
      enrollments: enrollmentCount?.count ?? 0,
    };
  }),
});