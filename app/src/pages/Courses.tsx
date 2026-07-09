import { useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  BookOpen,
  Clock,
  Star,
  Search,
  ChevronLeft,
  Layers,
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

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function Courses() {
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState<string>("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = trpc.course.list.useQuery({
    search: search || undefined,
    level: (level as "beginner" | "intermediate" | "advanced") || undefined,
    page,
    limit: 9,
  });

  const courses = data?.items ?? [];
  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  const filters = [
    { label: "الكل", value: "", color: "bg-blue-700 hover:bg-blue-800" },
    { label: "مبتدئ", value: "beginner", color: "bg-green-600 hover:bg-green-700" },
    { label: "متوسط", value: "intermediate", color: "bg-orange-500 hover:bg-orange-600" },
    { label: "متقدم", value: "advanced", color: "bg-purple-600 hover:bg-purple-700" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <motion.main
        initial="hidden"
        animate="show"
        transition={{ staggerChildren: 0.08 }}
        className="pt-24"
      >
        <section className="pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={fadeUp}
              className="relative overflow-hidden rounded-[2rem] border shadow-sm p-7 md:p-10"
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
                    <Sparkles className="h-4 w-4" />
                    مسارات تربوية لبناء الجيل الصاعد
                  </div>

                  <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
                    برامج مخيم الرواد
                  </h1>

                  <p className="text-slate-600 mt-3 max-w-xl leading-7">
                    برامج متدرجة تعين الطالب على معرفة ربه، وتعظيم وحيه،
                    وفهم طريق العبودية والإصلاح، من خلال العلم والعمل
                    والمتابعة.
                  </p>
                </div>

                <div className="bg-white/75 backdrop-blur rounded-3xl border border-white p-5 min-w-[210px]">
                  <div className="text-sm text-slate-500 mb-1">
                    البرامج المتاحة
                  </div>
                  <div className="text-4xl font-extrabold text-blue-700">
                    {data?.total ?? courses.length}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={fadeUp}
              className="bg-white rounded-[2rem] border shadow-sm p-4 md:p-5"
            >
              <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                <div className="relative flex-1">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />

                  <Input
                    placeholder="ابحث عن برنامج تربوي..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="h-12 rounded-2xl pr-12 border-slate-200"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {filters.map((item) => {
                    const active = level === item.value;

                    return (
                      <Button
                        key={item.value}
                        variant={active ? "default" : "outline"}
                        onClick={() => {
                          setLevel(item.value);
                          setPage(1);
                        }}
                        className={
                          active
                            ? `${item.color} rounded-2xl px-5`
                            : "rounded-2xl px-5 bg-white"
                        }
                      >
                        {item.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="pb-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card
                    key={i}
                    className="overflow-hidden border-0 shadow-md rounded-3xl animate-pulse"
                  >
                    <div className="h-48 bg-slate-200" />
                    <CardContent className="p-5 space-y-4">
                      <div className="h-5 bg-slate-200 rounded w-3/4" />
                      <div className="h-4 bg-slate-200 rounded w-full" />
                      <div className="h-4 bg-slate-200 rounded w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : courses.length === 0 ? (
              <motion.div
                variants={fadeUp}
                className="bg-white rounded-[2rem] border shadow-sm text-center py-16 px-4"
              >
                <BookOpen className="h-16 w-16 text-slate-300 mx-auto mb-4" />

                <h3 className="text-2xl font-bold text-slate-700 mb-2">
                  لا توجد برامج متاحة
                </h3>

                <p className="text-slate-400">
                  جرّب تغيير كلمة البحث أو اختيار مستوى آخر.
                </p>
              </motion.div>
            ) : (
              <>
                <motion.div
                  variants={fadeUp}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {courses.map((course, index) => (
                    <motion.div
                      key={course.id}
                      variants={fadeUp}
                      transition={{ delay: index * 0.035 }}
                    >
                      <Link to={`/courses/${course.id}`}>
                        <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-3xl h-full bg-white group">
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
                                  {course.categoryName || "مسار تربوي"}
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
                                "برنامج تربوي يعين الطالب على بناء إيمانه، وضبط موازينه، وربط العلم بالعمل."}
                            </p>

                            <div className="flex items-center justify-between mt-5 text-sm text-slate-500">
                              <div className="flex items-center gap-1">
                                <Layers className="h-4 w-4" />
                                <span>{course.categoryName || "مسار تربوي"}</span>
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
                                عرض البرنامج
                                <ChevronLeft className="h-4 w-4" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>

                {totalPages > 1 && (
                  <div className="flex justify-center items-center mt-10 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="rounded-2xl bg-white"
                    >
                      السابق
                    </Button>

                    <span className="px-5 py-2 rounded-2xl bg-white border text-sm text-slate-600">
                      صفحة {page} من {totalPages}
                    </span>

                    <Button
                      variant="outline"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                      className="rounded-2xl bg-white"
                    >
                      التالي
                      <ChevronLeft className="mr-1 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </motion.main>

      <Footer />
    </div>
  );
}