import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { Award, ChevronLeft, Loader2 } from "lucide-react";

export default function AdminCertificates() {
  const { data: certificates, isLoading } =
    trpc.certificate.adminList.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="pt-24 pb-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-6">
            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4 ml-1" />
                رجوع
              </Button>
            </Link>

            <h1 className="text-2xl font-bold text-slate-900">
              إدارة الشهادات
            </h1>
          </div>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600" />
                جميع الشهادات
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4">الطالب</th>
                      <th className="text-right py-3 px-4">البرنامج</th>
                      <th className="text-right py-3 px-4">الرقم التسلسلي</th>
                      <th className="text-right py-3 px-4">تاريخ الإصدار</th>
                      <th className="text-right py-3 px-4">الحالة</th>
                    </tr>
                  </thead>

                  <tbody>
                    {certificates?.map((cert) => (
                      <tr key={cert.id} className="border-b hover:bg-slate-50">
                        <td className="py-3 px-4 font-medium">
                          {cert.studentName}
                        </td>

                        <td className="py-3 px-4">
                          {cert.courseTitle}
                        </td>

                        <td className="py-3 px-4 text-sm text-slate-500">
                          {cert.serialNumber}
                        </td>

                        <td className="py-3 px-4 text-sm text-slate-500">
                          {cert.issueDate
                            ? new Date(cert.issueDate).toLocaleDateString("ar-EG")
                            : "-"}
                        </td>

                        <td className="py-3 px-4">
                          <Badge
                            className={
                              cert.isDownloaded
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }
                          >
                            {cert.isDownloaded ? "تم التحميل" : "لم تُحمّل"}
                          </Badge>
                        </td>
                      </tr>
                    ))}

                    {(!certificates || certificates.length === 0) && (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-8 text-center text-slate-400"
                        >
                          لا توجد شهادات حتى الآن
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
    </div>
  );
}