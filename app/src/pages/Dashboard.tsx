import { Link, useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Users,
  GraduationCap,
  FileText,
  HelpCircle,
  BarChart3,
  ChevronLeft,
  Loader2,
  TrendingUp,
  Award,
  Eye,
  Bell,
  Target,
} from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  const { data: stats } = trpc.dashboard.stats.useQuery(undefined, {
    enabled: isAdmin,
  });

  const { data: recentEnrollments } = trpc.dashboard.recentEnrollments.useQuery(undefined, {
    enabled: isAdmin,
  });

  const { data: students } = trpc.dashboard.students.useQuery(undefined, {
    enabled: isAdmin,
  });

  const { data: selectedStudentDetails, isLoading: detailsLoading } =
    trpc.dashboard.studentProgressDetails.useQuery(
      { studentId: selectedStudentId ?? 0 },
      { enabled: isAdmin && !!selectedStudentId },
    );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    navigate("/");
    return null;
  }

  const selectedStudent = students?.find((s) => s.id === selectedStudentId);

  const statCards = [
    {
      title: "الكورسات",
      value: stats?.courses ?? 0,
      icon: BookOpen,
      color: "text-blue-600",
      bg: "bg-blue-50",
      link: "/dashboard/courses",
    },
    {
      title: "الطلاب",
      value: stats?.students ?? 0,
      icon: Users,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      link: "/dashboard/students",
    },
    {
      title: "المدربون",
      value: stats?.teachers ?? 0,
      icon: GraduationCap,
      color: "text-purple-600",
      bg: "bg-purple-50",
      link: "/dashboard/students",
    },
    {
      title: "التسجيلات",
      value: stats?.enrollments ?? 0,
      icon: TrendingUp,
      color: "text-amber-600",
      bg: "bg-amber-50",
      link: "/dashboard/courses",
    },
    {
      title: "الدروس",
      value: stats?.lessons ?? 0,
      icon: FileText,
      color: "text-cyan-600",
      bg: "bg-cyan-50",
      link: "/dashboard/lessons",
    },
    {
      title: "الاختبارات",
      value: stats?.quizAttempts ?? 0,
      icon: HelpCircle,
      color: "text-red-600",
      bg: "bg-red-50",
      link: "/dashboard/quizzes",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-slate-500 hover:text-slate-700">
                <ChevronLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-xl font-bold text-slate-900">لوحة التحكم</h1>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">مرحباً، {user?.name}</span>
              <Link to="/profile">
                <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user?.name?.charAt(0).toUpperCase() ?? "U"}
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {[
            { label: "إدارة الكورسات", link: "/dashboard/courses", icon: BookOpen },
            { label: "إدارة الدروس", link: "/dashboard/lessons", icon: FileText },
            { label: "إدارة الاختبارات", link: "/dashboard/quizzes", icon: HelpCircle },
            { label: "إدارة الطلاب", link: "/dashboard/students", icon: Users },
            { label: "إدارة الشهادات", link: "/dashboard/certificates", icon: Award },
            { label: "إدارة الإشعارات", link: "/dashboard/notifications", icon: Bell },
            { label: "إدارة العادات", link: "/dashboard/habits", icon: Target },
          ].map((action) => (
            <Link key={action.link} to={action.link}>
              <Button variant="outline" className="bg-white hover:bg-blue-50 whitespace-nowrap">
                <action.icon className="h-4 w-4 ml-2" />
                {action.label}
              </Button>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {statCards.map((stat, i) => (
            <Link key={i} to={stat.link}>
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-4 text-center">
                  <div className={`${stat.bg} w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                  <div className="text-sm text-slate-500">{stat.title}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <Card className="border-0 shadow-md mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              متابعة الطلاب
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-right py-3 px-4 text-sm text-slate-500">الطالب</th>
                    <th className="text-right py-3 px-4 text-sm text-slate-500">الإيميل</th>
                    <th className="text-right py-3 px-4 text-sm text-slate-500">الحالة</th>
                    <th className="text-right py-3 px-4 text-sm text-slate-500">الإجراء</th>
                  </tr>
                </thead>

                <tbody>
                  {students?.map((student) => (
                    <tr key={student.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium">{student.name}</td>
                      <td className="py-3 px-4 text-sm text-slate-500">{student.email}</td>
                      <td className="py-3 px-4">
                        <Badge className={student.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                          {student.isActive ? "نشط" : "موقوف"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedStudentId(student.id)}
                        >
                          <Eye className="h-4 w-4 ml-1" />
                          عرض التقدم
                        </Button>
                      </td>
                    </tr>
                  ))}

                  {(!students || students.length === 0) && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">
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
          <Card className="border-0 shadow-md mb-8">
            <CardHeader>
              <CardTitle>
                تفاصيل الطالب: {selectedStudent?.name ?? "طالب"}
              </CardTitle>
            </CardHeader>

            <CardContent>
              {detailsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="space-y-8">
                  <div>
                    <h3 className="font-bold text-lg mb-4">الكورسات المسجل بها</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-right py-2 px-3">الكورس</th>
                            <th className="text-right py-2 px-3">الحالة</th>
                            <th className="text-right py-2 px-3">التقدم</th>
                            <th className="text-right py-2 px-3">تاريخ التسجيل</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedStudentDetails?.enrollments?.map((item) => (
                            <tr key={item.enrollmentId} className="border-b">
                              <td className="py-2 px-3">{item.courseTitle}</td>
                              <td className="py-2 px-3">{item.status}</td>
                              <td className="py-2 px-3">
                                <div className="flex items-center gap-2">
                                  <Progress value={item.progress ?? 0} className="w-24 h-2" />
                                  <span>{item.progress ?? 0}%</span>
                                </div>
                              </td>
                              <td className="py-2 px-3">
                                {item.enrolledAt
                                  ? new Date(item.enrolledAt).toLocaleDateString("ar-EG")
                                  : "-"}
                              </td>
                            </tr>
                          ))}

                          {(!selectedStudentDetails?.enrollments ||
                            selectedStudentDetails.enrollments.length === 0) && (
                            <tr>
                              <td colSpan={4} className="py-6 text-center text-slate-400">
                                الطالب غير مسجل في أي كورس
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg mb-4">حضور الدروس</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-right py-2 px-3">الكورس</th>
                            <th className="text-right py-2 px-3">الدرس</th>
                            <th className="text-right py-2 px-3">الحالة</th>
                            <th className="text-right py-2 px-3">تاريخ الإكمال</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedStudentDetails?.lessons?.map((lesson) => (
                            <tr key={`${lesson.courseId}-${lesson.lessonId}`} className="border-b">
                              <td className="py-2 px-3">{lesson.courseTitle}</td>
                              <td className="py-2 px-3">{lesson.lessonTitle}</td>
                              <td className="py-2 px-3">
                                <Badge className={lesson.isCompleted ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                                  {lesson.isCompleted ? "تم الحضور" : "لم يحضر"}
                                </Badge>
                              </td>
                              <td className="py-2 px-3">
                                {lesson.completedAt
                                  ? new Date(lesson.completedAt).toLocaleDateString("ar-EG")
                                  : "-"}
                              </td>
                            </tr>
                          ))}

                          {(!selectedStudentDetails?.lessons ||
                            selectedStudentDetails.lessons.length === 0) && (
                            <tr>
                              <td colSpan={4} className="py-6 text-center text-slate-400">
                                لا توجد دروس مرتبطة بهذا الطالب
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg mb-4">نتائج الاختبارات وإجابات الطالب</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-right py-2 px-3">الكورس</th>
                            <th className="text-right py-2 px-3">الدرجة</th>
                            <th className="text-right py-2 px-3">النسبة</th>
                            <th className="text-right py-2 px-3">الحالة</th>
                            <th className="text-right py-2 px-3">الإجابات</th>
                          </tr>
                        </thead>

                        <tbody>
                          {selectedStudentDetails?.quizzes?.map((attempt, index) => (
                            <tr key={index} className="border-b align-top">
                              <td className="py-2 px-3">{attempt.courseTitle}</td>
                              <td className="py-2 px-3">
                                {attempt.score} / {attempt.totalMarks}
                              </td>
                              <td className="py-2 px-3">
                                {Number(attempt.percentage ?? 0).toFixed(0)}%
                              </td>
                              <td className="py-2 px-3">
                                <Badge className={attempt.isPassed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                                  {attempt.isPassed ? "ناجح" : "راسب"}
                                </Badge>
                              </td>
                              <td className="py-2 px-3 text-xs max-w-xs whitespace-pre-wrap">
                                {JSON.stringify(attempt.answers, null, 2)}
                              </td>
                            </tr>
                          ))}

                          {(!selectedStudentDetails?.quizzes ||
                            selectedStudentDetails.quizzes.length === 0) && (
                            <tr>
                              <td colSpan={5} className="py-6 text-center text-slate-400">
                                لم يحل الطالب أي اختبار بعد
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>آخر التسجيلات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">الطالب</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">الكورس</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">الحالة</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">التقدم</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">تاريخ التسجيل</th>
                  </tr>
                </thead>

                <tbody>
                  {recentEnrollments?.map((enrollment) => (
                    <tr key={enrollment.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium">{enrollment.studentName}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{enrollment.courseTitle}</td>
                      <td className="py-3 px-4">
                        <Badge
                          className={
                            enrollment.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : enrollment.status === "active"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-red-100 text-red-700"
                          }
                        >
                          {enrollment.status === "completed"
                            ? "مكتمل"
                            : enrollment.status === "active"
                              ? "نشط"
                              : "متوقف"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Progress value={enrollment.progress ?? 0} className="w-20 h-2" />
                          <span>{enrollment.progress ?? 0}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-400">
                        {enrollment.enrolledAt
                          ? new Date(enrollment.enrolledAt).toLocaleDateString("ar-EG")
                          : "-"}
                      </td>
                    </tr>
                  ))}

                  {(!recentEnrollments || recentEnrollments.length === 0) && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        لا توجد تسجيلات حالياً
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}