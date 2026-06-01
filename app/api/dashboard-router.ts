import { createRouter, adminQuery } from "./middleware";
import { z } from "zod";
import { getDb } from "./queries/connection";
import { users, courses, enrollments, lessons, quizAttempts, lessonProgress,quizzes , certificates } from "@db/schema";
import { eq, desc, count, sql , and} from "drizzle-orm";
export const dashboardRouter = createRouter({
  stats: adminQuery.query(async () => {
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
    const [enrollmentCount] = await db.select({ count: count() }).from(enrollments);
    const [lessonCount] = await db.select({ count: count() }).from(lessons);
    const [quizCount] = await db.select({ count: count() }).from(quizAttempts);
    const [certCount] = await db.select({ count: count() }).from(certificates);

    return {
      courses: courseCount?.count ?? 0,
      students: studentCount?.count ?? 0,
      teachers: teacherCount?.count ?? 0,
      enrollments: enrollmentCount?.count ?? 0,
      lessons: lessonCount?.count ?? 0,
      quizAttempts: quizCount?.count ?? 0,
      certificates: certCount?.count ?? 0,
    };
  }),

  students: adminQuery.query(async () => {
    const db = getDb();
    return db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        avatar: users.avatar,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
        lastSignInAt: users.lastSignInAt,
      })
      .from(users)
      .where(eq(users.role, "student"))
      .orderBy(desc(users.createdAt));
  }),

  teachers: adminQuery.query(async () => {
    const db = getDb();
    return db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        avatar: users.avatar,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
        lastSignInAt: users.lastSignInAt,
      })
      .from(users)
      .where(eq(users.role, "teacher"))
      .orderBy(desc(users.createdAt));
  }),

  allUsers: adminQuery.query(async () => {
    const db = getDb();
    return db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        avatar: users.avatar,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
        lastSignInAt: users.lastSignInAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));
  }),

  recentEnrollments: adminQuery.query(async () => {
    const db = getDb();
    return db
      .select({
        id: enrollments.id,
        studentName: users.name,
        courseTitle: courses.title,
        status: enrollments.status,
        progress: enrollments.progress,
        enrolledAt: enrollments.enrolledAt,
      })
      .from(enrollments)
      .innerJoin(users, eq(enrollments.studentId, users.id))
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .orderBy(desc(enrollments.enrolledAt))
      .limit(10);
  }),

  courseStats: adminQuery.query(async () => {
    const db = getDb();
    return db
      .select({
        id: courses.id,
        title: courses.title,
        totalLessons: courses.totalLessons,
        totalQuizzes: courses.totalQuizzes,
        isPublished: courses.isPublished,
        createdAt: courses.createdAt,
        enrollmentCount: count(enrollments.id),
      })
      .from(courses)
      .leftJoin(enrollments, eq(courses.id, enrollments.courseId))
      .groupBy(courses.id)
      .orderBy(desc(courses.createdAt));
  }),

  monthlyEnrollments: adminQuery.query(async () => {
    const db = getDb();
    // Get enrollments grouped by month for the last 6 months
    const results = await db
      .select({
        month: sql<string>`DATE_FORMAT(${enrollments.enrolledAt}, '%Y-%m')`,
        count: count(),
      })
      .from(enrollments)
      .groupBy(sql`DATE_FORMAT(${enrollments.enrolledAt}, '%Y-%m')`)
      .orderBy(sql`DATE_FORMAT(${enrollments.enrolledAt}, '%Y-%m')`)
      .limit(6);

    return results.map((r) => ({
      month: r.month,
      enrollments: r.count,
    }));
  }),

  toggleUserStatus: adminQuery
    .input(
      z.object({ id: z.number() }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const user = await db.select().from(users).where(eq(users.id, input.id)).limit(1);
      if (user.length === 0) throw new Error("User not found");

      await db
        .update(users)
        .set({ isActive: !user[0].isActive })
        .where(eq(users.id, input.id));

      return { success: true };
    }),

    studentProgressDetails: adminQuery
  .input(z.object({ studentId: z.number() }))
  .query(async ({ input }) => {
    const db = getDb();

    const studentEnrollments = await db
      .select({
        enrollmentId: enrollments.id,
        courseId: courses.id,
        courseTitle: courses.title,
        progress: enrollments.progress,
        status: enrollments.status,
        enrolledAt: enrollments.enrolledAt,
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(eq(enrollments.studentId, input.studentId));

    const lessonRows = await db
      .select({
        courseId: courses.id,
        courseTitle: courses.title,
        lessonId: lessons.id,
        lessonTitle: lessons.title,
        isCompleted: sql<boolean>`COALESCE(${lessonProgress.isCompleted}, false)`,
        completedAt: lessonProgress.completedAt,
      })
      .from(lessons)
      .innerJoin(courses, eq(lessons.courseId, courses.id))
      .innerJoin(enrollments, eq(enrollments.courseId, courses.id))
      .leftJoin(
        lessonProgress,
        and(
          eq(lessonProgress.lessonId, lessons.id),
          eq(lessonProgress.enrollmentId, enrollments.id),
        ),
      )
      .where(eq(enrollments.studentId, input.studentId));

    const quizRows = await db
      .select({
        courseId: courses.id,
        courseTitle: courses.title,
        quizId: quizAttempts.quizId,
        score: quizAttempts.score,
        totalMarks: quizAttempts.totalMarks,
        percentage: quizAttempts.percentage,
        isPassed: quizAttempts.isPassed,
        answers: quizAttempts.answers,
        createdAt: quizAttempts.createdAt,
      })
      .from(quizAttempts)
      .innerJoin(quizzes, eq(quizAttempts.quizId, quizzes.id))
      .innerJoin(courses, eq(quizzes.courseId, courses.id))
      .where(eq(quizAttempts.studentId, input.studentId))
      .orderBy(desc(quizAttempts.createdAt));

    return {
      enrollments: studentEnrollments,
      lessons: lessonRows,
      quizzes: quizRows,
    };
  }),
});
