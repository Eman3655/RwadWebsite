import { createRouter, publicQuery, authedQuery, adminQuery } from "./middleware";
import { z } from "zod";
import { getDb } from "./queries/connection";
import { quizzes, questions, quizAttempts, courses } from "@db/schema";
import { eq, and, asc } from "drizzle-orm";

function parseOptions(options: unknown): string[] {
  if (Array.isArray(options)) {
    return options.map(String);
  }

  if (typeof options === "string") {
    try {
      const parsed = JSON.parse(options);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }

  return [];
}

export const quizRouter = createRouter({
  list: publicQuery
    .input(z.object({ courseId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();

      return db
        .select()
        .from(quizzes)
        .where(eq(quizzes.courseId, input.courseId))
        .orderBy(asc(quizzes.id));
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();

      const quizRows = await db
        .select()
        .from(quizzes)
        .where(eq(quizzes.id, input.id))
        .limit(1);

      if (quizRows.length === 0) return null;

      const quizQuestions = await db
        .select()
        .from(questions)
        .where(eq(questions.quizId, input.id))
        .orderBy(asc(questions.orderIndex));

      return {
        ...quizRows[0],
        questions: quizQuestions.map((q) => ({
          ...q,
          options: parseOptions(q.options),
        })),
      };
    }),

  create: adminQuery
    .input(
      z.object({
        courseId: z.number(),
        lessonId: z.number().optional(),
        title: z.string().min(2),
        description: z.string().optional(),
        timeLimit: z.number().default(30),
        passingScore: z.number().default(60),
        totalMarks: z.number().default(100),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const [created] = await db
        .insert(quizzes)
        .values({
          ...input,
          lessonId: input.lessonId ?? null,
        })
        .returning({ id: quizzes.id });

      const quizCount = await db
        .select()
        .from(quizzes)
        .where(eq(quizzes.courseId, input.courseId));

      await db
        .update(courses)
        .set({ totalQuizzes: quizCount.length })
        .where(eq(courses.id, input.courseId));

      return { id: created.id };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(2).optional(),
        description: z.string().optional(),
        timeLimit: z.number().optional(),
        passingScore: z.number().optional(),
        totalMarks: z.number().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;

      await db.update(quizzes).set(data).where(eq(quizzes.id, id));

      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();

      const quiz = await db
        .select()
        .from(quizzes)
        .where(eq(quizzes.id, input.id))
        .limit(1);

      if (quiz.length > 0) {
        await db.delete(quizzes).where(eq(quizzes.id, input.id));

        const quizCount = await db
          .select()
          .from(quizzes)
          .where(eq(quizzes.courseId, quiz[0].courseId));

        await db
          .update(courses)
          .set({ totalQuizzes: quizCount.length })
          .where(eq(courses.id, quiz[0].courseId));
      }

      return { success: true };
    }),

  addQuestion: adminQuery
    .input(
      z.object({
        quizId: z.number(),
        type: z
          .enum(["multiple_choice", "true_false", "essay"])
          .default("multiple_choice"),
        question: z.string().min(1),
        options: z.array(z.string()).optional(),
        correctAnswer: z.number().optional(),
        marks: z.number().default(1),
        orderIndex: z.number().default(0),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const [created] = await db
        .insert(questions)
        .values({
          quizId: input.quizId,
          type: input.type,
          question: input.question,
          options: input.options ?? [],
          correctAnswer: input.correctAnswer ?? 0,
          marks: input.marks,
          orderIndex: input.orderIndex,
        })
        .returning({ id: questions.id });

      return { id: created.id };
    }),

  updateQuestion: adminQuery
    .input(
      z.object({
        id: z.number(),
        question: z.string().min(1).optional(),
        type: z.enum(["multiple_choice", "true_false", "essay"]).optional(),
        options: z.array(z.string()).optional(),
        correctAnswer: z.number().optional(),
        marks: z.number().optional(),
        orderIndex: z.number().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;

      await db
        .update(questions)
        .set({
          ...data,
          options: data.options ?? undefined,
        })
        .where(eq(questions.id, id));

      return { success: true };
    }),

  deleteQuestion: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();

      await db.delete(questions).where(eq(questions.id, input.id));

      return { success: true };
    }),

  submit: authedQuery
    .input(
      z.object({
        quizId: z.number(),
        answers: z.record(z.string(), z.number()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const quizRows = await db
        .select()
        .from(quizzes)
        .where(eq(quizzes.id, input.quizId))
        .limit(1);

      if (quizRows.length === 0) {
        throw new Error("Quiz not found");
      }

      const quiz = quizRows[0];

      const quizQuestions = await db
        .select()
        .from(questions)
        .where(eq(questions.quizId, input.quizId));

      let score = 0;
      let totalMarks = 0;

      for (const q of quizQuestions) {
        totalMarks += q.marks;

        const userAnswer = input.answers[String(q.id)];

        if (
          userAnswer !== undefined &&
          Number(userAnswer) === Number(q.correctAnswer)
        ) {
          score += q.marks;
        }
      }

      const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;
      const isPassed = percentage >= (quiz.passingScore ?? 60);

      const [createdAttempt] = await db
        .insert(quizAttempts)
        .values({
          studentId: ctx.user.id,
          quizId: input.quizId,
          score,
          totalMarks,
          percentage: String(percentage.toFixed(2)),
          isPassed,
          answers: input.answers,
        })
        .returning({ id: quizAttempts.id });

      return {
        attemptId: createdAttempt.id,
        score,
        totalMarks,
        percentage,
        isPassed,
      };
    }),

  myAttempts: authedQuery
    .input(z.object({ quizId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();

      return db
        .select()
        .from(quizAttempts)
        .where(
          and(
            eq(quizAttempts.studentId, ctx.user.id),
            eq(quizAttempts.quizId, input.quizId),
          ),
        )
        .orderBy(asc(quizAttempts.createdAt));
    }),
});