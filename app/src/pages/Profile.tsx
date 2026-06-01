import { Link, useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

export default function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const { data: myCourses } = trpc.course.myCourses.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: myCertificates } = trpc.certificate.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    navigate("/login");
    return null;
  }

  const totalCourses = myCourses?.length ?? 0;
  const completedCourses = myCourses?.filter((c) => c.status === "completed").length ?? 0;
  const avgProgress =
    totalCourses > 0
      ? Math.round(
          (myCourses?.reduce((sum, c) => sum + (c.progress ?? 0), 0) ?? 0) / totalCourses,
        )
      : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="pt-20 pb-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <Card className="border-0 shadow-lg mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    user.name?.charAt(0).toUpperCase() ?? "U"
                  )}
                </div>
                <div className="text-center md:text-right flex-1">
                  <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
                  <p className="text-slate-500">{user.email}</p>
                  <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
                    <Badge className="bg-blue-100 text-blue-700">
                      {user.role === "admin"
                        ? "مدير"
                        : user.role === "teacher"
                          ? "مدرب"
                          : "طالب"}
                    </Badge>
                    {user.isActive && (
                      <Badge className="bg-green-100 text-green-700">
                        <CheckCircle className="h-3 w-3 ml-1" />
                        نشط
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              {
                icon: BookOpen,
                label: "كورساتي",
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
            ].map((stat, i) => (
              <Card key={i} className="border-0 shadow-md">
                <CardContent className="p-4 text-center">
                  <div
                    className={`${stat.bg} w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3`}
                  >
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-500">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* My Courses */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">كورساتي</h2>
            {myCourses && myCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myCourses.map((course) => (
                  <Card key={course.id} className="border-0 shadow-md">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                          <BookOpen className="h-8 w-8 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link to={`/courses/${course.id}`}>
                            <h3 className="font-bold text-slate-900 line-clamp-1 hover:text-blue-600 transition-colors">
                              {course.title}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {course.duration} ساعة
                            </span>
                            <Badge
                              className={
                                course.status === "completed"
                                  ? "bg-green-100 text-green-700"
                                  : course.status === "active"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-red-100 text-red-700"
                              }
                            >
                              {course.status === "completed"
                                ? "مكتمل"
                                : course.status === "active"
                                  ? "نشط"
                                  : "متوقف"}
                            </Badge>
                          </div>
                          <div className="mt-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span>التقدم</span>
                              <span>{course.progress}%</span>
                            </div>
                            <Progress value={course.progress ?? 0} className="h-2" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-md">
                <CardContent className="p-8 text-center text-slate-500">
                  <GraduationCap className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p className="mb-4">لم تسجل في أي كورس بعد</p>
                  <Link to="/courses">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      استكشف الكورسات
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

{/* Certificates */}
{myCertificates && myCertificates.length > 0 && (
  <div>
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-slate-900">شهاداتي</h2>

      <Link to="/certificates">
        <Button variant="outline">عرض كل الشهادات</Button>
      </Link>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {myCertificates.slice(0, 4).map((cert) => (
        <Card key={cert.id} className="border-0 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shrink-0">
                <Award className="h-7 w-7 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 line-clamp-1">
                  {cert.courseTitle}
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  الرقم التسلسلي: {cert.serialNumber}
                </p>

                <p className="text-sm text-slate-400 mt-1">
                  تاريخ الإصدار:{" "}
                  {cert.issueDate
                    ? new Date(cert.issueDate).toLocaleDateString("ar-EG")
                    : "-"}
                </p>

                {cert.fileUrl && (
                  <a href={cert.fileUrl} target="_blank" rel="noreferrer">
                    <Button size="sm" className="mt-3">
                      عرض / تحميل
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
)}
        </div>
      </div>

      <Footer />
    </div>
  );
}
