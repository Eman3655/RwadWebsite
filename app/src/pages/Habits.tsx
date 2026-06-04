import { useState } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/providers/trpc";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Flame,
  CheckCircle2,
  Trash2,
  Target,
  Sparkles,
  Loader2,
} from "lucide-react";
import {
  celebrateDoneToday,
  celebrateGoalAchieved,
} from "@/utils/celebrations";

function isDoneToday(value?: string | Date | null) {
  if (!value) return false;

  const date = new Date(value);
  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function progressColor(progress: number) {
  if (progress >= 100) return "bg-green-600";
  if (progress >= 70) return "bg-blue-600";
  if (progress >= 40) return "bg-orange-500";
  return "bg-red-500";
}

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

export default function Habits() {
  const utils = trpc.useUtils();

  const { data: habits = [], isLoading } = trpc.habit.list.useQuery();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goalDays, setGoalDays] = useState(30);

  const createHabit = trpc.habit.create.useMutation({
    onSuccess: () => {
      utils.habit.list.invalidate();
      setTitle("");
      setDescription("");
      setGoalDays(30);
      setOpen(false);
    },
  });

  const deleteHabit = trpc.habit.delete.useMutation({
    onSuccess: () => utils.habit.list.invalidate(),
  });

  const markDone = trpc.habit.markDone.useMutation({
    onSuccess: (res) => {
      utils.habit.list.invalidate();

      if (res?.success) {
        celebrateDoneToday();

        if (res.completedGoal) {
          setTimeout(() => celebrateGoalAchieved(), 350);
        }
      }
    },
  });

  const handleCreate = () => {
    if (!title.trim()) return;

    createHabit.mutate({
      title: title.trim(),
      description: description.trim(),
      goalDays,
    });
  };

  const totalHabits = habits.length;

  const doneTodayCount = habits.filter((habit) =>
    isDoneToday(habit.lastCompletedAt),
  ).length;

  const completedGoals = habits.filter(
    (habit) => habit.currentStreak >= habit.goalDays,
  ).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <motion.div
        initial="hidden"
        animate="show"
        transition={{ staggerChildren: 0.07 }}
        className="pt-24 pb-12"
      >
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            variants={fadeUp}
            className="rounded-[2rem] border shadow-sm p-6 md:p-8 mb-6 relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, #E5F0FF 0%, #F3E8FF 55%, #EAF7EE 100%)",
              borderColor: "#D8B4FE",
            }}
          >
            <div className="absolute -top-16 -left-16 w-52 h-52 bg-white/40 rounded-full blur-2xl" />
            <div className="absolute -bottom-20 -right-12 w-64 h-64 bg-white/40 rounded-full blur-2xl" />

            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/70 border border-white px-3 py-1 rounded-full text-sm text-blue-700 mb-4">
                  <Target className="h-4 w-4" />
                  مساحة الالتزام اليومية
                </div>

                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
                  العادات اليومية
                </h1>

                <p className="text-slate-600 mt-3 max-w-xl">
                  تابع عاداتك اليومية وسجّل إنجازك حتى تحقق هدفك.
                </p>
              </div>

              <Button
                onClick={() => setOpen(true)}
                className="rounded-2xl bg-blue-700 hover:bg-blue-800 h-11 px-5"
              >
                <Plus className="h-5 w-5 ml-2" />
                إضافة عادة
              </Button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <motion.div variants={fadeUp}>
              <div className="rounded-3xl border bg-blue-50 border-blue-100 p-4">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center text-blue-700">
                    <Target className="h-5 w-5" />
                  </div>

                  <div>
                    <div className="text-2xl font-extrabold text-blue-700">
                      {totalHabits}
                    </div>
                    <div className="text-sm text-blue-700">إجمالي العادات</div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeUp}>
              <div className="rounded-3xl border bg-green-50 border-green-100 p-4">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center text-green-700">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>

                  <div>
                    <div className="text-2xl font-extrabold text-green-700">
                      {doneTodayCount}
                    </div>
                    <div className="text-sm text-green-700">
                      تم إنجازها اليوم
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeUp}>
              <div className="rounded-3xl border bg-purple-50 border-purple-100 p-4">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center text-purple-700">
                    <Sparkles className="h-5 w-5" />
                  </div>

                  <div>
                    <div className="text-2xl font-extrabold text-purple-700">
                      {completedGoals}
                    </div>
                    <div className="text-sm text-purple-700">أهداف مكتملة</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-slate-400">
              <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
            </div>
          ) : habits.length === 0 ? (
            <motion.div
              variants={fadeUp}
              className="bg-white rounded-[2rem] border p-10 text-center shadow-sm"
            >
              <Sparkles className="h-12 w-12 text-blue-500 mx-auto mb-4" />

              <h2 className="text-2xl font-bold text-slate-900">
                لا توجد عادات بعد
              </h2>

              <p className="text-slate-500 mt-2 mb-6">
                أضف عادة جديدة وابدأ الالتزام من اليوم.
              </p>

              <Button
                onClick={() => setOpen(true)}
                className="bg-blue-700 hover:bg-blue-800 rounded-2xl"
              >
                <Plus className="h-4 w-4 ml-2" />
                إضافة عادة
              </Button>
            </motion.div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {habits.map((habit, index) => {
                const progress = Math.min(
                  Math.round((habit.currentStreak / habit.goalDays) * 100),
                  100,
                );

                const completed = habit.currentStreak >= habit.goalDays;
                const doneToday = isDoneToday(habit.lastCompletedAt);

                return (
                  <motion.div
                    key={habit.id}
                    variants={fadeUp}
                    transition={{ delay: index * 0.035 }}
                    className="bg-white rounded-3xl border shadow-sm p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="text-lg font-bold text-slate-900 line-clamp-1">
                          {habit.title}
                        </h2>

                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          {habit.source === "admin" && (
                            <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[11px] font-semibold">
                              من الإدارة
                            </span>
                          )}

                          {doneToday && !completed && (
                            <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[11px] font-semibold">
                              منجز اليوم
                            </span>
                          )}

                          {completed && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-semibold">
                              مكتمل
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (confirm("هل تريد حذف هذه العادة؟")) {
                            deleteHabit.mutate({ id: habit.id });
                          }
                        }}
                        className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center shrink-0"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>

                    {habit.description && (
                      <p className="text-xs text-slate-500 mt-3 leading-5 line-clamp-2 min-h-[40px]">
                        {habit.description}
                      </p>
                    )}

<div className="mt-4">
  <div className="flex items-center justify-between mb-2">
    <span className="text-xs font-semibold text-slate-500">
      التقدم
    </span>

    <span className="text-xs font-bold text-slate-900">
      {progress}%
    </span>
  </div>

  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 0.6 }}
      className={`h-full rounded-full ${progressColor(progress)}`}
    />
  </div>
</div>

                    <div className="flex gap-2 mt-4">
                      <div className="flex-1 rounded-xl bg-orange-50 p-2 text-center">
                        <Flame className="h-4 w-4 text-orange-500 mx-auto mb-1" />
                        <div className="text-base font-extrabold text-slate-900">
                          {habit.currentStreak}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          متتالية
                        </div>
                      </div>

                      <div className="flex-1 rounded-xl bg-blue-50 p-2 text-center">
                        <Target className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                        <div className="text-base font-extrabold text-slate-900">
                          {habit.goalDays}
                        </div>
                        <div className="text-[11px] text-slate-500">الهدف</div>
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        if (!completed && !doneToday && !markDone.isPending) {
                          markDone.mutate({ id: habit.id });
                        }
                      }}
                      disabled={completed || doneToday || markDone.isPending}
                      className={`mt-4 w-full h-10 rounded-2xl text-sm font-bold transition ${
                        completed
                          ? "bg-green-100 text-green-700 hover:bg-green-100 cursor-not-allowed"
                          : doneToday
                            ? "bg-slate-200 text-slate-500 hover:bg-slate-200 cursor-not-allowed"
                            : markDone.isPending
                              ? "bg-blue-300 text-white cursor-not-allowed"
                              : "bg-blue-700 hover:bg-blue-800 text-white"
                      }`}
                    >
                      {completed
                        ? "تم تحقيق الهدف 🎉"
                        : doneToday
                          ? "تم تسجيل اليوم"
                          : markDone.isPending
                            ? "جاري التسجيل..."
                            : "تسجيل إنجاز اليوم"}
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-[2rem] max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              إضافة عادة جديدة
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <input
              type="text"
              placeholder="عنوان العادة"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-12 rounded-2xl border px-4 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <textarea
              placeholder="وصف مختصر"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-28 rounded-2xl border p-4 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="number"
              min={1}
              max={365}
              value={goalDays}
              onChange={(e) => setGoalDays(Number(e.target.value))}
              className="w-full h-12 rounded-2xl border px-4 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <Button
              onClick={handleCreate}
              disabled={createHabit.isPending || !title.trim()}
              className="w-full h-12 rounded-2xl bg-blue-700 hover:bg-blue-800"
            >
              {createHabit.isPending ? "جاري الإضافة..." : "حفظ العادة"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}