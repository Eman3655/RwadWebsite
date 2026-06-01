import { Link, useLocation } from "react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  LogOut,
  User,
  LayoutDashboard,
  GraduationCap,
  Award,
} from "lucide-react";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isAdmin = user?.role === "admin";
  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: "/", label: "الرئيسية" },
    { path: "/courses", label: "الكورسات" },
    { path: "/student-dashboard", label: "تقدمي" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">منصة عِلم</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {isAdmin && (
              <Link
                to="/dashboard"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/dashboard")
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                لوحة التحكم
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <Link to="/dashboard">
                    <Button variant="ghost" size="sm" className="text-slate-600">
                      <LayoutDashboard className="h-4 w-4 ml-2" />
                      لوحة التحكم
                    </Button>
                  </Link>
                )}

                <Link to="/certificates">
                  <Button variant="ghost" size="sm" className="text-slate-600">
                    <Award className="h-4 w-4 ml-2" />
                    شهاداتي
                  </Button>
                </Link>

                <Link to="/profile">
                  <Button variant="ghost" size="sm" className="text-slate-600">
                    <User className="h-4 w-4 ml-2" />
                    {user.name}
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 ml-2" />
                  خروج
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-slate-600">
                    تسجيل الدخول
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    حساب جديد
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t bg-white px-4 py-4 space-y-2 animate-fadeIn">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="block px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          {isAuthenticated && (
            <Link
              to="/certificates"
              className="block px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
              onClick={() => setIsOpen(false)}
            >
              <Award className="h-4 w-4 inline ml-2" />
              شهاداتي
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/dashboard"
              className="block px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
              onClick={() => setIsOpen(false)}
            >
              لوحة التحكم
            </Link>
          )}

          {isAuthenticated && user ? (
            <>
              <Link
                to="/profile"
                className="block px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
                onClick={() => setIsOpen(false)}
              >
                <User className="h-4 w-4 inline ml-2" />
                {user.name}
              </Link>

              <button
                className="w-full text-right px-4 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50"
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
              >
                <LogOut className="h-4 w-4 inline ml-2" />
                تسجيل الخروج
              </button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link
                to="/login"
                className="flex-1"
                onClick={() => setIsOpen(false)}
              >
                <Button variant="outline" className="w-full">
                  تسجيل الدخول
                </Button>
              </Link>

              <Link
                to="/register"
                className="flex-1"
                onClick={() => setIsOpen(false)}
              >
                <Button className="w-full bg-blue-600">حساب جديد</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}