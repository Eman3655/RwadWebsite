import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Loader2, Download } from "lucide-react";

export default function Certificates() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const { data: certificates, isLoading: certLoading } =
    trpc.certificate.list.useQuery(undefined, {
      enabled: isAuthenticated,
    });

  const markDownloadedMutation =
    trpc.certificate.markDownloaded.useMutation();

  if (isLoading || certLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  const handleOpenCertificate = async (id: number, fileUrl: string) => {
    await markDownloadedMutation.mutateAsync({ id });
    window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="pt-24 pb-10">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-slate-900 mb-6">
            شهاداتي
          </h1>

          {certificates && certificates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificates.map((cert) => (
                <Card key={cert.id} className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-amber-600" />
                      {cert.courseTitle}
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <p className="text-sm text-slate-500 mb-2">
                      الرقم التسلسلي: {cert.serialNumber}
                    </p>

                    <p className="text-sm text-slate-500 mb-4">
                      تاريخ الإصدار:{" "}
                      {cert.issueDate
                        ? new Date(cert.issueDate).toLocaleDateString("ar-EG")
                        : "-"}
                    </p>

                    <Badge
                      className={
                        cert.isDownloaded
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }
                    >
                      {cert.isDownloaded ? "تم فتحها سابقًا" : "جديدة"}
                    </Badge>

                    <div className="mt-5">
                      {cert.fileUrl ? (
                        <Button
                          onClick={() =>
                            handleOpenCertificate(cert.id, cert.fileUrl!)
                          }
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Download className="h-4 w-4 ml-2" />
                          عرض / تحميل الشهادة
                        </Button>
                      ) : (
                        <p className="text-sm text-slate-400">
                          لا يوجد ملف مرفق لهذه الشهادة
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-md">
              <CardContent className="p-10 text-center text-slate-500">
                <Award className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                لا توجد شهادات حتى الآن
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}