import { Link } from "react-router";
import { motion } from "framer-motion";
import { trpc } from "@/providers/trpc";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  CheckCircle,
  Clock,
  Trophy,
  ArrowLeft,
  Loader2,
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
} from "recharts";

const palette = [
  { bg: "#E5F0FF", border: "#B3D4FF", text: "#1E40AF" },
  { bg: "#FFE5EC", border: "#FFADC2", text: "#BE185D" },
  { bg: "#EAF7EE", border: "#B3E5C1", text: "#166534" },
  { bg: "#FFF4E5", border: "#FFD6B3", text: "#C2410C" },
  { bg: "#F3E8FF", border: "#D8B4FE", text: "#7C3AED" },
  { bg: "#E6FFFA", border: "#99F6E4", text: "#0F766E" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: any;
  color: (typeof palette)[number];
}) {
  return (
    <motion.div variants={fadeUp}>
      <Card
        className="rounded-3xl shadow-sm border transition hover:-translate-y-1 hover:shadow-md"
        style={{
          backgroundColor: color.bg,
          borderColor: color.border,
        }}
      >
        <CardContent className="p-5">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4"
            style={{
              backgroundColor: "white",
              color: color.text,
            }}
          >
            <Icon className="h-5 w-5" />
          </div>

          <div className="text-3xl font-extrabold" style={{ color: color.text }}>
            {value}
          </div>

          <div className="text-sm mt-1" style={{ color: color.text }}>
            {title}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function StudentDashboard() {
  const { data: courses, isLoading } = trpc.course.myCourses.useQuery();

  const enrolledCourses = courses ?? [];

  const totalCourses = enrolledCourses.length;

  const averageProgress =
    totalCourses > 0
      ? Math.round(
          enrolledCourses.reduce((sum, c) => sum + Number(c.progress || 0), 0) /
            totalCourses,
        )
      : 0;

  const completedCourses = enrolledCourses.filter(
    (c) => Number(c.progress || 0) >= 100,
  ).length;

  const activeCourses = enrolledCourses.filter(
    (c) => Number(c.progress || 0) < 100,
  ).length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <motion.div
        initial="hidden"
        animate="show"
        transition={{ staggerChildren: 0.08 }}
        className="pt-24 pb-10"
      >
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            variants={fadeUp}
            className="rounded-[2rem] border shadow-sm p-8 mb-8 relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, #E5F0FF 0%, #F3E8FF 55%, #FFE5EC 100%)",
              borderColor: "#D8B4FE",
            }}
          >
            <div className="absolute -top-16 -left-16 w-52 h-52 bg-white/40 rounded-full blur-2xl" />
            <div className="absolute -bottom-20 -right-12 w-64 h-64 bg-white/40 rounded-full blur-2xl" />

            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/70 border border-white px-3 py-1 rounded-full text-sm text-blue-700 mb-4">
                  <GraduationCap className="h-4 w-4" />
                  مساحة تعلمك الخاصة
                </div>

                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
                  لوحة الطالب
                </h1>

                <p className="text-slate-600 mt-3 max-w-xl">
                  تابع برامجك وتقدمك وشهاداتك بطريقة هادئة ومنظمة.
                </p>
              </div>

              <div className="bg-white/70 backdrop-blur rounded-3xl p-5 min-w-[220px] border border-white">
                <div className="text-sm text-slate-500 mb-2">التقدم العام</div>
                <div className="text-4xl font-extrabold text-blue-700 mb-3">
                  {averageProgress}%
                </div>
                <Progress value={averageProgress} />
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
            <StatCard
              title="برامجي"
              value={totalCourses}
              icon={BookOpen}
              color={palette[0]}
            />
            <StatCard
              title="برامج مكتملة"
              value={completedCourses}
              icon={CheckCircle}
              color={palette[1]}
            />
            <StatCard
              title="قيد الدراسة"
              value={activeCourses}
              icon={Clock}
              color={palette[2]}
            />
            <StatCard
              title="متوسط التقدم"
              value={`${averageProgress}%`}
              icon={Trophy}
              color={palette[3]}
            />
          </div>

<motion.div variants={fadeUp} className="mb-8">
  <Card className="border-0 shadow-sm rounded-[2rem] overflow-hidden">
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            خريطة التقدم
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            تقدمك في البرامج المسجل بها.
          </p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={enrolledCourses.map((course, index) => ({
              name:
                course.title.length > 12
                  ? course.title.slice(0, 12) + "..."
                  : course.title,
              progress: Number(course.progress || 0),
              fill: palette[index % palette.length].text,
            }))}
            margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="studentProgress" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#B3D4FF" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#E5F0FF" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#E2E8F0" vertical={false} />

            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "#64748B" }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12, fill: "#64748B" }}
              axisLine={false}
              tickLine={false}
              width={35}
            />

            <Tooltip
              formatter={(value) => [`${value}%`, "التقدم"]}
              contentStyle={{
                borderRadius: "14px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 10px 25px rgba(15, 23, 42, 0.08)",
              }}
            />

            <Area
              type="monotone"
              dataKey="progress"
              stroke="#FFADC2"
              strokeWidth={3}
              fill="url(#studentProgress)"
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
</motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div variants={fadeUp} className="lg:col-span-2">
              <Card className="border-0 shadow-sm rounded-[2rem]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        برامجي الحالية
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">
                        أكمل رحلتك من حيث توقفت.
                      </p>
                    </div>

                    <Link to="/courses">
                      <Button variant="outline">
                        تصفح البرامج
                      </Button>
                    </Link>
                  </div>

                  {enrolledCourses.length === 0 ? (
                    <div className="text-center py-14">
                      <BookOpen className="h-14 w-14 mx-auto mb-3 text-slate-300" />
                      <p className="text-slate-500">لم تسجل في أي برنامج بعد</p>
                      <Link to="/courses">
                        <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                          ابدأ الآن
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {enrolledCourses.map((course, index) => {
                        const color = palette[index % palette.length];
                        const progress = Number(course.progress || 0);

                        return (
                          <motion.div
                            key={course.id}
                            variants={fadeUp}
                            className="rounded-3xl border p-4 transition hover:-translate-y-1 hover:shadow-md"
                            style={{
                              backgroundColor: color.bg,
                              borderColor: color.border,
                            }}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <h3
                                  className="font-bold"
                                  style={{ color: color.text }}
                                >
                                  {course.title}
                                </h3>
                                <p className="text-sm text-slate-600 line-clamp-1 mt-1">
                                  {course.description || "لا يوجد وصف"}
                                </p>
                              </div>

                              <Link to={`/courses/${course.id}`}>
                                <Button
                                  variant="outline"
                                  className="bg-white/70"
                                  size="sm"
                                >
                                  متابعة
                                  <ArrowLeft className="h-4 w-4 mr-1" />
                                </Button>
                              </Link>
                            </div>

                            <div className="mt-4">
                              <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-600">التقدم</span>
                                <span
                                  className="font-bold"
                                  style={{ color: color.text }}
                                >
                                  {progress}%
                                </span>
                              </div>
                              <Progress value={progress} />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeUp} className="space-y-6">
              <Card
                className="rounded-[2rem] shadow-sm border"
                style={{
                  backgroundColor: palette[5].bg,
                  borderColor: palette[5].border,
                }}
              >
                <CardContent className="p-6">
                  <div
                    className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-4"
                    style={{ color: palette[5].text }}
                  >
                    <GraduationCap className="h-6 w-6" />
                  </div>

                  <h3
                    className="font-bold mb-2"
                    style={{ color: palette[5].text }}
                  >
                    شهاداتي
                  </h3>

                  <p className="text-sm text-slate-600 mb-4">
                     الشهادات التي حصلت عليها من البرامج.
                  </p>

                  <Link to="/certificates">
                    <Button className="w-full bg-white text-slate-800 hover:bg-slate-50">
                      عرض الشهادات
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm rounded-[2rem]">
                <CardContent className="p-6">
                  <h3 className="font-bold text-slate-900 mb-4">
                    ملخص
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-500">إنجازك العام</span>
                        <span className="font-bold text-blue-700">
                          {averageProgress}%
                        </span>
                      </div>
                      <Progress value={averageProgress} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div
                        className="rounded-2xl p-4 text-center border"
                        style={{
                          backgroundColor: palette[0].bg,
                          borderColor: palette[0].border,
                        }}
                      >
                        <div
                          className="font-extrabold text-xl"
                          style={{ color: palette[0].text }}
                        >
                          {totalCourses}
                        </div>
                        <div className="text-xs text-slate-500">برامج</div>
                      </div>

                      <div
                        className="rounded-2xl p-4 text-center border"
                        style={{
                          backgroundColor: palette[1].bg,
                          borderColor: palette[1].border,
                        }}
                      >
                        <div
                          className="font-extrabold text-xl"
                          style={{ color: palette[1].text }}
                        >
                          {completedCourses}
                        </div>
                        <div className="text-xs text-slate-500">مكتملة</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}