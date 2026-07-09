import { Link, useLocation } from "react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import NotificationsBell from "@/components/NotificationsBell";
import {
  Menu,
  X,
  LogOut,
  User,
  LayoutDashboard,
  GraduationCap,
  Award,
  Target,
  Home,
  BookOpen,
  TrendingUp,
} from "lucide-react";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isAdmin = user?.role === "admin";

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const closeMenu = () => setIsOpen(false);

  const publicLinks = [
    { path: "/", label: "الرئيسية", icon: Home },
    { path: "/courses", label: "البرامج", icon: BookOpen },
  ];

  const studentLinks =
    isAuthenticated && !isAdmin
      ? [
          { path: "/student-dashboard", label: "تقدمي", icon: TrendingUp },
          { path: "/habits", label: "وردي", icon: Target },
          { path: "/certificates", label: "شهاداتي", icon: Award },
        ]
      : [];

  const adminLinks =
    isAuthenticated && isAdmin
      ? [{ path: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard }]
      : [];

  const navLinks = [...publicLinks, ...studentLinks, ...adminLinks];

  const handleLogout = () => {
    logout();
    closeMenu();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 shrink-0">
          <img
              src="/logo.png"
              alt="Logo"
              className="w-10 h-10 rounded-full object-cover"
            />


            <div className="leading-tight">
              <div className="text-lg font-extrabold text-slate-900">
                مخيم الرواد
              </div>
              <div className="hidden sm:block text-xs text-slate-400">
                منصة تعليمية متكاملة
              </div>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold transition ${
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated && <NotificationsBell />}

            {isAuthenticated && user ? (
              <>
                <Link to="/profile">
                  <Button
                    variant="ghost"
                    className={`rounded-2xl px-2 pr-2 pl-4 ${
                      isActive("/profile")
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </div>

                      <span className="max-w-[120px] truncate">
                        {user.name}
                      </span>
                    </div>
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="rounded-2xl text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 ml-2" />
                  خروج
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" className="rounded-2xl text-slate-600">
                    تسجيل الدخول
                  </Button>
                </Link>

                <Link to="/register">
                  <Button className="rounded-2xl bg-blue-700 hover:bg-blue-800">
                    حساب جديد
                  </Button>
                </Link>
              </div>
            )}
          </div>

<div className="lg:hidden flex items-center gap-2">
  {isAuthenticated && <NotificationsBell />}

  <button
    className="p-2 rounded-2xl hover:bg-slate-100"
    onClick={() => setIsOpen((prev) => !prev)}
  >
    {isOpen ? (
      <X className="h-6 w-6 text-slate-700" />
    ) : (
      <Menu className="h-6 w-6 text-slate-700" />
    )}
  </button>
</div>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white shadow-lg">
          <div className="px-4 py-4 space-y-2">
            {isAuthenticated && user && (
              <Link
                to="/profile"
                onClick={closeMenu}
                className="flex items-center gap-3 p-3 rounded-3xl bg-slate-50 border border-slate-100 mb-3"
              >
                <div className="w-11 h-11 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="font-bold text-slate-900 truncate">
                    {user.name}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {user.email}
                  </div>
                </div>
              </Link>
            )}


            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={closeMenu}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition ${
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}

            {isAuthenticated && user ? (
              <button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-red-500 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                تسجيل الخروج
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link to="/login" onClick={closeMenu}>
                  <Button variant="outline" className="w-full rounded-2xl">
                    تسجيل الدخول
                  </Button>
                </Link>

                <Link to="/register" onClick={closeMenu}>
                  <Button className="w-full rounded-2xl bg-blue-700 hover:bg-blue-800">
                    حساب جديد
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}