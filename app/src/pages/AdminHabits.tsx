import { useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { trpc } from "@/providers/trpc";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

import {
  Target,
  Users,
  Send,
  Sparkles,
  ChevronLeft,
  Plus,
  Loader2,
} from "lucide-react";

export default function AdminHabits() {
  const utils = trpc.useUtils();

  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goalDays, setGoalDays] = useState(30);

  const { data: students = [] } = trpc.habit.students.useQuery();

  const resetForm = () => {
    setUserId("");
    setTitle("");
    setDescription("");
    setGoalDays(30);
  };

  const createHabit = trpc.habit.adminCreate.useMutation({
    onSuccess: () => {
      utils.habit.students.invalidate();
      resetForm();
      setOpen(false);
    },
  });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId || !title.trim()) return;

    await createHabit.mutateAsync({
      userId: Number(userId),
      title: title.trim(),
      description: description.trim(),
      goalDays,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="text-slate-500 hover:text-slate-700"
              >
                <ChevronLeft className="h-5 w-5" />
              </Link>

              <h1 className="text-xl font-bold text-slate-900">
                إدارة العادات
              </h1>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={resetForm}
                >
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة عادة
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>إضافة عادة للطالب</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSend} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>الطالب *</Label>

                    <Select value={userId} onValueChange={setUserId}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الطالب" />
                      </SelectTrigger>

                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem
                            key={student.id}
                            value={String(student.id)}
                          >
                            {student.name} - {student.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>عنوان العادة *</Label>

                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="مثال: قراءة ورد يومي"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>عدد الأيام</Label>

                    <Input
                      type="number"
                      min={1}
                      value={goalDays}
                      onChange={(e) => setGoalDays(Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>وصف العادة</Label>

                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="تفاصيل إضافية"
                      className="w-full min-h-28 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={createHabit.isPending || !userId || !title.trim()}
                  >
                    {createHabit.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    ) : (
                      <Send className="h-4 w-4 ml-2" />
                    )}

                    {createHabit.isPending ? "جاري الإرسال..." : "إرسال العادة"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-extrabold text-slate-900">
            إدارة عادات الطلاب
          </h2>

          <p className="text-slate-500 mt-2">
            أرسل عادات يومية للطلاب وحدد مدة الالتزام المطلوبة.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid md:grid-cols-3 gap-5"
        >
          <Card className="border-0 shadow-md rounded-[2rem]">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <Users className="h-7 w-7 text-blue-700" />
              </div>

              <div className="text-3xl font-extrabold text-slate-900">
                {students.length}
              </div>

              <div className="text-slate-500 mt-2">عدد الطلاب</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md rounded-[2rem]">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <Target className="h-7 w-7 text-purple-700" />
              </div>

              <div className="text-3xl font-extrabold text-slate-900">
                عادات
              </div>

              <div className="text-slate-500 mt-2">متابعة الالتزام</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md rounded-[2rem]">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-7 w-7 text-green-700" />
              </div>

              <div className="text-3xl font-extrabold text-slate-900">
                أهداف
              </div>

              <div className="text-slate-500 mt-2">تحفيز الطلاب يوميًا</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8"
        >
          <Card className="border-0 shadow-md rounded-[2rem]">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-3xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-blue-700" />
              </div>

              <h3 className="text-2xl font-bold text-slate-900">
                إضافة عادة جديدة
              </h3>

              <p className="text-slate-500 mt-2 mb-6">
                اضغط على زر إضافة عادة بالأعلى لإرسال عادة لطالب محدد.
              </p>

              <Button
                onClick={() => setOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 ml-2" />
                إضافة عادة الآن
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}