import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  Paperclip,
  Upload,
  FileText,
  Trash2,
  Loader2,
  Download,
} from "lucide-react";

function formatFileSize(size?: number | null) {
  if (!size) return "";
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminCourseAttachments() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const utils = trpc.useUtils();

  const [courseId, setCourseId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileType, setFileType] = useState("");
  const [fileSize, setFileSize] = useState<number | undefined>();
  const [uploading, setUploading] = useState(false);

  const { data: courses } = trpc.course.adminList.useQuery(undefined, {
    enabled: isAdmin,
  });

  const { data: attachments, isLoading } =
    trpc.courseAttachment.listByCourse.useQuery(
      { courseId: courseId ?? 0 },
      { enabled: !!courseId },
    );

  const createMutation = trpc.courseAttachment.create.useMutation({
    onSuccess: () => {
      utils.courseAttachment.listByCourse.invalidate();
      setTitle("");
      setFileUrl("");
      setFileType("");
      setFileSize(undefined);
    },
  });

  const deleteMutation = trpc.courseAttachment.delete.useMutation({
    onSuccess: () => {
      utils.courseAttachment.listByCourse.invalidate();
    },
  });

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);

    try {
      const res = await fetch("/api/upload/course-attachment", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Upload failed");
      }

      setFileUrl(data.url);
      setFileType(data.fileType || file.type || "file");
      setFileSize(data.fileSize || file.size);

      if (!title.trim()) {
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    } catch (error) {
      console.error(error);
      alert("فشل رفع الملف");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!courseId) {
      alert("اختر البرنامج أولاً");
      return;
    }

    if (!title.trim() || !fileUrl.trim()) {
      alert("أدخل عنوان المرفق وارفع الملف");
      return;
    }

    createMutation.mutate({
      courseId,
      title: title.trim(),
      fileUrl,
      fileType,
      fileSize,
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 h-16">
            <Link to="/dashboard" className="text-slate-500 hover:text-slate-700">
              <ChevronLeft className="h-5 w-5" />
            </Link>

            <h1 className="text-xl font-bold text-slate-900">
              إدارة مرفقات البرامج
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border-0 shadow-sm rounded-[2rem] lg:col-span-1">
            <CardContent className="p-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <Paperclip className="h-7 w-7" />
              </div>

              <h2 className="text-2xl font-extrabold text-slate-900 mb-1">
                إضافة مرفق
              </h2>

              <p className="text-sm text-slate-500 mb-6">
                ارفع كتابًا مرجعيًا أو ملفًا خاصًا بأحد البرامج.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label>البرنامج</Label>

                  <Select
                    value={courseId ? String(courseId) : ""}
                    onValueChange={(v) => setCourseId(Number(v))}
                  >
                    <SelectTrigger className="h-12 rounded-2xl">
                      <SelectValue placeholder="اختر البرنامج" />
                    </SelectTrigger>

                    <SelectContent>
                      {courses?.map((course) => (
                        <SelectItem key={course.id} value={String(course.id)}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>عنوان المرفق</Label>

                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: الكتاب المرجعي للبرنامج"
                    className="h-12 rounded-2xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label>الملف</Label>

                  <label className="h-32 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 transition cursor-pointer flex flex-col items-center justify-center text-center px-4">
                    {uploading ? (
                      <>
                        <Loader2 className="h-7 w-7 animate-spin text-blue-700 mb-2" />
                        <span className="text-sm text-blue-700">
                          جاري رفع الملف...
                        </span>
                      </>
                    ) : fileUrl ? (
                      <>
                        <FileText className="h-8 w-8 text-green-700 mb-2" />
                        <span className="text-sm font-semibold text-green-700">
                          تم رفع الملف بنجاح
                        </span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-slate-400 mb-2" />
                        <span className="text-sm text-slate-500">
                          اختر ملف PDF أو Word أو أي ملف مرجعي
                        </span>
                      </>
                    )}

                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(file);
                      }}
                    />
                  </label>
                </div>

                {fileUrl && (
                  <div className="rounded-2xl bg-green-50 border border-green-100 p-3 text-sm text-green-700">
                    الملف جاهز للحفظ
                    {fileSize ? ` • ${formatFileSize(fileSize)}` : ""}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={
                    createMutation.isPending ||
                    uploading ||
                    !courseId ||
                    !title.trim() ||
                    !fileUrl
                  }
                  className="w-full h-12 rounded-2xl bg-blue-700 hover:bg-blue-800"
                >
                  {createMutation.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin ml-2" />
                  ) : (
                    <Paperclip className="h-5 w-5 ml-2" />
                  )}
                  حفظ المرفق
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm rounded-[2rem] lg:col-span-2">
            <CardContent className="p-6">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-1">
                مرفقات البرنامج
              </h2>

              <p className="text-sm text-slate-500 mb-6">
                اختر برنامجًا من القائمة لعرض المرفقات المرتبطة به.
              </p>

              {!courseId ? (
                <div className="rounded-3xl bg-slate-50 border border-slate-100 p-12 text-center text-slate-400">
                  اختر برنامجًا لعرض المرفقات
                </div>
              ) : isLoading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
                </div>
              ) : !attachments || attachments.length === 0 ? (
                <div className="rounded-3xl bg-slate-50 border border-slate-100 p-12 text-center text-slate-400">
                  لا توجد مرفقات لهذا البرنامج
                </div>
              ) : (
                <div className="space-y-3">
                  {attachments.map((file) => (
                    <div
                      key={file.id}
                      className="rounded-3xl bg-slate-50 border border-slate-100 p-4 flex items-center gap-4"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <FileText className="h-6 w-6" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 truncate">
                          {file.title}
                        </div>

                        <div className="text-sm text-slate-500 mt-1">
                          {file.fileType || "ملف"}
                          {file.fileSize ? ` • ${formatFileSize(file.fileSize)}` : ""}
                        </div>
                      </div>

                      <a href={file.fileUrl} target="_blank" rel="noreferrer">
                        <Button variant="outline" size="sm" className="rounded-2xl bg-white">
                          <Download className="h-4 w-4 ml-1" />
                          فتح
                        </Button>
                      </a>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-2xl text-red-500 hover:bg-red-50 hover:text-red-600"
                        disabled={deleteMutation.isPending}
                        onClick={() => {
                          if (confirm("هل تريد حذف هذا المرفق؟")) {
                            deleteMutation.mutate({ id: file.id });
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}