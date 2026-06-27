import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import {
  BookOpen,
  Award,
  Clock,
  TrendingUp,
  CheckCircle,
  Loader2,
  GraduationCap,
  Pencil,
  Save,
  X,
  Camera,
  Upload,
  Mail,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import EnableNotifications from "@/components/EnableNotifications";

export default function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const utils = trpc.useUtils();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const { data: myCourses } = trpc.course.myCourses.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: myCertificates } = trpc.certificate.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const updateProfile = trpc.auth.updateProfile.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
      setEditing(false);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    navigate("/login");
    return null;
  }

  // ❌ تم حذف الكود من هنا لأن مكانه خطأ

  const handleAvatarUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);

    setUploadingAvatar(true);

    try {
      const res = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Upload failed");
      }

      setAvatar(data.url);
    } catch (error) {
      console.error(error);
      alert("فشل رفع الصورة");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const startEdit = () => {
    setName(user.name || "");
    setAvatar(user.avatar || "");
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setName("");
    setAvatar("");
  };

  const saveProfile = () => {
    if (!name.trim()) return;

    updateProfile.mutate({
      name: name.trim(),
      avatar: avatar.trim() || null,
    });
  };

  const totalCourses = myCourses?.length ?? 0;

  const completedCourses =
    myCourses?.filter((course) => course.status === "completed").length ?? 0;

  const avgProgress =
    totalCourses > 0
      ? Math.round(
          (myCourses?.reduce(
            (sum, course) => sum + (course.progress ?? 0),
            0,
          ) ?? 0) / totalCourses,
        )
      : 0;

  const shownAvatar = editing ? avatar : user.avatar;
  const shownName = editing ? name : user.name;

  const roleLabel =
    user.role === "admin" ? "مدير" : user.role === "teacher" ? "مدرب" : "طالب";

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <Card className="border-0 shadow-sm rounded-[2rem] mb-8 overflow-hidden">
            <CardContent className="p-0">
              <div className="relative overflow-hidden bg-gradient-to-br from-[#E5F0FF] via-white to-[#F3E8FF] p-6 md:p-8">
                <div className="absolute -top-20 -left-16 h-64 w-64 rounded-full bg-blue-200/40 blur-3xl" />
                <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-purple-200/40 blur-3xl" />

                <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
                  <div className="relative shrink-0">
                    <div className="w-28 h-28 md:w-32 md:h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-4xl font-bold overflow-hidden border-4 border-white shadow-md">
                      {shownAvatar ? (
                        <img
                          src={shownAvatar}
                          alt={shownName || "profile"}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        shownName?.charAt(0).toUpperCase() ?? "U"
                      )}
                    </div>

                    {editing && (
                      <div className="absolute -bottom-1 -left-1 w-11 h-11 rounded-full bg-blue-700 text-white flex items-center justify-center shadow-lg border-4 border-white">
                        <Camera className="h-5 w-5" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 text-center lg:text-right">
                    {editing ? (
                      <div className="max-w-xl space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            الاسم
                          </label>
                          <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="اسم المستخدم"
                            className="h-12 rounded-2xl bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            صورة البروفايل
                          </label>

                          <label className="flex items-center justify-center gap-2 h-12 rounded-2xl bg-white border border-slate-200 cursor-pointer hover:bg-slate-50 transition">
                            <Upload className="h-5 w-5 text-blue-700" />
                            <span className="text-sm font-semibold text-slate-700">
                              اختر صورة من الجهاز
                            </span>

                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleAvatarUpload(file);
                              }}
                            />
                          </label>

                          {uploadingAvatar && (
                            <div className="flex items-center justify-center lg:justify-start gap-2 text-sm text-blue-600 mt-3">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              جاري رفع الصورة...
                            </div>
                          )}

                          {avatar && !uploadingAvatar && (
                            <div className="flex items-center justify-center lg:justify-start gap-3 mt-3">
                              <img
                                src={avatar}
                                alt="preview"
                                className="w-14 h-14 rounded-full object-cover border"
                              />
                              <span className="text-sm text-green-600">
                                تم تجهيز الصورة للحفظ
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
                          {user.name}
                        </h1>

                        <div className="flex items-center justify-center lg:justify-start gap-2 text-slate-500 mt-2">
                          <Mail className="h-4 w-4" />
                          <span>{user.email}</span>
                        </div>
                      </>
                    )}

                    <div className="flex items-center gap-2 mt-4 justify-center lg:justify-start">
                      <Badge className="bg-blue-100 text-blue-700 rounded-full px-3 py-1">
                        <ShieldCheck className="h-3 w-3 ml-1" />
                        {roleLabel}
                      </Badge>

                      {user.isActive && (
                        <Badge className="bg-green-100 text-green-700 rounded-full px-3 py-1">
                          <CheckCircle className="h-3 w-3 ml-1" />
                          نشط
                        </Badge>
                      )}
                    </div>

                    {!editing && (
                      <div className="mt-4 flex justify-center lg:justify-start">
                        <EnableNotifications />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center lg:justify-end gap-2">
                    {editing ? (
                      <>
                        <Button
                          onClick={saveProfile}
                          disabled={
                            updateProfile.isPending ||
                            uploadingAvatar ||
                            !name.trim()
                          }
                          className="rounded-2xl bg-blue-700 hover:bg-blue-800"
                        >
                          {updateProfile.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin ml-2" />
                          ) : (
                            <Save className="h-4 w-4 ml-2" />
                          )}
                          حفظ
                        </Button>

                        <Button
                          variant="outline"
                          onClick={cancelEdit}
                          className="rounded-2xl bg-white"
                        >
                          <X className="h-4 w-4 ml-2" />
                          إلغاء
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={startEdit}
                        variant="outline"
                        className="rounded-2xl bg-white"
                      >
                        <Pencil className="h-4 w-4 ml-2" />
                        تعديل الملف
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                icon: BookOpen,
                label: "برامجي",
                value: totalCourses,
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                icon: CheckCircle,
                label: "مكتملة",
                value: completedCourses,
                color: "text-green-600",
                bg: "bg-green-50",
              },
              {
                icon: TrendingUp,
                label: "متوسط التقدم",
                value: `${avgProgress}%`,
                color: "text-purple-600",
                bg: "bg-purple-50",
              },
              {
                icon: Award,
                label: "شهاداتي",
                value: myCertificates?.length ?? 0,
                color: "text-amber-600",
                bg: "bg-amber-50",
              },
            ].map((stat) => {
              const Icon = stat.icon;

              return (
                <Card
                  key={stat.label}
                  className="border-0 shadow-sm rounded-3xl hover:shadow-md transition"
                >
                  <CardContent className="p-5">
                    <div
                      className={`${stat.bg} w-12 h-12 rounded-2xl flex items-center justify-center mb-4`}
                    >
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>

                    <div className="text-3xl font-extrabold text-slate-900">
                      {stat.value}
                    </div>

                    <div className="text-sm text-slate-500 mt-1">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-sm rounded-[2rem]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-extrabold text-slate-900">
                        برامجي
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">
                        تابع تقدمك في البرامج المسجل بها.
                      </p>
                    </div>

                    <Link to="/courses">
                      <Button variant="outline" className="rounded-2xl bg-white">
                        تصفح البرامج المتاحة
                      </Button>
                    </Link>
                  </div>

                  {myCourses && myCourses.length > 0 ? (
                    <div className="space-y-4">
                      {myCourses.map((course) => (
                        <Card
                          key={course.id}
                          className="border border-slate-100 shadow-sm rounded-3xl hover:shadow-md transition"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600">
                                {course.image ? (
                                  <img
                                    src={course.image}
                                    alt={course.title}
                                    loading="lazy"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <BookOpen className="h-9 w-9 text-white" />
                                  </div>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <Link to={`/courses/${course.id}`}>
                                      <h3 className="font-bold text-slate-900 line-clamp-1 hover:text-blue-700">
                                        {course.title}
                                      </h3>
                                    </Link>

                                    <p className="text-sm text-slate-500 line-clamp-1 mt-1">
                                      {course.description || "لا يوجد وصف"}
                                    </p>
                                  </div>

                                  <Badge
                                    className={
                                      course.status === "completed"
                                        ? "bg-green-100 text-green-700 rounded-full"
                                        : course.status === "active"
                                          ? "bg-blue-100 text-blue-700 rounded-full"
                                          : "bg-red-100 text-red-700 rounded-full"
                                    }
                                  >
                                    {course.status === "completed"
                                      ? "مكتمل"
                                      : course.status === "active"
                                        ? "نشط"
                                        : "متوقف"}
                                  </Badge>
                                </div>

                                <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {course.duration} ساعة
                                  </span>

                                  <span className="flex items-center gap-1">
                                    <BookOpen className="h-4 w-4" />
                                    {course.totalLessons} درس
                                  </span>
                                </div>

                                <div className="mt-4">
                                  <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-500">
                                      التقدم
                                    </span>
                                    <span className="font-bold text-blue-700">
                                      {course.progress ?? 0}%
                                    </span>
                                  </div>

                                  <Progress value={course.progress ?? 0} />
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="p-10 text-center text-slate-500">
                      <GraduationCap className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                      <p className="mb-4">لم تسجل في أي برنامج بعد</p>

                      <Link to="/courses">
                        <Button className="bg-blue-700 hover:bg-blue-800 rounded-2xl">
                          استكشف البرامج المتاحة
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="border-0 shadow-sm rounded-[2rem]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-extrabold text-slate-900">
                        شهاداتي
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">
                        آخر الشهادات التي حصلت عليها.
                      </p>
                    </div>
                  </div>

                  {myCertificates && myCertificates.length > 0 ? (
                    <div className="space-y-3">
                      {myCertificates.slice(0, 4).map((cert) => (
                        <Card
                          key={cert.id}
                          className="border border-slate-100 rounded-3xl shadow-sm"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                                <Award className="h-6 w-6 text-white" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-slate-900 line-clamp-1">
                                  {cert.courseTitle}
                                </h3>

                                <p className="text-xs text-slate-500 mt-1">
                                  {cert.serialNumber}
                                </p>

                                <p className="text-xs text-slate-400 mt-1">
                                  {cert.issueDate
                                    ? new Date(
                                        cert.issueDate,
                                      ).toLocaleDateString("ar-EG")
                                    : "-"}
                                </p>

                                {cert.fileUrl && (
                                  <a
                                    href={cert.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="mt-3 rounded-2xl bg-white"
                                    >
                                      عرض الشهادة
                                      <ArrowLeft className="h-4 w-4 mr-1" />
                                    </Button>
                                  </a>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      <Link to="/certificates">
                        <Button
                          variant="outline"
                          className="w-full mt-3 rounded-2xl bg-white"
                        >
                          عرض كل الشهادات
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="rounded-3xl bg-slate-50 p-8 text-center text-slate-400">
                      <Award className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                      لا توجد شهادات بعد
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}