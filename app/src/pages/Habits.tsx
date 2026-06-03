import { useState } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/providers/trpc";
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
  X,
} from "lucide-react";
import {
  celebrateDoneToday,
  celebrateGoalAchieved,
} from "@/utils/celebrations";

function progressColor(progress: number) {
  if (progress >= 100) return "from-emerald-500 to-green-600";
  if (progress >= 70) return "from-blue-600 to-indigo-600";
  if (progress >= 40) return "from-amber-400 to-orange-500";
  return "from-rose-400 to-red-500";
}


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
      title,
      description,
      goalDays,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900">
              العادات اليومية
            </h1>
            <p className="text-slate-500 mt-3">
              تابع عاداتك اليومية والتزم بها حتى تحقق هدفك.
            </p>
          </div>

          <Button
            onClick={() => setOpen(true)}
            className="rounded-2xl bg-blue-700 hover:bg-blue-800 h-12 px-6"
          >
            <Plus className="h-5 w-5 ml-2" />
            إضافة عادة
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-slate-400">
            جاري التحميل...
          </div>
        ) : habits.length === 0 ? (
          <div className="bg-white rounded-[2rem] border p-14 text-center">
            <Sparkles className="h-14 w-14 text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900">
              لا توجد عادات بعد
            </h2>
            <p className="text-slate-500 mt-2">
              أضف عادة جديدة وابدأ الالتزام من اليوم.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
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
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-[2rem] border shadow-sm p-5 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-slate-900">
                          {habit.title}
                        </h2>

                        {habit.source === "admin" && (
                          <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                            من الإدارة
                          </span>
                        )}
                      </div>

                      {habit.description && (
                        <p className="text-sm text-slate-500 mt-2 leading-6 line-clamp-2">
                          {habit.description}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => deleteHabit.mutate({ id: habit.id })}
                      className="w-10 h-10 rounded-2xl bg-red-50 hover:bg-red-100 flex items-center justify-center"
                    >
                      <Trash2 className="h-5 w-5 text-red-600" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-5">
                    <div className="rounded-2xl bg-orange-50 p-3 text-center">
                      <Flame className="h-5 w-5 text-orange-500 mx-auto mb-1" />
                      <div className="text-xl font-extrabold">
                        {habit.currentStreak}
                      </div>
                      <div className="text-xs text-slate-500">متتالية</div>
                    </div>

                    <div className="rounded-2xl bg-blue-50 p-3 text-center">
                      <Target className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                      <div className="text-xl font-extrabold">
                        {habit.goalDays}
                      </div>
                      <div className="text-xs text-slate-500">الهدف</div>
                    </div>

                    <div className="rounded-2xl bg-green-50 p-3 text-center">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto mb-1" />
                      <div className="text-xl font-extrabold">
                        {progress}%
                      </div>
                      <div className="text-xs text-slate-500">إنجاز</div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-600">
                        التقدم
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        {habit.currentStreak} / {habit.goalDays}
                      </span>
                    </div>

                    <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.7 }}
                        className={`h-full rounded-full bg-gradient-to-r ${progressColor(
                          progress,
                        )}`}
                      />
                    </div>
                  </div>
<Button
  onClick={() => {
    if (!completed && !doneToday && !markDone.isPending) {
      markDone.mutate({ id: habit.id });
      celebrateDoneToday();
    }
  }}
  disabled={completed || doneToday || markDone.isPending}
  className={`mt-8 w-full h-12 rounded-2xl font-bold transition ${
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
      ? "تم تسجيل إنجاز اليوم"
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
              disabled={createHabit.isPending}
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