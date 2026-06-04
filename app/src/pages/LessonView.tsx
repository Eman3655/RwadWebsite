import { useParams, Link, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { celebrateDoneToday } from "@/utils/celebrations";
import {
  Play,
  FileText,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  BookOpen,
} from "lucide-react";

function getYouTubeEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtube.com")) {
      const videoId = parsed.searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (parsed.hostname.includes("youtu.be")) {
      const videoId = parsed.pathname.replace("/", "");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    return null;
  } catch {
    return null;
  }
}

function getGoogleDriveEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);

    if (!parsed.hostname.includes("drive.google.com")) {
      return null;
    }

    const fileMatch = parsed.pathname.match(/\/file\/d\/([^/]+)/);
    const fileId = fileMatch?.[1] || parsed.searchParams.get("id");

    return fileId
      ? `https://drive.google.com/file/d/${fileId}/preview`
      : null;
  } catch {
    return null;
  }
}

function isDirectVideoUrl(url: string) {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}

function getVideoEmbedUrl(url: string) {
  return getYouTubeEmbedUrl(url) || getGoogleDriveEmbedUrl(url);
}

function getGoogleDrivePdfEmbed(url: string) {
  try {
    const parsed = new URL(url);

    if (!parsed.hostname.includes("drive.google.com")) {
      return null;
    }

    const fileMatch = parsed.pathname.match(/\/file\/d\/([^/]+)/);
    const fileId = fileMatch?.[1] || parsed.searchParams.get("id");

    return fileId
      ? `https://drive.google.com/file/d/${fileId}/preview`
      : null;
  } catch {
    return null;
  }
}

const lessonTypeLabels: Record<string, string> = {
  video: "فيديو",
  pdf: "ملف PDF",
  text: "نص",
  quiz: "اختبار",
};

export default function LessonView() {
  const { id } = useParams<{ id: string }>();
  const lessonId = Number(id);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const utils = trpc.useUtils();

  const { data: lesson, isLoading } = trpc.lesson.getById.useQuery({
    id: lessonId,
  });

  const { data: allLessons } = trpc.lesson.list.useQuery(
    { courseId: lesson?.courseId ?? 0 },
    { enabled: !!lesson?.courseId },
  );

  const { data: lessonProgressData } = trpc.lesson.getProgress.useQuery(
    { courseId: lesson?.courseId ?? 0 },
    { enabled: isAuthenticated && !!lesson?.courseId },
  );

  const currentLessonProgress = lessonProgressData?.find(
    (progress) => progress.lessonId === lessonId,
  );

  const isCompleted = currentLessonProgress?.isCompleted ?? false;

  const toggleCompleteMutation = trpc.lesson.toggleComplete.useMutation({
    onSuccess: (res) => {
      if (lesson?.courseId) {
        utils.lesson.getProgress.invalidate({ courseId: lesson.courseId });
      }

      utils.course.myCourses.invalidate();

      if (res.completed) {
        setTimeout(() => {
          celebrateDoneToday();
        }, 200);
      }
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Navbar />

        <div className="pt-28 text-center px-4">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />

          <h2 className="text-2xl font-bold text-slate-900">
            الدرس غير موجود
          </h2>

          <Link to="/courses">
            <Button className="mt-4 rounded-2xl bg-blue-700 hover:bg-blue-800">
              العودة للكورسات
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentIndex =
    allLessons?.findIndex((currentLesson) => currentLesson.id === lessonId) ??
    -1;

  const prevLesson =
    currentIndex > 0 ? allLessons?.[currentIndex - 1] : null;

  const nextLesson =
    currentIndex < (allLessons?.length ?? 0) - 1
      ? allLessons?.[currentIndex + 1]
      : null;

  const videoEmbedUrl =
    lesson.type === "video" && lesson.content
      ? getVideoEmbedUrl(lesson.content)
      : null;

  const handleToggleComplete = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    toggleCompleteMutation.mutate({ lessonId });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
            <Link to="/courses" className="hover:text-blue-700">
              الكورسات
            </Link>

            <ChevronLeft className="h-4 w-4" />

            <Link
              to={`/courses/${lesson.courseId}`}
              className="hover:text-blue-700"
            >
              الكورس
            </Link>

            <ChevronLeft className="h-4 w-4" />

            <span className="text-slate-900 line-clamp-1">
              {lesson.title}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {lesson.type === "video" && lesson.content && (
                <div className="bg-black rounded-[2rem] overflow-hidden shadow-lg mb-6 aspect-video">
                  {videoEmbedUrl ? (
                    <iframe
                      src={videoEmbedUrl}
                      className="w-full h-full"
                      title={lesson.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : isDirectVideoUrl(lesson.content) ? (
                    <video
                      src={lesson.content}
                      controls
                      className="w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-center p-6">
                      الرابط غير مدعوم.
                    </div>
                  )}
                </div>
              )}

              {lesson.type === "pdf" && lesson.fileUrl && (
                <div className="bg-white rounded-[2rem] shadow-lg mb-6 overflow-hidden border">
                  {getGoogleDrivePdfEmbed(lesson.fileUrl) ? (
                    <iframe
                      src={getGoogleDrivePdfEmbed(lesson.fileUrl)!}
                      className="w-full aspect-[4/3]"
                      title={lesson.title}
                    />
                  ) : lesson.fileUrl.toLowerCase().includes(".pdf") ? (
                    <iframe
                      src={lesson.fileUrl}
                      className="w-full aspect-[4/3]"
                      title={lesson.title}
                    />
                  ) : (
                    <div className="p-8 text-center">
                      <FileText className="h-12 w-12 mx-auto mb-3 text-red-500" />

                      <p className="text-slate-600 mb-4">
                        لا يمكن عرض هذا الملف داخل الموقع.
                      </p>

                      <a
                        href={lesson.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button className="rounded-2xl bg-blue-700 hover:bg-blue-800">
                          فتح الملف
                        </Button>
                      </a>
                    </div>
                  )}
                </div>
              )}

              {lesson.type === "text" && (
                <Card className="border-0 shadow-sm mb-6 rounded-[2rem]">
                  <CardContent className="p-8">
                    <div className="prose prose-slate max-w-none">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: lesson.content || "",
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="border-0 shadow-sm rounded-[2rem]">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="rounded-full bg-blue-100 text-blue-700">
                          {lessonTypeLabels[lesson.type] ?? lesson.type}
                        </Badge>

                        {isCompleted && (
                          <Badge className="rounded-full bg-green-100 text-green-700">
                            مكتمل
                          </Badge>
                        )}
                      </div>

                      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
                        {lesson.title}
                      </h1>

                      {lesson.description && (
                        <p className="text-slate-500 mt-3 leading-7">
                          {lesson.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {isAuthenticated && (
                    <Button
                      onClick={handleToggleComplete}
                      disabled={toggleCompleteMutation.isPending}
                      className={`w-full h-12 rounded-2xl font-bold ${
                        isCompleted
                          ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                          : "bg-blue-700 hover:bg-blue-800 text-white"
                      }`}
                    >
                      {toggleCompleteMutation.isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin ml-2" />
                      ) : isCompleted ? (
                        <XCircle className="h-5 w-5 ml-2" />
                      ) : (
                        <CheckCircle className="h-5 w-5 ml-2" />
                      )}

                      {toggleCompleteMutation.isPending
                        ? "جاري الحفظ..."
                        : isCompleted
                          ? "إلغاء إكمال الدرس"
                          : "تحديد كمكتمل"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="border-0 shadow-sm rounded-[2rem] sticky top-24">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-11 h-11 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700">
                      <BookOpen className="h-5 w-5" />
                    </div>

                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900">
                        قائمة الدروس
                      </h3>

                      <p className="text-xs text-slate-500">
                        {allLessons?.length ?? 0} درس
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {allLessons?.map((currentLesson, index) => {
                      const isCurrent = currentLesson.id === lessonId;

                      const lessonProgress = lessonProgressData?.find(
                        (progress) => progress.lessonId === currentLesson.id,
                      );

                      const completed =
                        lessonProgress?.isCompleted ?? false;

                      return (
                        <Link
                          key={currentLesson.id}
                          to={`/lessons/${currentLesson.id}`}
                        >
                          <div
                            className={`p-3 rounded-2xl transition-all border ${
                              isCurrent
                                ? "bg-blue-50 border-blue-200"
                                : "bg-white border-slate-100 hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold ${
                                  completed
                                    ? "bg-green-100 text-green-700"
                                    : isCurrent
                                      ? "bg-blue-700 text-white"
                                      : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {completed ? (
                                  <CheckCircle className="h-5 w-5" />
                                ) : (
                                  index + 1
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div
                                  className={`text-sm font-bold line-clamp-1 ${
                                    isCurrent
                                      ? "text-blue-700"
                                      : "text-slate-900"
                                  }`}
                                >
                                  {currentLesson.title}
                                </div>

                                <div className="text-xs text-slate-400 mt-0.5">
                                  الدرس {index + 1}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-between mt-8">
            {prevLesson ? (
              <Link to={`/lessons/${prevLesson.id}`}>
                <Button variant="outline" className="rounded-2xl bg-white">
                  <ChevronRight className="h-4 w-4 ml-1" />
                  الدرس السابق
                </Button>
              </Link>
            ) : (
              <div />
            )}

            {nextLesson ? (
              <Link to={`/lessons/${nextLesson.id}`}>
                <Button className="rounded-2xl bg-blue-700 hover:bg-blue-800">
                  الدرس التالي
                  <ChevronLeft className="h-4 w-4 mr-1" />
                </Button>
              </Link>
            ) : (
              <Link to={`/courses/${lesson.courseId}`}>
                <Button className="rounded-2xl bg-green-600 hover:bg-green-700">
                  العودة للكورس
                  <ChevronLeft className="h-4 w-4 mr-1" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}