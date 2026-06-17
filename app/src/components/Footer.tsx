import { Link } from "react-router";
import { GraduationCap, Mail, Phone, MapPin} from "lucide-react";

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
              <span className="text-xl font-bold text-white">مخيم الرواد</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              منصة تعليمية متكاملة تقدم تجربة تعلم فريدة مع محتوى تعليمي غني
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
                  البرامج
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
                <li>
                  <a
                    href="https://t.me/+z5xw_9EolMJiMmU0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm hover:text-blue-400"
                    aria-label="قناتنا على تيليجرام"
                  >
                  <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="20" height="20" fill="currentColor" 
                  className="bi bi-telegram" viewBox="0 0 16 16"
                  >
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.287 5.906q-1.168.486-4.666 2.01-.567.225-.595.442c-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294q.39.01.868-.32 3.269-2.206 3.374-2.23c.05-.012.12-.026.166.016s.042.12.037.141c-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8 8 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629q.14.092.27.187c.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.4 1.4 0 0 0-.013-.315.34.34 0 0 0-.114-.217.53.53 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09"/>
                  </svg>
                    <span>قناتنا على تيليجرام</span>
                  </a>
                </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 text-center text-sm text-slate-500">
          جميع الحقوق محفوظة © 2026 مخيم الرواد
        </div>
      </div>
    </footer>
  );
}
