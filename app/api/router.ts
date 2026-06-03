import { createRouter, publicQuery } from "./middleware";
import { authRouter } from "./auth-router";
import { courseRouter } from "./course-router";
import { lessonRouter } from "./lesson-router";
import { quizRouter } from "./quiz-router";
import { dashboardRouter } from "./dashboard-router";
import { certificateRouter } from "./certificate-router";
import { notificationRouter } from "./notification-router";
import { habitRouter } from "./habit-router";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),

  auth: authRouter,
  habit: habitRouter,
  course: courseRouter,
  lesson: lessonRouter,
  quiz: quizRouter,
  dashboard: dashboardRouter,
  certificate: certificateRouter,
  notification: notificationRouter,
});

export type AppRouter = typeof appRouter;
