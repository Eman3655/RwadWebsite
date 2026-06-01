import { useState } from "react";
import { Link } from "react-router";
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
  Users,
  Star,
  Search,
  ChevronLeft,
} from "lucide-react";

const levelLabels: Record<string, string> = {
  beginner: "مبتدئ",
  intermediate: "متوسط",
  advanced: "متقدم",
};

const levelColors: Record<string, string> = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-yellow-100 text-yellow-700",
  advanced: "bg-red-100 text-red-700",
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

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Header */}
      <section className="pt-24 pb-8 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white mb-2">الكورسات التعليمية</h1>
          <p className="text-blue-100">
            اكتشف مجموعة واسعة من الكورسات في مختلف المجالات
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="ابحث عن كورس..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pr-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={level === "" ? "default" : "outline"}
                size="sm"
                onClick={() => { setLevel(""); setPage(1); }}
                className={level === "" ? "bg-blue-600" : ""}
              >
                الكل
              </Button>
              <Button
                variant={level === "beginner" ? "default" : "outline"}
                size="sm"
                onClick={() => { setLevel("beginner"); setPage(1); }}
                className={level === "beginner" ? "bg-green-600" : ""}
              >
                مبتدئ
              </Button>
              <Button
                variant={level === "intermediate" ? "default" : "outline"}
                size="sm"
                onClick={() => { setLevel("intermediate"); setPage(1); }}
                className={level === "intermediate" ? "bg-yellow-600" : ""}
              >
                متوسط
              </Button>
              <Button
                variant={level === "advanced" ? "default" : "outline"}
                size="sm"
                onClick={() => { setLevel("advanced"); setPage(1); }}
                className={level === "advanced" ? "bg-red-600" : ""}
              >
                متقدم
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="border-0 shadow-md animate-pulse">
                  <div className="h-48 bg-slate-200 rounded-t-lg" />
                  <CardContent className="p-5 space-y-3">
                    <div className="h-5 bg-slate-200 rounded w-3/4" />
                    <div className="h-4 bg-slate-200 rounded w-full" />
                    <div className="h-4 bg-slate-200 rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">
                لا توجد كورسات
              </h3>
              <p className="text-slate-400">
                جرب تغيير معايير البحث أو الفلترة
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <Link key={course.id} to={`/courses/${course.id}`}>
                    <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full group">
                      <div className="relative h-48 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden">
                        {course.image ? (
                          <img
                            src={course.image}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="flex flex-col items-center text-white">
                            <BookOpen className="h-16 w-16 mb-2 opacity-80" />
                            <span className="text-lg font-semibold opacity-90">
                              {course.categoryName || "عام"}
                            </span>
                          </div>
                        )}
                        <Badge
                          className={`absolute top-3 right-3 ${levelColors[course.level]}`}
                        >
                          {levelLabels[course.level]}
                        </Badge>
                      </div>
                      <CardContent className="p-5">
                        <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">
                          {course.title}
                        </h3>
                        <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                          {course.description || "لا يوجد وصف"}
                        </p>
                        <div className="flex items-center justify-between text-sm text-slate-400">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{course.instructorName || "غير معروف"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{course.duration} ساعة</span>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t flex items-center justify-between">
                          <div className="flex items-center gap-1 text-amber-500">
                            <Star className="h-4 w-4 fill-amber-500" />
                            <span className="text-sm font-medium">
                              {course.totalLessons} درس
                            </span>
                          </div>
                          <span className="text-lg font-bold text-blue-600">
                            {Number(course.price) === 0
                              ? "مجاني"
                              : `${course.price} $`}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-10 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    السابق
                  </Button>
                  <span className="px-4 py-2 text-sm text-slate-600">
                    صفحة {page} من {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
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

      <Footer />
    </div>
  );
}
