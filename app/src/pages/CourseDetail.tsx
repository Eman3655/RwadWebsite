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
  CheckCircle,
  Lock,
  Loader2,
  Download,
  Paperclip,
} from "lucide-react";
import { useState } from "react";

const levelLabels: Record<string, string> = {
  beginner: "مبتدئ",
  intermediate: "متوسط",
  advanced: "متقدم",
};

function formatFileSize(size?: number | null) {
  if (!size) return "";

  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

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

  const { data: attachments } =
    trpc.courseAttachment.listByCourse.useQuery(
      { courseId },
      { enabled: !!courseId },
    );

  const { data: myCourses } = trpc.course.myCourses.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const isEnrolled = myCourses?.some((c) => c.id === courseId);
  const currentCourse = myCourses?.find((c) => c.id === courseId);

  const { data: lessonProgressData } = trpc.lesson.getProgress.useQuery(
    { courseId },
    { enabled: isAuthenticated && !!isEnrolled },
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
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Navbar />

        <div className="pt-28 text-center px-4">
          <h2 className="text-2xl font-bold text-slate-900">
            البرنامج غير موجود
          </h2>

          <Link to="/courses">
            <Button className="mt-4 rounded-2xl bg-blue-700 hover:bg-blue-800">
              العودة للبرامج
            </Button>
          </Link>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <section className="pt-24 pb-10 bg-gradient-to-br from-[#E5F0FF] via-white to-[#F3E8FF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-5">
            <Link to="/courses" className="hover:text-blue-700">
              البرامج
            </Link>
            <ChevronLeft className="h-4 w-4" />
            <span className="line-clamp-1">{course.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
              <Badge className="bg-white text-blue-700 border border-blue-100 rounded-full mb-4">
                {course.categoryName || "عام"}
              </Badge>

              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
                {course.title}
              </h1>

              <p className="text-slate-600 text-lg mb-7 leading-8 max-w-3xl">
                {course.description || "لا يوجد وصف"}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white/80 border border-white rounded-2xl p-4">
                  <Clock className="h-5 w-5 text-blue-700 mb-2" />
                  <div className="text-xs text-slate-500">المدة</div>
                  <div className="text-sm font-bold text-slate-900">
                    {course.duration} ساعة
                  </div>
                </div>

                <div className="bg-white/80 border border-white rounded-2xl p-4">
                  <BookOpen className="h-5 w-5 text-blue-700 mb-2" />
                  <div className="text-xs text-slate-500">الدروس</div>
                  <div className="text-sm font-bold text-slate-900">
                    {course.totalLessons} درس
                  </div>
                </div>

                <div className="bg-white/80 border border-white rounded-2xl p-4">
                  <HelpCircle className="h-5 w-5 text-blue-700 mb-2" />
                  <div className="text-xs text-slate-500">الاختبارات</div>
                  <div className="text-sm font-bold text-slate-900">
                    {course.totalQuizzes} اختبار
                  </div>
                </div>

                <div className="bg-white/80 border border-white rounded-2xl p-4">
                  <Paperclip className="h-5 w-5 text-blue-700 mb-2" />
                  <div className="text-xs text-slate-500">المرفقات</div>
                  <div className="text-sm font-bold text-slate-900">
                    {attachments?.length ?? 0} ملف
                  </div>
                </div>
              </div>
            </div>

            <Card className="border-0 shadow-lg rounded-[2rem] bg-white">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-extrabold text-blue-700 mb-2">
                  حيّهلا 😊
                </div>

                <div className="text-sm text-slate-500 mb-6">
                  المستوى: {levelLabels[course.level]}
                </div>

                {isEnrolled ? (
                  <div className="space-y-4">
                    <Badge className="bg-green-100 text-green-700 px-4 py-2 text-sm rounded-full">
                      <CheckCircle className="h-4 w-4 ml-1" />
                      مسجل في البرنامج
                    </Badge>

                    {currentCourse?.progress !== undefined && (
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-500">التقدم</span>
                          <span className="font-bold text-blue-700">
                            {currentCourse.progress}%
                          </span>
                        </div>

                        <Progress value={currentCourse.progress} />
                      </div>
                    )}
                  </div>
                ) : (
                  <Button
                    className="w-full h-12 rounded-2xl bg-blue-700 hover:bg-blue-800 text-base font-bold"
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
      </section>

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-sm rounded-[2rem]">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-extrabold text-slate-900 mb-1">
                    محتوى البرنامج
                  </h2>

                  <p className="text-sm text-slate-500 mb-6">
                    الدروس مرتبة لتبدأ خطوة بخطوة.
                  </p>

                  {course.lessons.length === 0 ? (
                    <div className="p-10 text-center text-slate-500">
                      <BookOpen className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                      لا توجد دروس متاحة حالياً
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {course.lessons.map((lesson, index) => {
                        const progress = lessonProgressData?.find(
                          (lp) => lp.lessonId === lesson.id,
                        );

                        const isCompleted = progress?.isCompleted ?? false;
                        const isFirst = index === 0;
                        const canAccess =
                          isEnrolled &&
                          (lesson.isFree || isFirst || isCompleted);

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
                                  <h3 className="font-semibold text-slate-900 line-clamp-1">
                                    {lesson.title}
                                  </h3>

                                  <p className="text-sm text-slate-500 line-clamp-1">
                                    {lesson.description ||
                                      `${lesson.duration} دقيقة`}
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
                                      <Button
                                        size="sm"
                                        className="bg-blue-600 hover:bg-blue-700"
                                      >
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
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-0 shadow-sm rounded-[2rem]">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-extrabold text-slate-900 mb-1">
                    الاختبارات
                  </h2>

                  <p className="text-sm text-slate-500 mb-6">
                    اختبر فهمك بعد دراسة الدروس.
                  </p>

                  {course.quizzes.length === 0 ? (
                    <div className="p-8 rounded-3xl bg-slate-50 text-center text-slate-500">
                      <HelpCircle className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                      لا توجد اختبارات
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {course.quizzes.map((quiz) => (
                        <Card
                          key={quiz.id}
                          className="border border-slate-100 shadow-sm rounded-3xl bg-slate-50"
                        >
                          <CardContent className="p-4">
                            <h3 className="font-bold text-slate-900 mb-3 line-clamp-1">
                              {quiz.title}
                            </h3>

                            <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {quiz.timeLimit} دقيقة
                              </span>

                              <span>النجاح: {quiz.passingScore}%</span>
                            </div>

                            {isEnrolled ? (
                              <Link to={`/quizzes/${quiz.id}`}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full rounded-2xl bg-white border-blue-600 text-blue-700 hover:bg-blue-50"
                                >
                                  بدء الاختبار
                                </Button>
                              </Link>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled
                                className="w-full rounded-2xl bg-white"
                              >
                                <Lock className="h-4 w-4 ml-1" />
                                سجل للوصول
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm rounded-[2rem]">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-extrabold text-slate-900 mb-1">
                    المرفقات
                  </h2>

                  <p className="text-sm text-slate-500 mb-6">
                    الكتب والملفات المرجعية الخاصة بالبرنامج.
                  </p>

                  {!attachments || attachments.length === 0 ? (
                    <div className="p-8 rounded-3xl bg-slate-50 text-center text-slate-500">
                      <Paperclip className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                      لا توجد مرفقات
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {attachments.map((file) => (
                        <Card
                          key={file.id}
                          className="border border-slate-100 shadow-sm rounded-3xl bg-slate-50"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                                <FileText className="h-5 w-5" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-slate-900 line-clamp-1">
                                  {file.title}
                                </h3>

                                <div className="text-xs text-slate-500 mt-1">
                                  {file.fileType || "ملف"}
                                  {file.fileSize
                                    ? ` • ${formatFileSize(file.fileSize)}`
                                    : ""}
                                </div>
                              </div>
                            </div>

                            <a
                              href={file.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full rounded-2xl bg-white border-blue-600 text-blue-700 hover:bg-blue-50 mt-4"
                              >
                                <Download className="h-4 w-4 ml-1" />
                                فتح / تحميل
                              </Button>
                            </a>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}