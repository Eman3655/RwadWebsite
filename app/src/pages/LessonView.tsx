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
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";

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

    const fileId =
      fileMatch?.[1] || parsed.searchParams.get("id");

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
  return (
    getYouTubeEmbedUrl(url) ||
    getGoogleDriveEmbedUrl(url)
  );
}

function getGoogleDrivePdfEmbed(url: string) {
  try {
    const parsed = new URL(url);

    if (!parsed.hostname.includes("drive.google.com")) {
      return null;
    }

    const fileMatch = parsed.pathname.match(/\/file\/d\/([^/]+)/);

    const fileId =
      fileMatch?.[1] || parsed.searchParams.get("id");

    return fileId
      ? `https://drive.google.com/file/d/${fileId}/preview`
      : null;
  } catch {
    return null;
  }
}

export default function LessonView() {
  const { id } = useParams<{ id: string }>();
  const lessonId = Number(id);

  const { isAuthenticated } = useAuth();

  const navigate = useNavigate();

  const utils = trpc.useUtils();

  const [markedComplete, setMarkedComplete] =
    useState(false);

  const { data: lesson, isLoading } =
    trpc.lesson.getById.useQuery({
      id: lessonId,
    });

  const { data: allLessons } =
    trpc.lesson.list.useQuery(
      { courseId: lesson?.courseId ?? 0 },
      { enabled: !!lesson?.courseId },
    );

const completeMutation =
  trpc.lesson.complete.useMutation({
    onSuccess: () => {
      utils.lesson.getProgress.invalidate();
      utils.course.myCourses.invalidate();
      setMarkedComplete(true);

      setTimeout(() => {
        celebrateDoneToday();
      }, 200);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen">
        <Navbar />

        <div className="pt-24 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />

          <h2 className="text-2xl font-bold text-slate-900">
            الدرس غير موجود
          </h2>

          <Link to="/courses">
            <Button className="mt-4">
              العودة للكورسات
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentIndex =
    allLessons?.findIndex((l) => l.id === lessonId) ??
    -1;

  const prevLesson =
    currentIndex > 0
      ? allLessons?.[currentIndex - 1]
      : null;

  const nextLesson =
    currentIndex < (allLessons?.length ?? 0) - 1
      ? allLessons?.[currentIndex + 1]
      : null;

  const videoEmbedUrl =
    lesson.type === "video" && lesson.content
      ? getVideoEmbedUrl(lesson.content)
      : null;

  const handleComplete = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    completeMutation.mutate({ lessonId });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="pt-20 pb-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
            <Link
              to="/courses"
              className="hover:text-blue-600"
            >
              الكورسات
            </Link>

            <ChevronLeft className="h-4 w-4" />

            <Link
              to={`/courses/${lesson.courseId}`}
              className="hover:text-blue-600"
            >
              الكورس
            </Link>

            <ChevronLeft className="h-4 w-4" />

            <span className="text-slate-900">
              {lesson.title}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {lesson.type === "video" &&
                lesson.content && (
                  <div className="bg-black rounded-xl overflow-hidden shadow-lg mb-6 aspect-video">
                    {videoEmbedUrl ? (
                      <iframe
                        src={videoEmbedUrl}
                        className="w-full h-full"
                        title={lesson.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : isDirectVideoUrl(
                        lesson.content,
                      ) ? (
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

              {lesson.type === "pdf" &&
                lesson.fileUrl && (
                  <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
                    {getGoogleDrivePdfEmbed(
                      lesson.fileUrl,
                    ) ? (
                      <iframe
                        src={getGoogleDrivePdfEmbed(
                          lesson.fileUrl,
                        )!}
                        className="w-full aspect-[4/3]"
                        title={lesson.title}
                      />
                    ) : lesson.fileUrl
                        .toLowerCase()
                        .includes(".pdf") ? (
                      <iframe
                        src={lesson.fileUrl}
                        className="w-full aspect-[4/3]"
                        title={lesson.title}
                      />
                    ) : (
                      <div className="p-6 text-center">
                        <FileText className="h-12 w-12 mx-auto mb-3 text-red-500" />

                        <p className="text-slate-600 mb-4">
                          لا يمكن عرض هذا الملف داخل
                          الموقع.
                        </p>

                        <a
                          href={lesson.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Button>
                            فتح الملف
                          </Button>
                        </a>
                      </div>
                    )}
                  </div>
                )}

              {lesson.type === "text" && (
                <Card className="border-0 shadow-lg mb-6">
                  <CardContent className="p-8">
                    <div className="prose prose-slate max-w-none">
                      <div
                        dangerouslySetInnerHTML={{
                          __html:
                            lesson.content || "",
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h1 className="text-2xl font-bold text-slate-900">
                        {lesson.title}
                      </h1>

                      {lesson.description && (
                        <p className="text-slate-500 mt-2">
                          {
                            lesson.description
                          }
                        </p>
                      )}
                    </div>

                    <Badge>
                      {lesson.type}
                    </Badge>
                  </div>

                  {isAuthenticated && (
                    <Button
                      onClick={handleComplete}
                      disabled={
                        completeMutation.isPending ||
                        markedComplete
                      }
                      className="w-full"
                    >
                      {completeMutation.isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin ml-2" />
                      ) : (
                        <CheckCircle className="h-5 w-5 ml-2" />
                      )}

                      {markedComplete
                        ? "تم إكمال الدرس"
                        : "تحديد كمكتمل"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                قائمة الدروس
              </h3>

              <div className="space-y-2">
                {allLessons?.map((l, index) => {
                  const isCurrent =
                    l.id === lessonId;

                  return (
                    <Link
                      key={l.id}
                      to={`/lessons/${l.id}`}
                    >
                      <div
                        className={`p-3 rounded-lg transition-colors ${
                          isCurrent
                            ? "bg-blue-50 border-r-4 border-blue-600"
                            : "bg-white hover:bg-slate-50 border-r-4 border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-medium ${
                              isCurrent
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {index + 1}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-slate-900 line-clamp-1">
                              {l.title}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-8">
            {prevLesson ? (
              <Link
                to={`/lessons/${prevLesson.id}`}
              >
                <Button variant="outline">
                  <ChevronRight className="h-4 w-4 ml-1" />
                  الدرس السابق
                </Button>
              </Link>
            ) : (
              <div />
            )}

            {nextLesson ? (
              <Link
                to={`/lessons/${nextLesson.id}`}
              >
                <Button className="bg-blue-600 hover:bg-blue-700">
                  الدرس التالي
                  <ChevronLeft className="h-4 w-4 mr-1" />
                </Button>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}