import { Link, useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Users,
  FileText,
  HelpCircle,
  ChevronLeft,
  Loader2,
  TrendingUp,
  Award,
  Bell,
  Target,
  BarChart3,
  Activity,
  CheckCircle,
  Paperclip,
  UserCheck,
  UserX,
  GraduationCap,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  RadialBarChart,
  RadialBar,
  Cell,
} from "recharts";

const palette = [
  { bg: "#E5F0FF", border: "#B3D4FF", text: "#1E40AF" },
  { bg: "#EAF7EE", border: "#B3E5C1", text: "#166534" },
  { bg: "#FFF4E5", border: "#FFD6B3", text: "#C2410C" },
  { bg: "#F3E8FF", border: "#D8B4FE", text: "#7C3AED" },
  { bg: "#FFE5EC", border: "#FFADC2", text: "#BE185D" },
  { bg: "#E6FFFA", border: "#99F6E4", text: "#0F766E" },
];

function toArabicStatus(status?: string) {
  if (status === "completed") return "مكتمل";
  if (status === "active") return "نشط";
  return "متوقف";
}

function getProgressBucket(progress: number) {
  if (progress >= 100) return "100%";
  if (progress >= 75) return "75-99%";
  if (progress >= 50) return "50-74%";
  if (progress >= 25) return "25-49%";
  return "0-24%";
}

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";

  const { data: stats } = trpc.dashboard.stats.useQuery(undefined, {
    enabled: isAdmin,
  });

  const { data: allEnrollments } =
    trpc.dashboard.recentEnrollments.useQuery(undefined, {
      enabled: isAdmin,
    });

  const { data: latestEnrollments } =
    trpc.dashboard.latestEnrollments.useQuery(undefined, {
      enabled: isAdmin,
    });

  const { data: students } = trpc.dashboard.students.useQuery(undefined, {
    enabled: isAdmin,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    navigate("/");
    return null;
  }

  const enrollments = allEnrollments ?? [];
  const latestRows = latestEnrollments ?? [];
  const studentsList = students ?? [];

  const activeStudents = studentsList.filter((s) => s.isActive).length;
  const inactiveStudents = studentsList.length - activeStudents;

  const completedEnrollments = enrollments.filter(
    (e) => e.status === "completed"
  ).length;

  const activeEnrollments = enrollments.filter(
    (e) => e.status === "active"
  ).length;

  const stoppedEnrollments =
    enrollments.length - completedEnrollments - activeEnrollments;

  const averageProgress =
    enrollments.length > 0
      ? Math.round(
          enrollments.reduce(
            (sum, item) => sum + Number(item.progress ?? 0),
            0
          ) / enrollments.length
        )
      : 0;

  const completionRate =
    enrollments.length > 0
      ? Math.round((completedEnrollments / enrollments.length) * 100)
      : 0;

  const activeEnrollmentRate =
    enrollments.length > 0
      ? Math.round((activeEnrollments / enrollments.length) * 100)
      : 0;

  const dailyEnrollmentsMap: Record<string, number> = {};

  enrollments.forEach((item: any) => {
    const key = item.enrolledAt
      ? new Date(item.enrolledAt).toLocaleDateString("ar-EG", {
          day: "2-digit",
          month: "2-digit",
        })
      : "غير محدد";

    dailyEnrollmentsMap[key] = (dailyEnrollmentsMap[key] ?? 0) + 1;
  });

  const dailyEnrollmentsData = Object.entries(dailyEnrollmentsMap)
    .slice(0, 7)
    .map(([date, count]) => ({
      date,
      count,
    }));

  const enrollmentStatusData = [
    { name: "نشط", value: activeEnrollments },
    { name: "مكتمل", value: completedEnrollments },
    { name: "متوقف", value: stoppedEnrollments },
  ];

  const progressBuckets = ["0-24%", "25-49%", "50-74%", "75-99%", "100%"].map(
    (bucket) => ({
      name: bucket,
      value: enrollments.filter(
        (item) => getProgressBucket(Number(item.progress ?? 0)) === bucket
      ).length,
    })
  );

  const topStudentsByProgress = [...enrollments]
    .sort((a, b) => Number(b.progress ?? 0) - Number(a.progress ?? 0))
    .slice(0, 5)
    .map((item) => ({
      name: item.studentName,
      course: item.courseTitle,
      progress: Number(item.progress ?? 0),
      status: item.status,
    }));

  const recentEnrollmentRows = latestRows.map((item) => ({
    student: item.studentName,
    course: item.courseTitle,
    progress: Number(item.progress ?? 0),
    status: item.status,
    date: item.enrolledAt
      ? new Date(item.enrolledAt).toLocaleDateString("ar-EG")
      : "غير محدد",
  }));

  const statCards = [
    {
      title: "البرامج التربوية",
      value: stats?.courses ?? 0,
      description: "عدد البرامج المنشأة داخل المنصة",
      icon: BookOpen,
      link: "/dashboard/courses",
      color: palette[0],
    },
    {
      title: "الطلاب",
      value: stats?.students ?? 0,
      description: "إجمالي حسابات الطلاب",
      icon: Users,
      link: "/dashboard/students",
      color: palette[1],
    },
    {
      title: "التسجيلات",
      value: stats?.enrollments ?? 0,
      description: "عدد التحاقات الطلاب بالبرامج",
      icon: TrendingUp,
      link: "/dashboard/courses",
      color: palette[2],
    },
    {
      title: "الدروس",
      value: stats?.lessons ?? 0,
      description: "إجمالي الدروس المنشورة",
      icon: FileText,
      link: "/dashboard/lessons",
      color: palette[5],
    },
    {
      title: "محاولات الاختبارات",
      value: stats?.quizAttempts ?? 0,
      description: "عدد محاولات الطلاب في الاختبارات",
      icon: HelpCircle,
      link: "/dashboard/quizzes",
      color: palette[4],
    },
  ];

  const quickActions = [
    { label: "إدارة البرامج", link: "/dashboard/courses", icon: BookOpen },
    { label: "إدارة المرفقات", link: "/dashboard/attachments", icon: Paperclip },
    { label: "إدارة الدروس", link: "/dashboard/lessons", icon: FileText },
    { label: "إدارة الاختبارات", link: "/dashboard/quizzes", icon: HelpCircle },
    { label: "إدارة الطلاب", link: "/dashboard/students", icon: Users },
    { label: "إدارة الشهادات", link: "/dashboard/certificates", icon: Award },
    { label: "إدارة الإشعارات", link: "/dashboard/notifications", icon: Bell },
    { label: "إدارة العادات", link: "/dashboard/habits", icon: Target },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-slate-500 hover:text-slate-700">
                <ChevronLeft className="h-5 w-5" />
              </Link>

              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  لوحة إحصائيات مخيم الرواد
                </h1>
                <p className="text-xs text-slate-400 hidden sm:block">
                  متابعة البرامج، الطلاب، التقدم، والاختبارات
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-sm text-slate-500">
                مرحبًا، {user?.name}
              </span>

              <Link to="/profile">
                <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user?.name?.charAt(0).toUpperCase() ?? "U"
                  )}
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div
          className="rounded-[2rem] border shadow-sm p-7 mb-8 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #E5F0FF 0%, #F3E8FF 55%, #EAF7EE 100%)",
            borderColor: "#D8B4FE",
          }}
        >
          <div className="absolute -top-20 -left-16 w-64 h-64 bg-white/40 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-16 w-72 h-72 bg-white/40 rounded-full blur-3xl" />

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/70 border border-white px-3 py-1 rounded-full text-sm text-blue-700 mb-4">
                <BarChart3 className="h-4 w-4" />
                إحصائيات الموقع
              </div>

              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
                صورة عامة عن سير البرامج والطلاب
              </h2>

              <p className="text-slate-600 mt-3 max-w-2xl leading-7">
                تعرض هذه الصفحة مؤشرات الموقع الأساسية: عدد البرامج، الطلاب،
                التسجيلات، الدروس، الاختبارات، ونسب التقدم والإنجاز؛ لمساعدة
                المشرف على متابعة الأثر التعليمي والتربوي بصورة واضحة.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 min-w-[290px]">
              <div className="bg-white/80 backdrop-blur rounded-3xl border border-white p-4 text-center">
                <div className="text-sm text-slate-500 mb-1">
                  متوسط التقدم
                </div>
                <div className="text-4xl font-extrabold text-blue-700">
                  {averageProgress}%
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur rounded-3xl border border-white p-4 text-center">
                <div className="text-sm text-slate-500 mb-1">نسبة الإتمام</div>
                <div className="text-4xl font-extrabold text-green-700">
                  {completionRate}%
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <Link key={action.link} to={action.link}>
                <Button
                  variant="outline"
                  className="bg-white hover:bg-blue-50 whitespace-nowrap rounded-2xl"
                >
                  <Icon className="h-4 w-4 ml-2" />
                  {action.label}
                </Button>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;

            return (
              <Link key={stat.title} to={stat.link}>
                <Card
                  className="rounded-3xl shadow-sm border hover:-translate-y-1 hover:shadow-md transition h-full"
                  style={{
                    backgroundColor: stat.color.bg,
                    borderColor: stat.color.border,
                  }}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center"
                        style={{ color: stat.color.text }}
                      >
                        <Icon className="h-6 w-6" />
                      </div>

                      <ChevronLeft
                        className="h-5 w-5 opacity-60"
                        style={{ color: stat.color.text }}
                      />
                    </div>

                    <div
                      className="text-3xl font-extrabold mt-4"
                      style={{ color: stat.color.text }}
                    >
                      {stat.value}
                    </div>

                    <div
                      className="text-base font-bold mt-1"
                      style={{ color: stat.color.text }}
                    >
                      {stat.title}
                    </div>

                    <div className="text-xs mt-2 text-slate-600 leading-5">
                      {stat.description}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-sm rounded-[2rem]">
            <CardContent className="p-6">
              <UserCheck className="h-7 w-7 text-green-700 mb-3" />
              <h3 className="font-extrabold text-slate-900">
                الطلاب النشطون
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                حسابات مفعلة داخل المنصة
              </p>
              <div className="text-4xl font-extrabold text-green-700 mt-4">
                {activeStudents}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm rounded-[2rem]">
            <CardContent className="p-6">
              <UserX className="h-7 w-7 text-pink-700 mb-3" />
              <h3 className="font-extrabold text-slate-900">
                الطلاب الموقوفون
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                حسابات غير نشطة حاليًا
              </p>
              <div className="text-4xl font-extrabold text-pink-700 mt-4">
                {inactiveStudents}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm rounded-[2rem]">
            <CardContent className="p-6">
              <Activity className="h-7 w-7 text-blue-700 mb-3" />
              <h3 className="font-extrabold text-slate-900">
                التسجيلات النشطة
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                طلاب ما زالوا داخل البرامج
              </p>
              <div className="text-4xl font-extrabold text-blue-700 mt-4">
                {activeEnrollmentRate}%
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm rounded-[2rem]">
            <CardContent className="p-6">
              <GraduationCap className="h-7 w-7 text-purple-700 mb-3" />
              <h3 className="font-extrabold text-slate-900">
                التسجيلات المكتملة
              </h3>
              <p className="text-sm text-slate-500 mt-1">برامج أتمها الطلاب</p>
              <div className="text-4xl font-extrabold text-purple-700 mt-4">
                {completedEnrollments}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-sm rounded-[2rem] lg:col-span-2">
            <CardContent className="p-6">
              <h3 className="text-xl font-extrabold text-slate-900">
                نشاط التسجيلات
              </h3>
              <p className="text-sm text-slate-500 mt-1 mb-5">
                عدد التحاقات الطلاب بالبرامج خلال الأيام الأخيرة.
              </p>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyEnrollmentsData}>
                    <defs>
                      <linearGradient
                        id="enrollmentsGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#B3D4FF"
                          stopOpacity={0.9}
                        />
                        <stop
                          offset="100%"
                          stopColor="#E5F0FF"
                          stopOpacity={0.15}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid stroke="#E2E8F0" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#1E40AF"
                      strokeWidth={3}
                      fill="url(#enrollmentsGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm rounded-[2rem]">
            <CardContent className="p-6">
              <h3 className="text-xl font-extrabold text-slate-900 mb-1">
                متوسط تقدم الطلاب
              </h3>

              <p className="text-sm text-slate-500 mb-5">
                متوسط التقدم في جميع التسجيلات.
              </p>

              <div className="h-72 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    innerRadius="72%"
                    outerRadius="100%"
                    data={[
                      {
                        name: "متوسط التقدم",
                        value: averageProgress,
                        fill: palette[0].text,
                      },
                    ]}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <RadialBar dataKey="value" cornerRadius={20} />
                  </RadialBarChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-5xl font-extrabold text-blue-700">
                    {averageProgress}%
                  </div>
                  <div className="text-sm text-slate-500 mt-2">متوسط عام</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-0 shadow-sm rounded-[2rem]">
            <CardContent className="p-6">
              <h3 className="text-xl font-extrabold text-slate-900 mb-1">
                حالة التسجيلات
              </h3>

              <p className="text-sm text-slate-500 mb-5">
                توزيع الطلاب بين البرامج النشطة والمكتملة والمتوقفة.
              </p>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={enrollmentStatusData}>
                    <CartesianGrid stroke="#E2E8F0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                      {enrollmentStatusData.map((_, index) => (
                        <Cell key={index} fill={palette[index].text} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm rounded-[2rem]">
            <CardContent className="p-6">
              <h3 className="text-xl font-extrabold text-slate-900 mb-1">
                توزيع نسب التقدم
              </h3>

              <p className="text-sm text-slate-500 mb-5">
                عدد التسجيلات داخل كل مستوى من مستويات الإنجاز.
              </p>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={progressBuckets}>
                    <CartesianGrid stroke="#E2E8F0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                      {progressBuckets.map((_, index) => (
                        <Cell
                          key={index}
                          fill={palette[index % palette.length].text}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm rounded-[2rem]">
            <CardContent className="p-6">
              <h3 className="text-xl font-extrabold text-slate-900 mb-1">
                أعلى الطلاب تقدمًا
              </h3>

              <p className="text-sm text-slate-500 mb-5">
                أكثر الطلاب تقدمًا في البرامج المسجلة.
              </p>

              {topStudentsByProgress.length > 0 ? (
                <div className="space-y-4">
                  {topStudentsByProgress.map((student, index) => (
                    <div
                      key={`${student.name}-${index}`}
                      className="rounded-3xl border p-4"
                      style={{
                        backgroundColor: palette[index % palette.length].bg,
                        borderColor: palette[index % palette.length].border,
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-bold text-slate-900">
                            {student.name}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {student.course || "برنامج غير محدد"}
                          </div>
                        </div>

                        <Badge className="bg-white text-slate-700 rounded-full">
                          {student.progress}%
                        </Badge>
                      </div>

                      <div className="w-full h-2 rounded-full bg-white/70 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${student.progress}%`,
                            backgroundColor:
                              palette[index % palette.length].text,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl bg-slate-50 p-10 text-center text-slate-400">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  لا توجد بيانات تقدم كافية بعد
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm rounded-[2rem]">
            <CardContent className="p-6">
              <h3 className="text-xl font-extrabold text-slate-900 mb-1">
                آخر التسجيلات
              </h3>

              <p className="text-sm text-slate-500 mb-5">
                أحدث التحاقات الطلاب بالبرامج.
              </p>

              {recentEnrollmentRows.length > 0 ? (
                <div className="space-y-3">
                  {recentEnrollmentRows.map((row, index) => (
                    <div
                      key={`${row.student}-${row.course}-${index}`}
                      className="rounded-3xl border border-slate-100 bg-slate-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-bold text-slate-900">
                            {row.student}
                          </div>
                          <div className="text-sm text-slate-500 mt-1">
                            {row.course || "برنامج غير محدد"}
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            تاريخ التسجيل: {row.date}
                          </div>
                        </div>

                        <Badge className="rounded-full bg-white text-slate-700">
                          {toArabicStatus(row.status)}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3 mt-4">
                        <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-blue-700"
                            style={{ width: `${row.progress}%` }}
                          />
                        </div>
                        <div className="text-sm font-bold text-blue-700">
                          {row.progress}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl bg-slate-50 p-10 text-center text-slate-400">
                  لا توجد تسجيلات حديثة
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}