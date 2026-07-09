import { Link } from "react-router";
import { motion, type Variants } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  BookOpen,
  Users,
  Award,
  FileText,
  Clock,
  TrendingUp,
  CheckCircle,
  ChevronLeft,
  Star,
  PlayCircle,
  Layers,
  ShieldCheck,
  Heart,
  Compass,
  Sparkles,
} from "lucide-react";

const levelLabels: Record<string, string> = {
  beginner: "مبتدئ",
  intermediate: "متوسط",
  advanced: "متقدم",
};

const levelColors: Record<string, string> = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-orange-100 text-orange-700",
  advanced: "bg-purple-100 text-purple-700",
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

const revealSection: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardSoftReveal: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

export default function Home() {
  const { data: stats } = trpc.course.stats.useQuery();
  const { data: coursesData } = trpc.course.list.useQuery({ limit: 3 });
  const courses = coursesData?.items ?? [];

  const statsCards = [
    {
      icon: BookOpen,
      label: "برامج تربوية",
      value: stats?.courses ?? 0,
      bg: "#E5F0FF",
      text: "#1E40AF",
    },
    {
      icon: Users,
      label: "طالب مشارك",
      value: stats?.students ?? 0,
      bg: "#EAF7EE",
      text: "#166534",
    },
    {
      icon: FileText,
      label: "تسجيل في البرامج",
      value: stats?.enrollments ?? 0,
      bg: "#FFF4E5",
      text: "#C2410C",
    },
    {
      icon: Award,
      label: "رحلة تعليمية",
      value: stats?.enrollments ?? 0,
      bg: "#F3E8FF",
      text: "#7C3AED",
    },
  ];

  const features = [
    {
      icon: Heart,
      title: "معرفة الله",
      description:
        "برامج تعين الطالب على معرفة ربه، وفهم آثار الإيمان بأسمائه الحسنى في حياته.",
    },
    {
      icon: Compass,
      title: "مركزيات الوحي",
      description:
        "بناء التصورات والموازين على هدي القرآن الكريم والسنة النبوية.",
    },
    {
      icon: CheckCircle,
      title: "العلم والعمل",
      description:
        "ربط الدروس بتطبيقات عملية؛ ليصبح العلم سلوكًا يوميًا لا معلومة مجردة.",
    },
    {
      icon: TrendingUp,
      title: "متابعة تربوية",
      description:
        "صفحات خاصة لمتابعة التقدم، والأوراد، والعادات، والإنجاز في البرامج.",
    },
    {
      icon: PlayCircle,
      title: "تعلم تفاعلي",
      description:
        "استخدام التقنية والاختبارات والرحلات التعليمية لترسيخ المعاني بطريقة جاذبة.",
    },
    {
      icon: ShieldCheck,
      title: "بيئة آمنة وهادفة",
      description:
        "منصة منظمة تساعد الطالب على التعلم، والمتابعة، وبناء عاداته في مكان واحد.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <section className="relative overflow-hidden pt-28 pb-20">
        <div className="absolute inset-0 bg-gradient-to-br from-[#E5F0FF] via-white to-[#F3E8FF]" />
        <div className="absolute -top-32 -left-24 h-80 w-80 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute top-40 -right-24 h-96 w-96 rounded-full bg-purple-200/40 blur-3xl" />

        <motion.div
          initial="hidden"
          animate="show"
          variants={staggerContainer}
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.h1
                variants={fadeUp}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight"
              >
                نبني جيلاً يعرف ربَّه
                <span className="block text-blue-700 mt-2">
                  ويعظم وحيه
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mt-6 text-lg text-slate-600 leading-8 max-w-xl"
              >
                مخيم الرواد منظومة تربوية تهدف إلى بناء الجيل الصاعد على
                مركزيات الوحي، من خلال برامج علمية متدرجة، وتطبيقات عملية،
                ومتابعة مستمرة، ووسائل تفاعلية تربط العلم بالعمل.
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="mt-8 flex flex-col sm:flex-row gap-4"
              >
                <Link to="/courses">
                  <Button
                    size="lg"
                    className="bg-blue-700 hover:bg-blue-800 rounded-2xl px-8 h-14 text-base shadow-lg"
                  >
                    استكشف البرامج
                    <ChevronLeft className="h-5 w-5 mr-2" />
                  </Button>
                </Link>

                <Link to="/register">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-2xl px-8 h-14 text-base bg-white/80"
                  >
                    ابدأ رحلتك
                  </Button>
                </Link>
              </motion.div>
            </div>

            <motion.div variants={fadeUp} className="relative hidden lg:block">
              <div className="relative bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden">
                <div className="h-14 bg-slate-50 border-b flex items-center px-5 gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>

                <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50">
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div className="bg-white rounded-2xl p-5 shadow-sm border">
                      <div className="text-slate-400 text-sm">البرامج</div>
                      <div className="text-3xl font-extrabold mt-2 text-slate-900">
                        {stats?.courses ?? 0}
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 shadow-sm border">
                      <div className="text-slate-400 text-sm">الطلاب</div>
                      <div className="text-3xl font-extrabold mt-2 text-slate-900">
                        {stats?.students ?? 0}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl border shadow-sm p-5">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <div className="font-bold text-slate-900">
                          رحلة الطالب
                        </div>
                        <div className="text-sm text-slate-400 mt-1">
                          متابعة التقدم العلمي والتربوي
                        </div>
                      </div>

                      <div className="text-blue-700 font-bold">78%</div>
                    </div>

                    <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full w-[78%] bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <motion.section
        variants={revealSection}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        className="-mt-8 relative z-10 pb-14"
      >
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {statsCards.map((stat) => {
              const Icon = stat.icon;

              return (
                <motion.div key={stat.label} variants={cardSoftReveal}>
                  <Card className="border-0 shadow-md rounded-3xl">
                    <CardContent className="p-5 text-center">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                        style={{
                          backgroundColor: stat.bg,
                          color: stat.text,
                        }}
                      >
                        <Icon className="h-7 w-7" />
                      </div>

                      <div className="text-3xl font-extrabold text-slate-900">
                        {stat.value}
                      </div>

                      <div className="text-sm text-slate-500 mt-1">
                        {stat.label}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        variants={revealSection}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.12 }}
        className="py-14"
      >
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            variants={cardSoftReveal}
            className="flex items-end justify-between gap-4 mb-8"
          >
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900">
                البرامج التربوية
              </h2>
              <p className="text-slate-500 mt-2">
                اختر برنامجك، وابدأ رحلة تربوية تبني إيمانك، وتضبط موازينك،
                وتعينك على السير إلى الله.
              </p>
            </div>

            <Link to="/courses" className="hidden sm:block">
              <Button variant="outline" className="rounded-2xl bg-white">
                عرض الكل
                <ChevronLeft className="h-4 w-4 mr-2" />
              </Button>
            </Link>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.12 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {courses.map((course) => (
              <motion.div key={course.id} variants={cardSoftReveal}>
                <Link to={`/courses/${course.id}`}>
                  <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-3xl h-full bg-white">
                    <div className="relative h-48 bg-gradient-to-br from-blue-500 to-indigo-600">
                      {course.image ? (
                        <img
                          src={course.image}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-white">
                          <BookOpen className="h-14 w-14 mb-2 opacity-90" />
                          <span className="font-semibold">
                            {course.categoryName || "قسم عام"}
                          </span>
                        </div>
                      )}

                      <Badge
                        className={`absolute top-4 right-4 rounded-full ${
                          levelColors[course.level] ?? levelColors.beginner
                        }`}
                      >
                        {levelLabels[course.level] ?? "مبتدئ"}
                      </Badge>
                    </div>

                    <CardContent className="p-5">
                      <h3 className="text-lg font-bold text-slate-900 line-clamp-1">
                        {course.title}
                      </h3>

                      <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-6">
                        {course.description ||
                          "برنامج تربوي يعين الطالب على بناء إيمانه ومعرفة طريقه إلى الله."}
                      </p>

                      <div className="flex items-center justify-between mt-5 text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                          <Layers className="h-4 w-4" />
                          <span>{course.categoryName || "قسم عام"}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{course.duration} ساعة</span>
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t flex items-center justify-between">
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="h-4 w-4 fill-amber-500" />
                          <span className="text-sm font-medium">
                            {course.totalLessons} درس
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-blue-700 font-bold text-sm">
                          عرض التفاصيل
                          <ChevronLeft className="h-4 w-4" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <div className="flex justify-center mt-8">
            <Link to="/courses">
              <Button variant="outline" className="rounded-2xl px-8">
                عرض جميع البرامج
                <ChevronLeft className="h-4 w-4 mr-2" />
              </Button>
            </Link>
          </div>

          {courses.length === 0 && (
            <Card className="border-0 shadow-sm rounded-3xl">
              <CardContent className="p-12 text-center text-slate-400">
                لا توجد برامج متاحة حاليًا
              </CardContent>
            </Card>
          )}
        </div>
      </motion.section>

      <motion.section
        variants={revealSection}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.12 }}
        className="py-16 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4">
          <motion.div variants={cardSoftReveal} className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900">
              لماذا مخيم الرواد؟
            </h2>
            <p className="text-slate-500 mt-3 max-w-2xl mx-auto leading-7">
              لأن التربية لا تكتمل بالمعلومة وحدها؛ بل تحتاج إلى بناء إيماني،
              وتطبيق عملي، ومتابعة مستمرة، وبيئة تعين الطالب على الثبات والنمو.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.12 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.title}
                  variants={cardSoftReveal}
                  className="rounded-3xl bg-slate-50 border border-slate-100 p-6 hover:bg-blue-50 transition"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 text-blue-700">
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="font-bold text-slate-900 text-lg">
                    {feature.title}
                  </h3>

                  <p className="text-sm text-slate-500 mt-2 leading-7">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        variants={revealSection}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.12 }}
        className="py-16 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4">
          <motion.div variants={cardSoftReveal} className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900">
              رحلتك في مخيم الرواد
            </h2>
            <p className="text-slate-500 mt-3 max-w-2xl mx-auto leading-7">
              رحلة تبدأ بالمعرفة، وتمتد إلى العمل، ثم المتابعة، حتى يصبح ما
              تتعلمه زادًا لقلبك وسلوكك ورسالتك.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.12 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
          >
            {[
              {
                step: "01",
                title: "اعرف ربك",
                description:
                  "ابدأ من الأصول الكبرى: معرفة الله، وتعظيم وحيه، وفهم الغاية من الحياة.",
                icon: Sparkles,
                bg: "#E5F0FF",
                text: "#1E40AF",
              },
              {
                step: "02",
                title: "تدرج في البناء",
                description:
                  "انتقل بين برامج تربوية مترابطة تبني التصور، وتصحح الموازين، وتربطك بالوحي.",
                icon: BookOpen,
                bg: "#F3E8FF",
                text: "#7C3AED",
              },
              {
                step: "03",
                title: "حوّل العلم إلى عمل",
                description:
                  "تابع تقدمك، وأورادك، واختباراتك، واجعل ما تتعلمه أثرًا ظاهرًا في يومك.",
                icon: Award,
                bg: "#EAF7EE",
                text: "#166534",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.step}
                  variants={cardSoftReveal}
                  className="rounded-[2rem] border border-slate-100 bg-slate-50 p-6 hover:bg-white hover:shadow-lg transition"
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                    style={{ backgroundColor: item.bg, color: item.text }}
                  >
                    <Icon className="h-7 w-7" />
                  </div>

                  <div
                    className="text-sm font-bold mb-3"
                    style={{ color: item.text }}
                  >
                    الخطوة {item.step}
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {item.title}
                  </h3>

                  <p className="text-sm text-slate-500 leading-7">
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div
            variants={cardSoftReveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="flex justify-center gap-3 mt-10"
          >
            <Link to="/register">
              <Button className="bg-blue-700 hover:bg-blue-800 rounded-2xl px-8">
                إنشاء حساب
              </Button>
            </Link>

            <Link to="/courses">
              <Button variant="outline" className="rounded-2xl px-8 bg-white">
                تصفح البرامج
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
}