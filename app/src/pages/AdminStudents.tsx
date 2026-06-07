import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  ChevronLeft,
  UserCheck,
  UserX,
  Loader2,
  Eye,
  Award,
  BookOpen,
  CheckCircle,
  Target,
  HelpCircle,
  Clock,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

const palette = [
  { bg: "#E5F0FF", border: "#B3D4FF", text: "#1E40AF" },
  { bg: "#FFE5EC", border: "#FFADC2", text: "#BE185D" },
  { bg: "#EAF7EE", border: "#B3E5C1", text: "#166534" },
  { bg: "#FFF4E5", border: "#FFD6B3", text: "#C2410C" },
  { bg: "#F3E8FF", border: "#D8B4FE", text: "#7C3AED" },
  { bg: "#E6FFFA", border: "#99F6E4", text: "#0F766E" },
];

function statusLabel(status?: string) {
  if (status === "completed") return "مكتمل";
  if (status === "active") return "نشط";
  return "متوقف";
}

function formatDate(date?: string | Date | null) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("ar-EG");
}

export default function AdminStudents() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const utils = trpc.useUtils();

  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"courses" | "habits" | "quizzes">(
    "courses",
  );

  const { data: students } = trpc.dashboard.students.useQuery(undefined, {
    enabled: isAdmin,
  });

  const { data: progressData, isLoading: progressLoading } =
    trpc.dashboard.studentProgressDetails.useQuery(
      { studentId: selectedStudentId ?? 0 },
      { enabled: !!selectedStudentId },
    );

  const generateCertificateMutation = trpc.certificate.generate.useMutation();

  const toggleMutation = trpc.dashboard.toggleUserStatus.useMutation({
    onSuccess: () => {
      utils.dashboard.students.invalidate();
    },
  });

  const selectedStudent = students?.find((s) => s.id === selectedStudentId);

  const enrollments = progressData?.enrollments ?? [];
  const lessons = progressData?.lessons ?? [];
  const quizzes = progressData?.quizzes ?? [];
  const habits = progressData?.habits ?? [];

  const completedLessons = lessons.filter((l) => l.isCompleted).length;

  const avgCourseProgress =
    enrollments.length > 0
      ? Math.round(
          enrollments.reduce((sum, e) => sum + Number(e.progress ?? 0), 0) /
            enrollments.length,
        )
      : 0;

  const avgQuizScore =
    quizzes.length > 0
      ? Math.round(
          quizzes.reduce((sum, q) => sum + Number(q.percentage ?? 0), 0) /
            quizzes.length,
        )
      : 0;

  const avgHabitProgress =
    habits.length > 0
      ? Math.round(
          habits.reduce((sum, h) => sum + Number(h.progress ?? 0), 0) /
            habits.length,
        )
      : 0;

  const tabs = [
    { key: "courses", label: "البرامج", icon: BookOpen },
    { key: "habits", label: "العادات", icon: Target },
    { key: "quizzes", label: "الاختبارات", icon: HelpCircle },
  ] as const;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="text-slate-500 hover:text-slate-700">
                <ChevronLeft className="h-5 w-5" />
              </Link>

              <h1 className="text-xl font-bold text-slate-900">إدارة الطلاب</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {!students ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            <Card className="border-0 shadow-sm rounded-[2rem] mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700">
                    <Users className="h-5 w-5" />
                  </div>
                  الطلاب
                  <Badge className="bg-slate-100 text-slate-600 rounded-full">
                    {students.length}
                  </Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">
                          الطالب
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">
                          البريد
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">
                          الحالة
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">
                          التسجيل
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">
                          الإجراءات
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {students.map((student) => (
                        <tr
                          key={student.id}
                          className="border-b border-slate-50 hover:bg-slate-50"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                                {student.avatar ? (
                                  <img
                                    src={student.avatar}
                                    alt={student.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  student.name?.charAt(0).toUpperCase() ?? "U"
                                )}
                              </div>

                              <span className="font-medium text-slate-900">
                                {student.name}
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-sm text-slate-500">
                            {student.email}
                          </td>

                          <td className="py-3 px-4">
                            <Badge
                              className={
                                student.isActive
                                  ? "bg-green-100 text-green-700 rounded-full"
                                  : "bg-red-100 text-red-700 rounded-full"
                              }
                            >
                              {student.isActive ? (
                                <span className="flex items-center gap-1">
                                  <UserCheck className="h-3 w-3" />
                                  نشط
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <UserX className="h-3 w-3" />
                                  معطل
                                </span>
                              )}
                            </Badge>
                          </td>

                          <td className="py-3 px-4 text-sm text-slate-400">
                            {formatDate(student.createdAt)}
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-2xl bg-white"
                                onClick={() => {
                                  setSelectedStudentId(student.id);
                                  setActiveTab("courses");
                                }}
                              >
                                <Eye className="h-4 w-4 ml-1" />
                                عرض المتابعة
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-2xl bg-white"
                                onClick={async () => {
                                  const courseId = prompt("أدخل ID البرنامج");
                                  if (!courseId) return;

                                  const fileUrl = prompt(
                                    "ضع رابط ملف الشهادة PDF أو صورة",
                                  );
                                  if (!fileUrl) return;

                                  try {
                                    await generateCertificateMutation.mutateAsync({
                                      studentId: student.id,
                                      courseId: Number(courseId),
                                      template: "uploaded",
                                      fileUrl,
                                    });

                                    alert("تم رفع الشهادة للطالب بنجاح");
                                  } catch (err) {
                                    console.error(err);
                                    alert("حدث خطأ أثناء رفع الشهادة");
                                  }
                                }}
                              >
                                <Award className="h-4 w-4 ml-1" />
                                رفع شهادة
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-2xl"
                                onClick={() => {
                                  if (
                                    confirm(
                                      "هل أنت متأكد من تغيير حالة هذا الطالب؟",
                                    )
                                  ) {
                                    toggleMutation.mutate({ id: student.id });
                                  }
                                }}
                                disabled={toggleMutation.isPending}
                              >
                                {student.isActive ? "تعطيل" : "تفعيل"}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {students.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400">
                            لا يوجد طلاب
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {selectedStudentId && (
              <Card className="border-0 shadow-sm rounded-[2rem]">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-4">
                    <div>
                      متابعة الطالب:{" "}
                      <span className="text-blue-700">
                        {selectedStudent?.name ?? "طالب"}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-2xl bg-white"
                      onClick={() => setSelectedStudentId(null)}
                    >
                      إغلاق
                    </Button>
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  {progressLoading ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div
                          className="rounded-3xl border p-5"
                          style={{
                            backgroundColor: palette[0].bg,
                            borderColor: palette[0].border,
                          }}
                        >
                          <TrendingUp
                            className="h-6 w-6 mb-3"
                            style={{ color: palette[0].text }}
                          />
                          <div
                            className="text-3xl font-extrabold"
                            style={{ color: palette[0].text }}
                          >
                            {avgCourseProgress}%
                          </div>
                          <div className="text-sm" style={{ color: palette[0].text }}>
                            متوسط تقدم البرامج
                          </div>
                        </div>

                        <div
                          className="rounded-3xl border p-5"
                          style={{
                            backgroundColor: palette[2].bg,
                            borderColor: palette[2].border,
                          }}
                        >
                          <Target
                            className="h-6 w-6 mb-3"
                            style={{ color: palette[2].text }}
                          />
                          <div
                            className="text-3xl font-extrabold"
                            style={{ color: palette[2].text }}
                          >
                            {avgHabitProgress}%
                          </div>
                          <div className="text-sm" style={{ color: palette[2].text }}>
                            متوسط إنجاز العادات
                          </div>
                        </div>

                        <div
                          className="rounded-3xl border p-5"
                          style={{
                            backgroundColor: palette[4].bg,
                            borderColor: palette[4].border,
                          }}
                        >
                          <HelpCircle
                            className="h-6 w-6 mb-3"
                            style={{ color: palette[4].text }}
                          />
                          <div
                            className="text-3xl font-extrabold"
                            style={{ color: palette[4].text }}
                          >
                            {avgQuizScore}%
                          </div>
                          <div className="text-sm" style={{ color: palette[4].text }}>
                            متوسط نتائج الاختبارات
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 border-b pb-4">
                        {tabs.map((tab) => {
                          const Icon = tab.icon;
                          const active = activeTab === tab.key;

                          return (
                            <Button
                              key={tab.key}
                              variant={active ? "default" : "outline"}
                              className={
                                active
                                  ? "rounded-2xl bg-blue-700 hover:bg-blue-800"
                                  : "rounded-2xl bg-white"
                              }
                              onClick={() => setActiveTab(tab.key)}
                            >
                              <Icon className="h-4 w-4 ml-2" />
                              {tab.label}
                            </Button>
                          );
                        })}
                      </div>

                      {activeTab === "courses" && (
                        <div className="space-y-5">
                          <h2 className="font-bold text-xl text-slate-900">
                            البرامج والتقدم
                          </h2>

                          {enrollments.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {enrollments.map((enrollment, index) => {
                                const color = palette[index % palette.length];

                                return (
                                  <div
                                    key={enrollment.enrollmentId}
                                    className="rounded-3xl border p-5"
                                    style={{
                                      backgroundColor: color.bg,
                                      borderColor: color.border,
                                    }}
                                  >
                                    <div className="flex items-start justify-between gap-3 mb-4">
                                      <div>
                                        <div className="font-bold text-slate-900">
                                          {enrollment.courseTitle}
                                        </div>
                                        <div className="text-sm text-slate-500 mt-1">
                                          تاريخ التسجيل:{" "}
                                          {formatDate(enrollment.enrolledAt)}
                                        </div>
                                      </div>

                                      <Badge className="bg-white text-slate-700 rounded-full">
                                        {statusLabel(enrollment.status)}
                                      </Badge>
                                    </div>

                                    <div className="flex items-center gap-3">
                                      <Progress
                                        value={enrollment.progress ?? 0}
                                        className="h-2"
                                      />
                                      <span
                                        className="text-sm font-bold min-w-fit"
                                        style={{ color: color.text }}
                                      >
                                        {enrollment.progress ?? 0}%
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <EmptyState text="الطالب غير مسجل في أي برنامج" />
                          )}
                        </div>
                      )}

                      {activeTab === "habits" && (
                        <div className="space-y-5">
                          <h2 className="font-bold text-xl text-slate-900">
                            العادات اليومية
                          </h2>

                          {habits.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {habits.map((habit, index) => {
                                const color = palette[index % palette.length];

                                return (
                                  <div
                                    key={habit.id}
                                    className="rounded-3xl border p-5"
                                    style={{
                                      backgroundColor: color.bg,
                                      borderColor: color.border,
                                    }}
                                  >
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                      <div>
                                        <div className="font-bold text-slate-900 line-clamp-1">
                                          {habit.title}
                                        </div>
                                        {habit.description && (
                                          <div className="text-sm text-slate-500 mt-1 line-clamp-2">
                                            {habit.description}
                                          </div>
                                        )}
                                      </div>

                                      {habit.isGoalCompleted && (
                                        <Badge className="bg-white text-green-700 rounded-full">
                                          مكتملة
                                        </Badge>
                                      )}
                                    </div>

                                    <div className="mb-3">
                                      <div className="flex justify-between text-sm mb-2">
                                        <span className="text-slate-500">
                                          التقدم
                                        </span>
                                        <span
                                          className="font-bold"
                                          style={{ color: color.text }}
                                        >
                                          {habit.progress}%
                                        </span>
                                      </div>

                                      <Progress value={habit.progress ?? 0} />
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                      <span className="text-slate-600">
                                        {habit.currentStreak} / {habit.goalDays} يوم
                                      </span>

                                      <span className="text-slate-500">
                                        آخر إنجاز: {formatDate(habit.lastCompletedAt)}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <EmptyState text="لا توجد عادات لهذا الطالب" />
                          )}
                        </div>
                      )}

                      {activeTab === "quizzes" && (
                        <div className="space-y-5">
                          <h2 className="font-bold text-xl text-slate-900">
                            نتائج الاختبارات
                          </h2>

                          {quizzes.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {quizzes.map((quiz, index) => {
                                const percentage = Number(quiz.percentage ?? 0);
                                const color = quiz.isPassed ? palette[2] : palette[1];

                                return (
                                  <div
                                    key={`${quiz.quizId}-${index}`}
                                    className="rounded-3xl border p-5"
                                    style={{
                                      backgroundColor: color.bg,
                                      borderColor: color.border,
                                    }}
                                  >
                                    <div className="flex items-start justify-between gap-3 mb-4">
                                      <div>
                                        <div className="font-bold text-slate-900">
                                          {quiz.quizTitle || "اختبار"}
                                        </div>
                                        <div className="text-sm text-slate-500 mt-1">
                                          {quiz.courseTitle}
                                        </div>
                                      </div>

                                      <Badge
                                        className={
                                          quiz.isPassed
                                            ? "bg-white text-green-700 rounded-full"
                                            : "bg-white text-red-700 rounded-full"
                                        }
                                      >
                                        {quiz.isPassed ? "ناجح" : "لم يجتز"}
                                      </Badge>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3 mb-4">
                                      <SmallMetric
                                        label="الدرجة"
                                        value={`${quiz.score} / ${quiz.totalMarks}`}
                                      />
                                      <SmallMetric
                                        label="النسبة"
                                        value={`${percentage.toFixed(0)}%`}
                                      />
                                      <SmallMetric
                                        label="التاريخ"
                                        value={formatDate(quiz.createdAt)}
                                      />
                                    </div>

                                    <div>
                                      <div className="flex justify-between text-sm mb-2">
                                        <span className="text-slate-500">
                                          نتيجة الاختبار
                                        </span>
                                        <span
                                          className="font-bold"
                                          style={{ color: color.text }}
                                        >
                                          {percentage.toFixed(0)}%
                                        </span>
                                      </div>

                                      <Progress value={percentage} />
                                    </div>

                                    <div className="mt-4 rounded-2xl bg-white/70 border border-white p-3 text-sm text-slate-600">
                                      ملخص النتيجة والحالة والتاريخ.
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <EmptyState text="لم يحل الطالب أي اختبار بعد" />
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function SmallMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/70 border border-white p-3 text-center">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="text-sm font-bold text-slate-900">{value}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-3xl bg-slate-50 border border-slate-100 p-10 text-center text-slate-400">
      {text}
    </div>
  );
}