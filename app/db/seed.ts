import { getDb } from "../server/queries/connection";
import {
  users,
  categories,
  courses,
  lessons,
  quizzes,
  questions,
} from "./schema";
import bcrypt from "bcryptjs";

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  // Hash password for local users
  const hashedPassword = await bcrypt.hash("123456", 10);

  // Insert admin user
  const adminResult = await db.insert(users).values({
    name: "المدير",
    email: "emmoabdelhamid2021@gmail.com",
    password: hashedPassword,
    role: "admin",
    isActive: true,
  });
  const adminId = Number(adminResult[0].insertId);

  // Insert teachers
  const teacher1Result = await db.insert(users).values({
    name: "أحمد محمد",
    email: "ahmed@elm.com",
    password: hashedPassword,
    role: "teacher",
    isActive: true,
  });
  const teacher1Id = Number(teacher1Result[0].insertId);

  const teacher2Result = await db.insert(users).values({
    name: "سارة علي",
    email: "sara@elm.com",
    password: hashedPassword,
    role: "teacher",
    isActive: true,
  });
  const teacher2Id = Number(teacher2Result[0].insertId);

  // Insert students
  const studentNames = [
    "محمد خالد", "فاطمة أحمد", "عمر حسن", "ليلا سامي",
    "نور الدين", "ريم عبدالله", "يوسف علي", "مريم محمود",
    "عبدالرحمن", "سارة إبراهيم",
  ];

  const studentIds: number[] = [];
  for (let i = 0; i < studentNames.length; i++) {
    const result = await db.insert(users).values({
      name: studentNames[i],
      email: `student${i + 1}@elm.com`,
      password: hashedPassword,
      role: "student",
      isActive: true,
    });
    studentIds.push(Number(result[0].insertId));
  }

  // Insert categories
  const categoryData = [
    { name: "تطوير البرمجيات", nameEn: "Software Development", icon: "code", color: "#2563EB" },
    { name: "التصميم", nameEn: "Design", icon: "palette", color: "#EC4899" },
    { name: "التسويق الرقمي", nameEn: "Digital Marketing", icon: "trending-up", color: "#F59E0B" },
    { name: "إدارة الأعمال", nameEn: "Business Management", icon: "briefcase", color: "#10B981" },
    { name: "علم البيانات", nameEn: "Data Science", icon: "database", color: "#8B5CF6" },
    { name: "الأمن السيبراني", nameEn: "Cybersecurity", icon: "shield", color: "#EF4444" },
  ];

  const categoryIds: number[] = [];
  for (const cat of categoryData) {
    const result = await db.insert(categories).values(cat);
    categoryIds.push(Number(result[0].insertId));
  }

  // Insert courses
  const courseData = [
    {
      title: "تعلم البرمجة بلغة Python",
      description: "كورس شامل لتعلم لغة Python من الصفر حتى الاحتراف، يغطي الأساسيات والمفاهيم المتقدمة مع مشاريع عملية",
      categoryId: categoryIds[0],
      instructorId: teacher1Id,
      price: "0",
      duration: 20,
      level: "beginner" as const,
      isPublished: true,
      totalLessons: 4,
      totalQuizzes: 2,
    },
    {
      title: "تصميم واجهات المستخدم UI/UX",
      description: "تعلم تصميم واجهات المستخدم وتجربة المستخدم باستخدام أحدث الأدوات والتقنيات",
      categoryId: categoryIds[1],
      instructorId: teacher2Id,
      price: "99",
      duration: 15,
      level: "beginner" as const,
      isPublished: true,
      totalLessons: 4,
      totalQuizzes: 2,
    },
    {
      title: "تطوير المواقع بلغة JavaScript",
      description: "كورس متقدم في تطوير المواقع باستخدام JavaScript الحديثة مع React و Node.js",
      categoryId: categoryIds[0],
      instructorId: teacher1Id,
      price: "149",
      duration: 25,
      level: "intermediate" as const,
      isPublished: true,
      totalLessons: 4,
      totalQuizzes: 2,
    },
    {
      title: "أساسيات الذكاء الاصطناعي",
      description: "تعرف على أساسيات الذكاء الاصطناعي وتعلم الآلة مع تطبيقات عملية",
      categoryId: categoryIds[4],
      instructorId: teacher2Id,
      price: "199",
      duration: 18,
      level: "intermediate" as const,
      isPublished: true,
      totalLessons: 4,
      totalQuizzes: 2,
    },
    {
      title: "إدارة المشاريع الاحترافية",
      description: "تعلم كيفية إدارة المشاريع بكفاءة باستخدام منهجيات Agile و Scrum",
      categoryId: categoryIds[3],
      instructorId: teacher1Id,
      price: "79",
      duration: 12,
      level: "advanced" as const,
      isPublished: true,
      totalLessons: 4,
      totalQuizzes: 2,
    },
    {
      title: "التسويق الرقمي المتقدم",
      description: "استراتيجيات التسويق الرقمي المتقدمة لزيادة المبيعات وبناء العلامة التجارية",
      categoryId: categoryIds[2],
      instructorId: teacher2Id,
      price: "129",
      duration: 16,
      level: "advanced" as const,
      isPublished: true,
      totalLessons: 4,
      totalQuizzes: 2,
    },
  ];

  const courseIds: number[] = [];
  for (const course of courseData) {
    const result = await db.insert(courses).values(course);
    courseIds.push(Number(result[0].insertId));
  }

  // Insert lessons for each course
  const lessonTemplates = [
    // Python course
    [
      { title: "مقدمة في Python", type: "video" as const, duration: 30, orderIndex: 1, isFree: true },
      { title: "المتغيرات وأنواع البيانات", type: "video" as const, duration: 45, orderIndex: 2, isFree: true },
      { title: "الدوال والبرمجة كائنية التوجه", type: "video" as const, duration: 60, orderIndex: 3, isFree: false },
      { title: "مشروع عملي - تطبيق ويب", type: "pdf" as const, duration: 20, orderIndex: 4, isFree: false },
    ],
    // UI/UX course
    [
      { title: "مبادئ التصميم", type: "video" as const, duration: 35, orderIndex: 1, isFree: true },
      { title: "أدوات Figma", type: "video" as const, duration: 40, orderIndex: 2, isFree: true },
      { title: "تصميم تجربة المستخدم", type: "video" as const, duration: 50, orderIndex: 3, isFree: false },
      { title: "دليل التصميم الاحترافي", type: "pdf" as const, duration: 15, orderIndex: 4, isFree: false },
    ],
    // JavaScript course
    [
      { title: "ES6+ الحديثة", type: "video" as const, duration: 50, orderIndex: 1, isFree: true },
      { title: "React.js الأساسي", type: "video" as const, duration: 65, orderIndex: 2, isFree: true },
      { title: "Node.js وقواعد البيانات", type: "video" as const, duration: 70, orderIndex: 3, isFree: false },
      { title: "مشروع متكامل", type: "text" as const, duration: 25, orderIndex: 4, isFree: false },
    ],
    // AI course
    [
      { title: "مقدمة في الذكاء الاصطناعي", type: "video" as const, duration: 40, orderIndex: 1, isFree: true },
      { title: "تعلم الآلة", type: "video" as const, duration: 55, orderIndex: 2, isFree: true },
      { title: "الشبكات العصبية", type: "video" as const, duration: 60, orderIndex: 3, isFree: false },
      { title: "تطبيقات عملية", type: "pdf" as const, duration: 20, orderIndex: 4, isFree: false },
    ],
    // PM course
    [
      { title: "أساسيات إدارة المشاريع", type: "video" as const, duration: 35, orderIndex: 1, isFree: true },
      { title: "منهجية Agile", type: "video" as const, duration: 40, orderIndex: 2, isFree: true },
      { title: "Scrum Master", type: "video" as const, duration: 45, orderIndex: 3, isFree: false },
      { title: "دراسات حالة", type: "text" as const, duration: 15, orderIndex: 4, isFree: false },
    ],
    // Marketing course
    [
      { title: "استراتيجيات التسويق", type: "video" as const, duration: 40, orderIndex: 1, isFree: true },
      { title: "إعلانات Google و Facebook", type: "video" as const, duration: 50, orderIndex: 2, isFree: true },
      { title: "SEO وتحسين محركات البحث", type: "video" as const, duration: 55, orderIndex: 3, isFree: false },
      { title: "خطة تسويقية عملية", type: "pdf" as const, duration: 20, orderIndex: 4, isFree: false },
    ],
  ];

  for (let i = 0; i < courseIds.length; i++) {
    for (const lesson of lessonTemplates[i]) {
      await db.insert(lessons).values({
        ...lesson,
        courseId: courseIds[i],
        description: `درس ${lesson.title} من كورس ${courseData[i].title}`,
      });
    }
  }

  // Insert quizzes for each course
  for (let i = 0; i < courseIds.length; i++) {
    const quiz1Result = await db.insert(quizzes).values({
      courseId: courseIds[i],
      title: `اختبار منتصف الكورس - ${courseData[i].title}`,
      description: "اختبار تقييمي على النصف الأول من الكورس",
      timeLimit: 20,
      passingScore: 60,
      totalMarks: 50,
    });
    const quiz1Id = Number(quiz1Result[0].insertId);

    const quiz2Result = await db.insert(quizzes).values({
      courseId: courseIds[i],
      title: `الاختبار النهائي - ${courseData[i].title}`,
      description: "الاختبار النهائي الشامل للكورس",
      timeLimit: 30,
      passingScore: 70,
      totalMarks: 100,
    });
    const quiz2Id = Number(quiz2Result[0].insertId);

    // Insert questions for quiz 1
    const questions1 = [
      {
        question: "ما هي الإجابة الصحيحة للسؤال الأول؟",
        options: ["الخيار أ", "الخيار ب", "الخيار ج", "الخيار د"],
        correctAnswer: 0,
        marks: 10,
        orderIndex: 1,
      },
      {
        question: "ما هي الإجابة الصحيحة للسؤال الثاني؟",
        options: ["الخيار أ", "الخيار ب", "الخيار ج", "الخيار د"],
        correctAnswer: 1,
        marks: 10,
        orderIndex: 2,
      },
      {
        question: "ما هي الإجابة الصحيحة للسؤال الثالث؟",
        options: ["الخيار أ", "الخيار ب", "الخيار ج", "الخيار د"],
        correctAnswer: 2,
        marks: 10,
        orderIndex: 3,
      },
      {
        question: "ما هي الإجابة الصحيحة للسؤال الرابع؟",
        options: ["الخيار أ", "الخيار ب", "الخيار ج", "الخيار د"],
        correctAnswer: 3,
        marks: 10,
        orderIndex: 4,
      },
      {
        question: "ما هي الإجابة الصحيحة للسؤال الخامس؟",
        options: ["الخيار أ", "الخيار ب", "الخيار ج", "الخيار د"],
        correctAnswer: 0,
        marks: 10,
        orderIndex: 5,
      },
    ];

    for (const q of questions1) {
      await db.insert(questions).values({
        ...q,
        quizId: quiz1Id,
        type: "multiple_choice",
      });
    }

    // Insert questions for quiz 2
    const questions2 = [
      {
        question: "السؤال النهائي الأول",
        options: ["الخيار أ", "الخيار ب", "الخيار ج", "الخيار د"],
        correctAnswer: 1,
        marks: 20,
        orderIndex: 1,
      },
      {
        question: "السؤال النهائي الثاني",
        options: ["الخيار أ", "الخيار ب", "الخيار ج", "الخيار د"],
        correctAnswer: 2,
        marks: 20,
        orderIndex: 2,
      },
      {
        question: "السؤال النهائي الثالث",
        options: ["الخيار أ", "الخيار ب", "الخيار ج", "الخيار د"],
        correctAnswer: 0,
        marks: 20,
        orderIndex: 3,
      },
      {
        question: "السؤال النهائي الرابع",
        options: ["الخيار أ", "الخيار ب", "الخيار ج", "الخيار د"],
        correctAnswer: 3,
        marks: 20,
        orderIndex: 4,
      },
      {
        question: "السؤال النهائي الخامس",
        options: ["الخيار أ", "الخيار ب", "الخيار ج", "الخيار د"],
        correctAnswer: 1,
        marks: 20,
        orderIndex: 5,
      },
    ];

    for (const q of questions2) {
      await db.insert(questions).values({
        ...q,
        quizId: quiz2Id,
        type: "multiple_choice",
      });
    }
  }

  console.log("Seed complete!");
  console.log("- Admin: admin@elm.com / password123");
  console.log("- Teachers: ahmed@elm.com, sara@elm.com / password123");
  console.log("- Students: student1@elm.com - student10@elm.com / password123");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
