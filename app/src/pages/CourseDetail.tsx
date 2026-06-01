import { useParams, Link, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  BookOpen,
  Clock,
  Play,
  FileText,
  HelpCircle,
  ChevronLeft,
  GraduationCap,
  CheckCircle,
  Lock,
  Loader2,
} from "lucide-react";
import { useState } from "react";

const levelLabels: Record<string, string> = {
  beginner: "مبتدئ",
  intermediate: "متوسط",
  advanced: "متقدم",
};

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const courseId = Number(id);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const [enrolling, setEnrolling] = useState(false);

  const { data: course, isLoading } = trpc.course.getById.useQuery({
    id: courseId,
  });

  const { data: myCourses } = trpc.course.myCourses.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const isEnrolled = myCourses?.some((c) => c.id === courseId);

  const { data: lessonProgressData } = trpc.lesson.getProgress.useQuery(
    { courseId },
    { enabled: isAuthenticated && isEnrolled },
  );

  const enrollMutation = trpc.course.enroll.useMutation({
    onSuccess: () => {
      utils.course.myCourses.invalidate();
      utils.lesson.getProgress.invalidate();
      setEnrolling(false);
    },
    onError: () => setEnrolling(false),
  });

  const handleEnroll = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setEnrolling(true);
    enrollMutation.mutate({ courseId });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 text-center">
          <h2 className="text-2xl font-bold text-slate-900">الكورس غير موجود</h2>
          <Link to="/courses">
            <Button className="mt-4">العودة للكورسات</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <section className="pt-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-2 text-blue-200 text-sm mb-4">
            <Link to="/courses" className="hover:text-white transition-colors">
              الكورسات
            </Link>
            <ChevronLeft className="h-4 w-4" />
            <span>{course.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Badge className="bg-white/20 text-white border-white/30 mb-4">
                {course.categoryName || "عام"}
              </Badge>
              <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
              <p className="text-blue-100 text-lg mb-6 leading-relaxed">
                {course.description || "لا يوجد وصف"}
              </p>
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-amber-300" />
                  <span>{course.instructorName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-300" />
                  <span>{course.duration} ساعة</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-amber-300" />
                  <span>{course.totalLessons} درس</span>
                </div>
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-amber-300" />
                  <span>{course.totalQuizzes} اختبار</span>
                </div>
              </div>
            </div>

            <div>
              <Card className="border-0 shadow-xl">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {Number(course.price) === 0 ? "مجاني" : `${course.price} ريال`}
                  </div>
                  <div className="text-sm text-slate-500 mb-6">
                    المستوى: {levelLabels[course.level]}
                  </div>
                  {isEnrolled ? (
                    <div className="space-y-3">
                      <Badge className="bg-green-100 text-green-700 px-4 py-2 text-sm">
                        <CheckCircle className="h-4 w-4 ml-1" />
                        مسجل في الكورس
                      </Badge>
                      {myCourses?.find((c) => c.id === courseId)?.progress !== undefined && (
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>التقدم</span>
                            <span>{myCourses?.find((c) => c.id === courseId)?.progress}%</span>
                          </div>
                          <Progress
                            value={myCourses?.find((c) => c.id === courseId)?.progress}
                            className="h-2"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
                      onClick={handleEnroll}
                      disabled={enrolling}
                    >
                      {enrolling ? (
                        <Loader2 className="h-5 w-5 animate-spin ml-2" />
                      ) : (
                        <Play className="h-5 w-5 ml-2" />
                      )}
                      {enrolling ? "جاري التسجيل..." : "سجل الآن"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lessons List */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                محتوى الكورس
              </h2>

              {course.lessons.length === 0 ? (
                <Card className="border-0 shadow-md">
                  <CardContent className="p-8 text-center text-slate-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                    لا توجد دروس متاحة حالياً
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {course.lessons.map((lesson, index) => {
                    const progress = lessonProgressData?.find(
                      (lp) => lp.lessonId === lesson.id,
                    );
                    const isCompleted = progress?.isCompleted ?? false;
                    const isFirst = index === 0;
                    const canAccess = isEnrolled && (lesson.isFree || isFirst || isCompleted);

                    return (
                      <Card
                        key={lesson.id}
                        className={`border-0 shadow-sm hover:shadow-md transition-shadow ${
                          isCompleted ? "border-r-4 border-r-green-500" : ""
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                                isCompleted
                                  ? "bg-green-100 text-green-600"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle className="h-5 w-5" />
                              ) : lesson.type === "video" ? (
                                <Play className="h-5 w-5" />
                              ) : lesson.type === "pdf" ? (
                                <FileText className="h-5 w-5" />
                              ) : (
                                <HelpCircle className="h-5 w-5" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-slate-900 line-clamp-1">
                                  {lesson.title}
                                </h3>
                                {lesson.isFree && (
                                  <Badge className="bg-blue-100 text-blue-700 text-xs">
                                    مجاني
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-slate-500 line-clamp-1">
                                {lesson.description || `${lesson.duration} دقيقة`}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              {isCompleted && (
                                <Badge className="bg-green-100 text-green-700">
                                  مكتمل
                                </Badge>
                              )}
                              {isEnrolled && (canAccess || isFirst) ? (
                                <Link to={`/lessons/${lesson.id}`}>
                                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                    مشاهدة
                                  </Button>
                                </Link>
                              ) : (
                                <Lock className="h-5 w-5 text-slate-300" />
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sidebar - Quizzes */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                الاختبارات
              </h2>
              {course.quizzes.length === 0 ? (
                <Card className="border-0 shadow-md">
                  <CardContent className="p-6 text-center text-slate-500">
                    <HelpCircle className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                    لا توجد اختبارات
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {course.quizzes.map((quiz) => (
                    <Card key={quiz.id} className="border-0 shadow-sm">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-slate-900 mb-2">
                          {quiz.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {quiz.timeLimit} دقيقة
                          </span>
                          <span>درجة النجاح: {quiz.passingScore}%</span>
                        </div>
                        {isEnrolled ? (
                          <Link to={`/quizzes/${quiz.id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                            >
                              بدء الاختبار
                            </Button>
                          </Link>
                        ) : (
                          <Button size="sm" variant="outline" disabled className="w-full">
                            <Lock className="h-4 w-4 ml-1" />
                            سجل للوصول
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
