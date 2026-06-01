import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  BookOpen,
  Users,
  GraduationCap,
  Award,
  Video,
  FileText,
  Clock,
  TrendingUp,
  Play,
  Star,
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

export default function Home() {
  const { data: stats } = trpc.course.stats.useQuery();
  const { data: coursesData } = trpc.course.list.useQuery({ limit: 6 });
  const courses = coursesData?.items ?? [];

  const features = [
    {
      icon: Video,
      title: "دروس فيديو تفاعلية",
      description: "شاهد دروس عالية الجودة مع إمكانية التحكم في السرعة والترجمة",
    },
    {
      icon: FileText,
      title: "محتوى تعليمي غني",
      description: "ملفات PDF ومصادر تعليمية مصاحبة لكل درس",
    },
    {
      icon: Clock,
      title: "تعلم في وقتك",
      description: "وصول 24/7 لجميع المواد التعليمية بدون قيود زمنية",
    },
    {
      icon: TrendingUp,
      title: "تتبع تقدمك",
      description: "لوحة تحكم شخصية لمتابعة تقدمك الدراسي وإنجازاتك",
    },
    {
      icon: Award,
      title: "شهادات معتمدة",
      description: "احصل على شهادات إلكترونية معتمدة عند إكمال الكورسات",
    },
    {
      icon: Users,
      title: "مدربون محترفون",
      description: "تعلم من نخبة المدربين والخبراء في مختلف المجالات",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 opacity-[0.97]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20 pb-16">
          <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30 text-sm px-4 py-1.5">
            منصة التعلم الإلكتروني الرائدة
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            تعلم بلا حدود مع{" "}
            <span className="text-amber-300">منصة عِلم</span>
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto mb-10 leading-relaxed">
            منصة تعليمية متكاملة توفر لك تجربة تعلم فريدة مع أفضل المدربين،
            محتوى تعليمي غني، وشهادات معتمدة في مختلف المجالات
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/courses">
              <Button
                size="lg"
                className="bg-white text-blue-700 hover:bg-blue-50 font-semibold text-lg px-8 py-6 shadow-xl"
              >
                استكشف الكورسات
                <ChevronLeft className="mr-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/register">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/20 font-semibold text-lg px-8 py-6"
              >
                <Play className="mr-2 h-5 w-5" />
                ابدأ رحلتك التعليمية
              </Button>
            </Link>
          </div>
        </div>
        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="#F8FAFC"
            />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 -mt-2 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[
              { icon: BookOpen, label: "كورس تعليمي", value: stats?.courses ?? 0, color: "text-blue-600", bg: "bg-blue-50" },
              { icon: Users, label: "طالب مسجل", value: stats?.students ?? 0, color: "text-emerald-600", bg: "bg-emerald-50" },
              { icon: GraduationCap, label: "مدرب محترف", value: stats?.teachers ?? 0, color: "text-purple-600", bg: "bg-purple-50" },
              { icon: Award, label: "شهادة معتمدة", value: stats?.enrollments ?? 0, color: "text-amber-600", bg: "bg-amber-50" },
            ].map((stat, i) => (
              <Card key={i} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <div className={`${stat.bg} w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <stat.icon className={`h-7 w-7 ${stat.color}`} />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-500">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              الكورسات التعليمية
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              اختر من مجموعة واسعة من الكورسات في مختلف المجالات وابدأ رحلتك التعليمية اليوم
            </p>
          </div>

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

          <div className="text-center mt-10">
            <Link to="/courses">
              <Button
                size="lg"
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                عرض جميع الكورسات
                <ChevronLeft className="mr-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              لماذا تختار منصة عِلم؟
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              نقدم لك تجربة تعليمية متكاملة مع أفضل المميزات والخدمات
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-slate-50 hover:bg-blue-50 transition-colors duration-300 group"
              >
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-5 group-hover:bg-blue-200 transition-colors">
                  <feature.icon className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-10 lg:p-16 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
            <div className="relative">
              <h2 className="text-3xl font-bold mb-4">
                ابدأ رحلتك التعليمية اليوم
              </h2>
              <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
                انضم لآلاف المتعلمين واكتسب مهارات جديدة مع أفضل الكورسات والمدربين
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button
                    size="lg"
                    className="bg-white text-blue-700 hover:bg-blue-50 font-semibold text-lg px-8"
                  >
                    سجل حساب جديد
                    <ChevronLeft className="mr-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/courses">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white/20 font-semibold text-lg px-8"
                  >
                    تصفح الكورسات
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
