import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Plus,
  Trash2,
  ChevronLeft,
  Play,
  HelpCircle,
  Loader2,
  Pencil,
  Video,
} from "lucide-react";

type LessonType = "video" | "live" | "pdf" | "quiz" | "text";

export default function AdminLessons() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const utils = trpc.useUtils();

  const [selectedCourseId, setSelectedCourseId] = useState<number>(0);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const emptyForm = {
    title: "",
    description: "",
    type: "video" as LessonType,
    content: "",
    fileUrl: "",
    orderIndex: 0,
    duration: 0,
    isFree: false,
  };

  const [form, setForm] = useState(emptyForm);

  const { data: courses } = trpc.course.adminList.useQuery(undefined, {
    enabled: isAdmin,
  });

  const { data: lessons } = trpc.lesson.list.useQuery(
    { courseId: selectedCourseId },
    { enabled: selectedCourseId > 0 },
  );

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const createMutation = trpc.lesson.create.useMutation({
    onSuccess: () => {
      utils.lesson.list.invalidate();
      setOpen(false);
      resetForm();
    },
  });

  const updateMutation = trpc.lesson.update.useMutation({
    onSuccess: () => {
      utils.lesson.list.invalidate();
      setOpen(false);
      resetForm();
    },
  });

  const deleteMutation = trpc.lesson.delete.useMutation({
    onSuccess: () => {
      utils.lesson.list.invalidate();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCourseId) return;

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        ...form,
      });
    } else {
      createMutation.mutate({
        ...form,
        courseId: selectedCourseId,
      });
    }
  };

  const handleEdit = (lesson: any) => {
    setEditingId(lesson.id);

    setForm({
      title: lesson.title || "",
      description: lesson.description || "",
      type: (lesson.type || "video") as LessonType,
      content: lesson.content || "",
      fileUrl: lesson.fileUrl || "",
      orderIndex: lesson.orderIndex || 0,
      duration: lesson.duration || 0,
      isFree: lesson.isFree || false,
    });

    setOpen(true);
  };

  const typeLabels: Record<string, string> = {
    video: "فيديو مسجل",
    live: "جلسة مباشرة",
    pdf: "PDF",
    quiz: "اختبار",
    text: "نص",
  };

  const typeIcons: Record<string, typeof Play> = {
    video: Play,
    live: Video,
    pdf: FileText,
    quiz: HelpCircle,
    text: FileText,
  };

  const contentLabel =
    form.type === "video"
      ? "رابط الفيديو"
      : form.type === "live"
        ? "رابط Google Meet"
        : form.type === "pdf"
          ? "رابط ملف PDF"
          : "المحتوى";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="text-slate-500 hover:text-slate-700">
                <ChevronLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-xl font-bold text-slate-900">إدارة الدروس</h1>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={!selectedCourseId}
                  onClick={() => resetForm()}
                >
                  <Plus className="h-4 w-4 ml-2" />
                  درس جديد
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {editingId ? "تعديل الدرس" : "إضافة درس جديد"}
                  </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>عنوان الدرس *</Label>
                    <Input
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>الوصف</Label>
                    <Input
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>نوع الدرس</Label>
                      <Select
                        value={form.type}
                        onValueChange={(v: LessonType) =>
                          setForm({ ...form, type: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="video">فيديو مسجل</SelectItem>
                          <SelectItem value="live">جلسة مباشرة</SelectItem>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="text">نص</SelectItem>
                          <SelectItem value="quiz">اختبار</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>الترتيب</Label>
                      <Input
                        type="number"
                        value={form.orderIndex}
                        onChange={(e) =>
                          setForm({ ...form, orderIndex: Number(e.target.value) })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{contentLabel}</Label>
                    <Input
                      value={form.type === "pdf" ? form.fileUrl : form.content}
                      onChange={(e) =>
                        form.type === "pdf"
                          ? setForm({ ...form, fileUrl: e.target.value })
                          : setForm({ ...form, content: e.target.value })
                      }
                      placeholder={
                        form.type === "live"
                          ? "مثال: https://meet.google.com/abc-defg-hij"
                          : undefined
                      }
                    />
                  </div>

                  {form.type === "live" && (
                    <div className="space-y-2">
                      <Label>رابط التسجيل بعد انتهاء الجلسة - اختياري</Label>
                      <Input
                        value={form.fileUrl}
                        onChange={(e) =>
                          setForm({ ...form, fileUrl: e.target.value })
                        }
                        placeholder="رابط تسجيل YouTube أو Google Drive"
                      />

                      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700 leading-7">
                        أثناء الدرس سيظهر زر دخول إلى Google Meet. بعد انتهاء
                        الدرس يمكنك وضع رابط التسجيل هنا ليظهر للطالبات في نفس
                        صفحة الدرس.
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>المدة - دقائق</Label>
                    <Input
                      type="number"
                      value={form.duration}
                      onChange={(e) =>
                        setForm({ ...form, duration: Number(e.target.value) })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>حالة الدرس</Label>
                    <Select
                      value={form.isFree ? "free" : "paid"}
                      onValueChange={(v) =>
                        setForm({ ...form, isFree: v === "free" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paid">مدفوع / للطالبات المسجلات</SelectItem>
                        <SelectItem value="free">مجاني</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    ) : editingId ? (
                      <Pencil className="h-4 w-4 ml-2" />
                    ) : (
                      <Plus className="h-4 w-4 ml-2" />
                    )}

                    {editingId ? "حفظ التعديلات" : "إضافة الدرس"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-0 shadow-md mb-6">
          <CardContent className="p-4">
            <Label className="mb-2 block">اختر البرنامج</Label>
            <Select
              value={String(selectedCourseId)}
              onValueChange={(v) => setSelectedCourseId(Number(v))}
            >
              <SelectTrigger className="w-full md:w-96">
                <SelectValue placeholder="اختر برنامجًا" />
              </SelectTrigger>
              <SelectContent>
                {courses?.map((course) => (
                  <SelectItem key={course.id} value={String(course.id)}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedCourseId > 0 && (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>دروس البرنامج</CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">
                        #
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">
                        الدرس
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">
                        النوع
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">
                        المدة
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">
                        الحالة
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">
                        إجراءات
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {lessons?.map((lesson, idx) => {
                      const TypeIcon = typeIcons[lesson.type] || FileText;

                      return (
                        <tr
                          key={lesson.id}
                          className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                        >
                          <td className="py-3 px-4 text-sm text-slate-400">
                            {idx + 1}
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                                <TypeIcon className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-medium text-slate-900">
                                  {lesson.title}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <Badge className="bg-slate-100 text-slate-600">
                              {typeLabels[lesson.type] ?? lesson.type}
                            </Badge>
                          </td>

                          <td className="py-3 px-4 text-sm text-slate-500">
                            {lesson.duration} دقيقة
                          </td>

                          <td className="py-3 px-4">
                            <Badge
                              className={
                                lesson.isFree
                                  ? "bg-green-100 text-green-700"
                                  : "bg-blue-100 text-blue-700"
                              }
                            >
                              {lesson.isFree ? "مجاني" : "مسجلات"}
                            </Badge>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(lesson)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => {
                                  if (confirm("هل أنت متأكد من حذف هذا الدرس؟")) {
                                    deleteMutation.mutate({ id: lesson.id });
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {(!lessons || lessons.length === 0) && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          لا توجد دروس في هذا البرنامج
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}