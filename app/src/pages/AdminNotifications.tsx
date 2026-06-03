import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bell,
  ChevronLeft,
  Send,
  Loader2,
  Info,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

export default function AdminNotifications() {
  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"info" | "success" | "warning">("info");

  const { data: students } = trpc.notification.students.useQuery();

  const sendNotification = trpc.notification.send.useMutation({
    onSuccess: () => {
      setUserId("");
      setTitle("");
      setMessage("");
      setType("info");
      alert("تم إرسال الإشعار بنجاح");
    },
  });

  const selectedStudent = students?.find((s) => String(s.id) === userId);

  const handleSend = () => {
    if (!userId || !title.trim() || !message.trim()) {
      alert("يرجى اختيار الطالب وكتابة العنوان والرسالة");
      return;
    }

    sendNotification.mutate({
      userId: Number(userId),
      title,
      message,
      type,
    });
  };

  const typeOptions = [
    {
      value: "info",
      label: "معلومة",
      icon: Info,
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
    },
    {
      value: "success",
      label: "نجاح",
      icon: CheckCircle,
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
    },
    {
      value: "warning",
      label: "تنبيه",
      icon: AlertTriangle,
      bg: "bg-orange-50",
      text: "text-orange-700",
      border: "border-orange-200",
    },
  ] as const;

  const currentType = typeOptions.find((t) => t.value === type)!;
  const CurrentIcon = currentType.icon;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link to="/dashboard" className="text-slate-500 hover:text-slate-700">
            <ChevronLeft className="h-5 w-5" />
          </Link>

          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">إرسال إشعار</h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-0 shadow-md rounded-3xl">
          <CardContent className="p-6 space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                إرسال إشعار لطالب
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                اختر الطالب، واكتب عنوان الإشعار ومحتواه.
              </p>
            </div>

            <div className="space-y-2">
              <Label>الطالب</Label>
              <Select value={userId} onValueChange={setUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الطالب" />
                </SelectTrigger>
                <SelectContent>
                  {students?.map((student) => (
                    <SelectItem key={student.id} value={String(student.id)}>
                      {student.name} - {student.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>عنوان الإشعار</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: تم إضافة درس جديد"
              />
            </div>

            <div className="space-y-2">
              <Label>محتوى الإشعار</Label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="اكتب رسالة واضحة تظهر للطالب..."
                className="w-full min-h-36 rounded-xl border border-slate-200 p-4 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label>نوع الإشعار</Label>
              <div className="grid grid-cols-3 gap-3">
                {typeOptions.map((option) => {
                  const Icon = option.icon;
                  const active = type === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setType(option.value)}
                      className={`rounded-2xl border p-4 text-center transition ${
                        option.bg
                      } ${option.border} ${
                        active ? "ring-2 ring-blue-500" : "hover:shadow-sm"
                      }`}
                    >
                      <Icon className={`h-6 w-6 mx-auto mb-2 ${option.text}`} />
                      <div className={`font-semibold text-sm ${option.text}`}>
                        {option.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              onClick={handleSend}
              disabled={sendNotification.isPending}
              className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700"
            >
              {sendNotification.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin ml-2" />
              ) : (
                <Send className="h-5 w-5 ml-2" />
              )}
              إرسال الإشعار
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md rounded-3xl h-fit">
          <CardContent className="p-6">
            <h3 className="font-bold text-slate-900 mb-4">معاينة الإشعار</h3>

            <div
              className={`rounded-3xl border p-5 ${currentType.bg} ${currentType.border}`}
            >
              <div className="flex gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center shrink-0">
                  <CurrentIcon className={`h-6 w-6 ${currentType.text}`} />
                </div>

                <div>
                  <div className={`font-bold ${currentType.text}`}>
                    {title || "عنوان الإشعار"}
                  </div>

                  <p className="text-sm text-slate-600 mt-2 leading-6">
                    {message || "سيظهر نص الإشعار هنا قبل الإرسال."}
                  </p>

                  {selectedStudent && (
                    <div className="text-xs text-slate-500 mt-4">
                      إلى: {selectedStudent.name}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 text-sm text-slate-500 leading-6">
              بعد الإرسال سيظهر الإشعار للطالب في جرس الإشعارات الموجود في
              الشريط العلوي.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}