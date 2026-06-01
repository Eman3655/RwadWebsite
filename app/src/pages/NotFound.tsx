import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Home, AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-50 px-4">
      <div className="text-center">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-12 w-12 text-blue-600" />
        </div>
        <h1 className="text-6xl font-bold text-slate-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-slate-600 mb-4">
          الصفحة غير موجودة
        </h2>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">
          الصفحة التي تبحث عنها غير موجودة أو قد تم نقلها. يمكنك العودة للصفحة
          الرئيسية.
        </p>
        <Link to="/">
          <Button className="bg-blue-600 hover:bg-blue-700" size="lg">
            <Home className="h-5 w-5 ml-2" />
            العودة للرئيسية
          </Button>
        </Link>
      </div>
    </div>
  );
}
