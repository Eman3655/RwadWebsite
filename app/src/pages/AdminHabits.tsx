import { useState } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/providers/trpc";

import {
  Target,
  Users,
  Send,
  Sparkles,
} from "lucide-react";

export default function AdminHabits() {
  const utils = trpc.useUtils();

  const { data: students = [] } =
    trpc.habit.students.useQuery();

  const createHabit =
    trpc.habit.adminCreate.useMutation({
      onSuccess: () => {
        setTitle("");
        setDescription("");
        setGoalDays(30);

        alert("تم إرسال العادة");
      },
    });

  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goalDays, setGoalDays] = useState(30);

  const handleSend = async () => {
    if (!userId || !title.trim()) return;

    await createHabit.mutateAsync({
      userId: Number(userId),
      title,
      description,
      goalDays,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-5xl mx-auto px-4">

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-extrabold text-slate-900">
            إدارة العادات
          </h1>

          <p className="text-slate-500 mt-3 text-lg">
            إرسال عادات يومية للطلاب ومتابعة الالتزام.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[2rem] border shadow-sm p-8"
        >

          <div className="flex items-center gap-4 mb-8">

            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
              <Target className="h-7 w-7 text-blue-700" />
            </div>

            <div>
              <h2 className="text-2xl font-bold">
                إضافة عادة للطلاب
              </h2>

              <p className="text-slate-500 mt-1">
                اختر الطالب وأرسل له عادة جديدة.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">

            <div>
              <label className="block mb-2 font-semibold text-slate-700">
                الطالب
              </label>

              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full h-14 rounded-2xl border border-slate-200 px-4 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">
                  اختر الطالب
                </option>

                {students.map((student) => (
                  <option
                    key={student.id}
                    value={student.id}
                  >
                    {student.name} - {student.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-slate-700">
                عدد الأيام
              </label>

              <input
                type="number"
                value={goalDays}
                onChange={(e) =>
                  setGoalDays(Number(e.target.value))
                }
                className="w-full h-14 rounded-2xl border border-slate-200 px-4 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

          </div>

          <div className="mt-5">
            <label className="block mb-2 font-semibold text-slate-700">
              عنوان العادة
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: قراءة ورد يومي"
              className="w-full h-14 rounded-2xl border border-slate-200 px-4 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mt-5">
            <label className="block mb-2 font-semibold text-slate-700">
              وصف العادة
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              placeholder="تفاصيل إضافية"
              className="w-full min-h-36 rounded-2xl border border-slate-200 p-4 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleSend}
            disabled={createHabit.isPending}
            className="mt-7 h-14 px-8 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold transition flex items-center gap-2"
          >
            <Send className="h-5 w-5" />

            {createHabit.isPending
              ? "جاري الإرسال..."
              : "إرسال العادة"}
          </button>

        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 grid md:grid-cols-3 gap-5"
        >

          <div className="bg-white rounded-[2rem] border p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <Users className="h-7 w-7 text-blue-700" />
            </div>

            <div className="text-3xl font-extrabold text-slate-900">
              {students.length}
            </div>

            <div className="text-slate-500 mt-2">
              عدد الطلاب
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
              <Target className="h-7 w-7 text-purple-700" />
            </div>

            <div className="text-3xl font-extrabold text-slate-900">
              عادات
            </div>

            <div className="text-slate-500 mt-2">
              متابعة الالتزام
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-7 w-7 text-green-700" />
            </div>

            <div className="text-3xl font-extrabold text-slate-900">
              أهداف
            </div>

            <div className="text-slate-500 mt-2">
              تحفيز الطلاب يوميًا
            </div>
          </div>

        </motion.div>

      </div>
    </div>
  );
}