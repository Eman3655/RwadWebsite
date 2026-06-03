import {
  mysqlTable,
  mysqlEnum,
  varchar,
  text,
  timestamp,
  int,
  boolean,
  decimal,
  bigint,
  json,
  datetime,
} from "drizzle-orm/mysql-core";

// ============================================
// Users Table
// ============================================
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  unionId: varchar("union_id", { length: 255 }),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  role: mysqlEnum("role", ["admin", "teacher", "student"]).default("student").notNull(),
  password: varchar("password", { length: 255 }),
  avatar: varchar("avatar", { length: 500 }),
  isActive: boolean("is_active").default(true).notNull(),
  lastSignInAt: timestamp("last_sign_in_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type SelectUser = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================
// Categories Table
// ============================================
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  nameEn: varchar("name_en", { length: 100 }),
  icon: varchar("icon", { length: 50 }),
  color: varchar("color", { length: 20 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type SelectCategory = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

// ============================================
// Courses Table
// ============================================
export const courses = mysqlTable("courses", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  image: varchar("image", { length: 500 }),
  categoryId: bigint("category_id", { mode: "number", unsigned: true }),
  instructorId: bigint("instructor_id", { mode: "number", unsigned: true }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).default("0").notNull(),
  duration: int("duration").default(0), // in hours
  level: mysqlEnum("level", ["beginner", "intermediate", "advanced"]).default("beginner").notNull(),
  isPublished: boolean("is_published").default(false).notNull(),
  totalLessons: int("total_lessons").default(0),
  totalQuizzes: int("total_quizzes").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type SelectCourse = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;

// ============================================
// Lessons Table
// ============================================
export const lessons = mysqlTable("lessons", {
  id: int("id").autoincrement().primaryKey(),
  courseId: bigint("course_id", { mode: "number", unsigned: true }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["video", "pdf", "quiz", "text"]).default("video").notNull(),
  content: text("content"), // video URL or text content
  fileUrl: varchar("file_url", { length: 500 }), // PDF file URL
  orderIndex: int("order_index").default(0).notNull(),
  duration: int("duration").default(0), // in minutes
  isFree: boolean("is_free").default(false).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type SelectLesson = typeof lessons.$inferSelect;
export type InsertLesson = typeof lessons.$inferInsert;

// ============================================
// Quizzes Table
// ============================================
export const quizzes = mysqlTable("quizzes", {
  id: int("id").autoincrement().primaryKey(),
  courseId: bigint("course_id", { mode: "number", unsigned: true }).notNull(),
  lessonId: bigint("lesson_id", { mode: "number", unsigned: true }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  timeLimit: int("time_limit").default(30), // in minutes
  passingScore: int("passing_score").default(60), // percentage
  totalMarks: int("total_marks").default(100),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type SelectQuiz = typeof quizzes.$inferSelect;
export type InsertQuiz = typeof quizzes.$inferInsert;

// ============================================
// Questions Table
// ============================================
export const questions = mysqlTable("questions", {
  id: int("id").autoincrement().primaryKey(),
  quizId: bigint("quiz_id", { mode: "number", unsigned: true }).notNull(),
  type: mysqlEnum("type", ["multiple_choice", "true_false", "essay"]).default("multiple_choice").notNull(),
  question: text("question").notNull(),
  options: json("options").$type<string[]>(), // ['Option A', 'Option B']
  correctAnswer: int("correct_answer"), // index of correct option
  marks: int("marks").default(1).notNull(),
  orderIndex: int("order_index").default(0).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type SelectQuestion = typeof questions.$inferSelect;
export type InsertQuestion = typeof questions.$inferInsert;

// ============================================
// Enrollments Table
// ============================================
export const enrollments = mysqlTable("enrollments", {
  id: int("id").autoincrement().primaryKey(),
  studentId: bigint("student_id", { mode: "number", unsigned: true }).notNull(),
  courseId: bigint("course_id", { mode: "number", unsigned: true }).notNull(),
  status: mysqlEnum("status", ["active", "completed", "dropped"]).default("active").notNull(),
  progress: int("progress").default(0), // percentage
  enrolledAt: timestamp("enrolled_at").notNull().defaultNow(),
completedAt: datetime("completed_at"),
});

export type SelectEnrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = typeof enrollments.$inferInsert;

// ============================================
// Lesson Progress Table
// ============================================
export const lessonProgress = mysqlTable("lesson_progress", {
  id: int("id").autoincrement().primaryKey(),
  enrollmentId: bigint("enrollment_id", { mode: "number", unsigned: true }).notNull(),
  lessonId: bigint("lesson_id", { mode: "number", unsigned: true }).notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  isLocked: boolean("is_locked").default(true).notNull(),
completedAt: datetime("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type SelectLessonProgress = typeof lessonProgress.$inferSelect;
export type InsertLessonProgress = typeof lessonProgress.$inferInsert;

// ============================================
// Quiz Attempts Table
// ============================================
export const quizAttempts = mysqlTable("quiz_attempts", {
  id: int("id").autoincrement().primaryKey(),
  studentId: bigint("student_id", { mode: "number", unsigned: true }).notNull(),
  quizId: bigint("quiz_id", { mode: "number", unsigned: true }).notNull(),
  score: int("score").default(0),
  totalMarks: int("total_marks").default(0),
  percentage: decimal("percentage", { precision: 5, scale: 2 }).default("0"),
  isPassed: boolean("is_passed").default(false).notNull(),
  answers: json("answers").$type<Record<string, number>>(),
  startedAt: timestamp("started_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type SelectQuizAttempt = typeof quizAttempts.$inferSelect;
export type InsertQuizAttempt = typeof quizAttempts.$inferInsert;

// ============================================
// Certificates Table
// ============================================
export const certificates = mysqlTable("certificates", {
  id: int("id").autoincrement().primaryKey(),
  studentId: bigint("student_id", { mode: "number", unsigned: true }).notNull(),
  courseId: bigint("course_id", { mode: "number", unsigned: true }).notNull(),
  template: varchar("template", { length: 100 }).default("default").notNull(),
  issueDate: timestamp("issue_date").notNull().defaultNow(),
  fileUrl: varchar("file_url", { length: 500 }),
  serialNumber: varchar("serial_number", { length: 50 }).notNull(),
  isDownloaded: boolean("is_downloaded").default(false).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type SelectCertificate = typeof certificates.$inferSelect;
export type InsertCertificate = typeof certificates.$inferInsert;

// ============================================
// Notifications Table
// ============================================
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: mysqlEnum("type", ["info", "success", "warning"]).default("info").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type SelectNotification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;


export const habits = mysqlTable("habits", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  title: varchar("title", { length: 100 }).notNull(),
  description: text("description"),
  goalDays: int("goal_days").notNull().default(7),
  currentStreak: int("current_streak").notNull().default(0),
  lastCompletedAt: timestamp("last_completed_at"),
  source: mysqlEnum("source", ["admin", "student"]).default("student").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type SelectHabit = typeof habits.$inferSelect;
export type InsertHabit = typeof habits.$inferInsert;