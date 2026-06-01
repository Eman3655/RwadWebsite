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
} from "lucide-react";

import { useState } from "react";

export default function AdminStudents() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const utils = trpc.useUtils();

  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  const { data: students } = trpc.dashboard.students.useQuery(undefined, {
    enabled: isAdmin,
  });

  const { data: progressData, isLoading: progressLoading } =
    trpc.dashboard.studentProgressDetails.useQuery(
      { studentId: selectedStudentId ?? 0 },
      {
        enabled: !!selectedStudentId,
      },
    );

const generateCertificateMutation =
  trpc.certificate.generate.useMutation();

  const toggleMutation = trpc.dashboard.toggleUserStatus.useMutation({
    onSuccess: () => {
      utils.dashboard.students.invalidate();
    },
  });

  

  const selectedStudent = students?.find(
    (s) => s.id === selectedStudentId,
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="text-slate-500 hover:text-slate-700"
              >
                <ChevronLeft className="h-5 w-5" />
              </Link>

              <h1 className="text-xl font-bold text-slate-900">
                إدارة الطلاب
              </h1>
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
            <Card className="border-0 shadow-md mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                    <Users className="h-4 w-4 text-white" />
                  </div>

                  الطلاب

                  <Badge className="bg-slate-100 text-slate-600">
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
                      {students.map((u) => (
                        <tr
                          key={u.id}
                          className="border-b border-slate-50 hover:bg-slate-50"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                {u.avatar ? (
                                  <img
                                    src={u.avatar}
                                    alt={u.name}
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  u.name?.charAt(0).toUpperCase() ?? "U"
                                )}
                              </div>

                              <span className="font-medium text-slate-900">
                                {u.name}
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-sm text-slate-500">
                            {u.email}
                          </td>

                          <td className="py-3 px-4">
                            <Badge
                              className={
                                u.isActive
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }
                            >
                              {u.isActive ? (
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
                            {u.createdAt
                              ? new Date(u.createdAt).toLocaleDateString(
                                  "ar-SA",
                                )
                              : "-"}
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setSelectedStudentId(u.id)
                                }
                              >
                                <Eye className="h-4 w-4 ml-1" />
                                عرض التقدم
                              </Button>

<Button
  variant="outline"
  size="sm"
  onClick={async () => {
    const courseId = prompt("أدخل ID الكورس");
    if (!courseId) return;

    const fileUrl = prompt("ضع رابط ملف الشهادة PDF أو صورة");
    if (!fileUrl) return;

    try {
      await generateCertificateMutation.mutateAsync({
        studentId: u.id,
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
                                onClick={() => {
                                  if (
                                    confirm(
                                      "هل أنت متأكد من تغيير حالة هذا الطالب؟",
                                    )
                                  ) {
                                    toggleMutation.mutate({
                                      id: u.id,
                                    });
                                  }
                                }}
                                disabled={toggleMutation.isPending}
                              >
                                {u.isActive ? "تعطيل" : "تفعيل"}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {students.length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-8 text-center text-slate-400"
                          >
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
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>
                    متابعة الطالب:
                    {" "}
                    {selectedStudent?.name}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  {progressLoading ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                  ) : (
                    <div className="space-y-10">
                      <div>
                        <h2 className="font-bold text-lg mb-4">
                          الكورسات والتقدم
                        </h2>

                        <div className="space-y-4">
                          {progressData?.enrollments?.map((e) => (
                            <div
                              key={e.enrollmentId}
                              className="border rounded-xl p-4"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="font-semibold">
                                  {e.courseTitle}
                                </div>

                                <Badge>
                                  {e.status}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-3">
                                <Progress
                                  value={e.progress ?? 0}
                                  className="h-2"
                                />

                                <span className="text-sm text-slate-500 min-w-fit">
                                  {e.progress ?? 0}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h2 className="font-bold text-lg mb-4">
                          الدروس المكتملة
                        </h2>

                        <div className="space-y-3">
                          {progressData?.lessons?.map((lesson) => (
                            <div
                              key={`${lesson.courseId}-${lesson.lessonId}`}
                              className="border rounded-xl p-4 flex items-center justify-between"
                            >
                              <div>
                                <div className="font-medium">
                                  {lesson.lessonTitle}
                                </div>

                                <div className="text-sm text-slate-500">
                                  {lesson.courseTitle}
                                </div>
                              </div>

                              <Badge
                                className={
                                  lesson.isCompleted
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }
                              >
                                {lesson.isCompleted
                                  ? "تم الحضور"
                                  : "لم يحضر"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h2 className="font-bold text-lg mb-4">
                          نتائج الاختبارات
                        </h2>

                        <div className="space-y-4">
                          {progressData?.quizzes?.map((quiz, index) => (
                            <div
                              key={index}
                              className="border rounded-xl p-4"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <div className="font-semibold">
                                    {quiz.courseTitle}
                                  </div>

                                  <div className="text-sm text-slate-500">
                                    {quiz.score} / {quiz.totalMarks}
                                  </div>
                                </div>

                                <Badge
                                  className={
                                    quiz.isPassed
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                  }
                                >
                                  {quiz.percentage}%
                                </Badge>
                              </div>

                              <div className="bg-slate-50 rounded-lg p-3 overflow-auto text-xs">
                                <pre>
                                  {JSON.stringify(
                                    quiz.answers,
                                    null,
                                    2,
                                  )}
                                </pre>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
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