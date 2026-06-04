import { Link } from "react-router";
import { GraduationCap, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">أكاديمية الرواد</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              منصة تعليمية متكاملة تقدم تجربة تعلم فريدة مع أفضل المدربين ومحتوى تعليمي غني
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">روابط سريعة</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm hover:text-blue-400 transition-colors">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link to="/courses" className="text-sm hover:text-blue-400 transition-colors">
                  الكورسات
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-sm hover:text-blue-400 transition-colors">
                  حساب جديد
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold mb-4">التصنيفات</h4>
            <ul className="space-y-2">
              <li className="text-sm text-slate-400">السيرة النبوية</li>
              <li className="text-sm text-slate-400">التفسير</li>
              <li className="text-sm text-slate-400">العقيدة</li>
              <li className="text-sm text-slate-400">الحديث</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">تواصل معنا</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-blue-500" />
                emmoabdelhamid2021@gmail.com
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-blue-500" />
                00972597201505
              </li>
              <li className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-blue-500" />
                فلسطين - غزة
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 text-center text-sm text-slate-500">
          جميع الحقوق محفوظة © 2026 أكاديمية الرواد
        </div>
      </div>
    </footer>
  );
}
