import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  numeric,
  jsonb,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("role", ["admin", "teacher", "student"]);

export const courseLevelEnum = pgEnum("level", [
  "beginner",
  "intermediate",
  "advanced",
]);

export const lessonTypeEnum = pgEnum("lesson_type", [
  "video",
  "pdf",
  "quiz",
  "text",
]);

export const questionTypeEnum = pgEnum("question_type", [
  "multiple_choice",
  "true_false",
  "essay",
]);

export const enrollmentStatusEnum = pgEnum("enrollment_status", [
  "active",
  "completed",
  "dropped",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "info",
  "success",
  "warning",
]);

export const habitSourceEnum = pgEnum("habit_source", ["admin", "student"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("union_id", { length: 255 }),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  role: userRoleEnum("role").default("student").notNull(),
  password: varchar("password", { length: 255 }),
  avatar: varchar("avatar", { length: 500 }),
  isActive: boolean("is_active").default(true).notNull(),
  lastSignInAt: timestamp("last_sign_in_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type SelectUser = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  nameEn: varchar("name_en", { length: 100 }),
  icon: varchar("icon", { length: 50 }),
  color: varchar("color", { length: 20 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type SelectCategory = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  image: varchar("image", { length: 500 }),
  categoryId: integer("category_id"),
  instructorId: integer("instructor_id").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).default("0").notNull(),
  duration: integer("duration").default(0),
  level: courseLevelEnum("level").default("beginner").notNull(),
  isPublished: boolean("is_published").default(false).notNull(),
  totalLessons: integer("total_lessons").default(0),
  totalQuizzes: integer("total_quizzes").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type SelectCourse = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: lessonTypeEnum("type").default("video").notNull(),
  content: text("content"),
  fileUrl: varchar("file_url", { length: 500 }),
  orderIndex: integer("order_index").default(0).notNull(),
  duration: integer("duration").default(0),
  isFree: boolean("is_free").default(false).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type SelectLesson = typeof lessons.$inferSelect;
export type InsertLesson = typeof lessons.$inferInsert;

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(),
  lessonId: integer("lesson_id"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  timeLimit: integer("time_limit").default(30),
  passingScore: integer("passing_score").default(60),
  totalMarks: integer("total_marks").default(100),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type SelectQuiz = typeof quizzes.$inferSelect;
export type InsertQuiz = typeof quizzes.$inferInsert;

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").notNull(),
  type: questionTypeEnum("type").default("multiple_choice").notNull(),
  question: text("question").notNull(),
  options: jsonb("options").$type<string[]>(),
  correctAnswer: integer("correct_answer"),
  marks: integer("marks").default(1).notNull(),
  orderIndex: integer("order_index").default(0).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type SelectQuestion = typeof questions.$inferSelect;
export type InsertQuestion = typeof questions.$inferInsert;

export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  courseId: integer("course_id").notNull(),
  status: enrollmentStatusEnum("status").default("active").notNull(),
  progress: integer("progress").default(0),
  enrolledAt: timestamp("enrolled_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export type SelectEnrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = typeof enrollments.$inferInsert;

export const lessonProgress = pgTable("lesson_progress", {
  id: serial("id").primaryKey(),
  enrollmentId: integer("enrollment_id").notNull(),
  lessonId: integer("lesson_id").notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  isLocked: boolean("is_locked").default(true).notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type SelectLessonProgress = typeof lessonProgress.$inferSelect;
export type InsertLessonProgress = typeof lessonProgress.$inferInsert;

export const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  quizId: integer("quiz_id").notNull(),
  score: integer("score").default(0),
  totalMarks: integer("total_marks").default(0),
  percentage: numeric("percentage", { precision: 5, scale: 2 }).default("0"),
  isPassed: boolean("is_passed").default(false).notNull(),
  answers: jsonb("answers").$type<Record<string, number>>(),
  startedAt: timestamp("started_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type SelectQuizAttempt = typeof quizAttempts.$inferSelect;
export type InsertQuizAttempt = typeof quizAttempts.$inferInsert;

export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  courseId: integer("course_id").notNull(),
  template: varchar("template", { length: 100 }).default("default").notNull(),
  issueDate: timestamp("issue_date").notNull().defaultNow(),
  fileUrl: varchar("file_url", { length: 500 }),
  serialNumber: varchar("serial_number", { length: 50 }).notNull(),
  isDownloaded: boolean("is_downloaded").default(false).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type SelectCertificate = typeof certificates.$inferSelect;
export type InsertCertificate = typeof certificates.$inferInsert;

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: notificationTypeEnum("type").default("info").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type SelectNotification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: varchar("title", { length: 100 }).notNull(),
  description: text("description"),
  goalDays: integer("goal_days").notNull().default(7),
  currentStreak: integer("current_streak").notNull().default(0),
  lastCompletedAt: timestamp("last_completed_at"),
  source: habitSourceEnum("source").default("student").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type SelectHabit = typeof habits.$inferSelect;
export type InsertHabit = typeof habits.$inferInsert;