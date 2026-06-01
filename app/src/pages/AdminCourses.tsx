import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
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
  BookOpen,
  Plus,
  Trash2,
  ChevronLeft,
  Loader2,
  Search,
  Pencil,
} from "lucide-react";

export default function AdminCourses() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const utils = trpc.useUtils();

  const { data: courses } = trpc.course.adminList.useQuery(undefined, {
    enabled: isAdmin,
  });

  const { data: categories } = trpc.course.categories.useQuery();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    categoryId: 0,
    instructorId: 1,
    price: "0",
    duration: 0,
    level: "beginner" as "beginner" | "intermediate" | "advanced",
    isPublished: false,
  });

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      categoryId: 0,
      instructorId: 1,
      price: "0",
      duration: 0,
      level: "beginner",
      isPublished: false,
    });
  };

  const createMutation = trpc.course.create.useMutation({
    onSuccess: () => {
      utils.course.adminList.invalidate();
      setOpen(false);
      resetForm();
    },
  });

  const updateMutation = trpc.course.update.useMutation({
    onSuccess: () => {
      utils.course.adminList.invalidate();
      setOpen(false);
      setEditingId(null);
      resetForm();
    },
  });

  const deleteMutation = trpc.course.delete.useMutation({
    onSuccess: () => {
      utils.course.adminList.invalidate();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        ...form,
      });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleEdit = (course: any) => {
    setEditingId(course.id);
    setForm({
      title: course.title || "",
      description: course.description || "",
      categoryId: course.categoryId || 0,
      instructorId: course.instructorId || 1,
      price: course.price || "0",
      duration: course.duration || 0,
      level: course.level || "beginner",
      isPublished: course.isPublished || false,
    });
    setOpen(true);
  };

  const filteredCourses = courses?.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()),
  );

  const levelLabels: Record<string, string> = {
    beginner: "مبتدئ",
    intermediate: "متوسط",
    advanced: "متقدم",
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="text-slate-500 hover:text-slate-700">
                <ChevronLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-xl font-bold text-slate-900">إدارة الكورسات</h1>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    setEditingId(null);
                    resetForm();
                  }}
                >
                  <Plus className="h-4 w-4 ml-2" />
                  كورس جديد
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {editingId ? "تعديل الكورس" : "إضافة كورس جديد"}
                  </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>عنوان الكورس *</Label>
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
                      <Label>التصنيف</Label>
                      <Select
                        value={String(form.categoryId)}
                        onValueChange={(v) =>
                          setForm({ ...form, categoryId: Number(v) })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories?.map((cat) => (
                            <SelectItem key={cat.id} value={String(cat.id)}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>المستوى</Label>
                      <Select
                        value={form.level}
                        onValueChange={(
                          v: "beginner" | "intermediate" | "advanced",
                        ) => setForm({ ...form, level: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">مبتدئ</SelectItem>
                          <SelectItem value="intermediate">متوسط</SelectItem>
                          <SelectItem value="advanced">متقدم</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>السعر</Label>
                      <Input
                        type="number"
                        value={form.price}
                        onChange={(e) =>
                          setForm({ ...form, price: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>المدة - ساعات</Label>
                      <Input
                        type="number"
                        value={form.duration}
                        onChange={(e) =>
                          setForm({ ...form, duration: Number(e.target.value) })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>حالة النشر</Label>
                    <Select
                      value={form.isPublished ? "published" : "draft"}
                      onValueChange={(v) =>
                        setForm({ ...form, isPublished: v === "published" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">مسودة</SelectItem>
                        <SelectItem value="published">منشور</SelectItem>
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
                    {editingId ? "حفظ التعديلات" : "إضافة الكورس"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="بحث في الكورسات..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10"
            />
          </div>
        </div>

        <Card className="border-0 shadow-md">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">
                      الكورس
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">
                      المستوى
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">
                      السعر
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">
                      الدروس
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
                  {filteredCourses?.map((course) => (
                    <tr
                      key={course.id}
                      className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                            <BookOpen className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">
                              {course.title}
                            </div>
                            <div className="text-sm text-slate-500">
                              {course.instructorName}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <Badge className="bg-slate-100 text-slate-600">
                          {levelLabels[course.level]}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-sm font-medium">
                        {Number(course.price) === 0 ? (
                          <span className="text-green-600">مجاني</span>
                        ) : (
                          `${course.price}`
                        )}
                      </td>

                      <td className="py-3 px-4 text-sm text-slate-500">
                        {course.totalLessons} درس
                      </td>

                      <td className="py-3 px-4">
                        <Badge
                          className={
                            course.isPublished
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }
                        >
                          {course.isPublished ? "منشور" : "مسودة"}
                        </Badge>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Link to={`/courses/${course.id}`}>
                            <Button variant="ghost" size="sm">
                              عرض
                            </Button>
                          </Link>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(course)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => {
                              if (confirm("هل أنت متأكد من حذف هذا الكورس؟")) {
                                deleteMutation.mutate({ id: course.id });
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {(!filteredCourses || filteredCourses.length === 0) && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        لا توجد كورسات
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}