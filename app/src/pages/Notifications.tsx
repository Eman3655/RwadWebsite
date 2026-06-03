import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Bell,
  CheckCheck,
  Info,
  CheckCircle,
  AlertTriangle,
  ChevronLeft,
  Loader2,
} from "lucide-react";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const typeStyle = {
  info: {
    icon: Info,
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  success: {
    icon: CheckCircle,
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
  },
};

export default function Notifications() {
  const utils = trpc.useUtils();

  const [selectedNotification, setSelectedNotification] = useState<any>(null);

  const { data: notifications, isLoading } =
    trpc.notification.list.useQuery();

  const { data: unreadCount } =
    trpc.notification.unreadCount.useQuery();

  const markAsRead = trpc.notification.markAsRead.useMutation({
    onSuccess: () => {
      utils.notification.list.invalidate();
      utils.notification.unreadCount.invalidate();
    },
  });

  const markAllRead = trpc.notification.markAllRead.useMutation({
    onSuccess: () => {
      utils.notification.list.invalidate();
      utils.notification.unreadCount.invalidate();
    },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="pt-24 pb-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                <Link to="/" className="hover:text-blue-600">
                  الرئيسية
                </Link>

                <ChevronLeft className="h-4 w-4" />

                <span>الإشعارات</span>
              </div>

              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                <Bell className="h-7 w-7 text-blue-600" />
                إشعاراتي
              </h1>
            </div>

            {!!unreadCount && unreadCount > 0 && (
              <Button
                variant="outline"
                onClick={() => markAllRead.mutate()}
              >
                <CheckCheck className="h-4 w-4 ml-2" />
                تعليم الكل كمقروء
              </Button>
            )}
          </div>

          <Card className="border-0 shadow-md rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="py-16 flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : !notifications || notifications.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <Bell className="h-8 w-8 text-slate-400" />
                  </div>

                  <div className="text-lg font-semibold text-slate-700">
                    لا توجد إشعارات
                  </div>

                  <div className="text-sm text-slate-400 mt-2">
                    ستظهر هنا جميع التنبيهات والإشعارات الخاصة بك.
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {notifications.map((n) => {
                    const style =
                      typeStyle[
                        n.type as keyof typeof typeStyle
                      ] ?? typeStyle.info;

                    const Icon = style.icon;

                    return (
                      <button
                        key={n.id}
                        onClick={() => {
                          setSelectedNotification(n);

                          if (!n.isRead) {
                            markAsRead.mutate({ id: n.id });
                          }
                        }}
                        className={`w-full text-right p-5 transition hover:bg-slate-50 ${
                          !n.isRead
                            ? "bg-blue-50/40"
                            : "bg-white"
                        }`}
                      >
                        <div className="flex gap-4">
                          <div
                            className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${style.bg} ${style.border}`}
                          >
                            <Icon
                              className={`h-6 w-6 ${style.text}`}
                            />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <div className="font-bold text-slate-900">
                                {n.title}
                              </div>

                              {!n.isRead && (
                                <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                                  جديد
                                </span>
                              )}
                            </div>

                            <div className="text-sm text-slate-600 mt-2 leading-6">
                              {n.message}
                            </div>

                            <div className="text-xs text-slate-400 mt-3">
                              {new Date(
                                n.createdAt,
                              ).toLocaleString("ar-EG")}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Dialog
  open={!!selectedNotification}
  onOpenChange={() => setSelectedNotification(null)}
>
  <DialogContent className="max-w-lg rounded-3xl">
    {selectedNotification && (
      <>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Bell className="h-5 w-5 text-blue-600" />
            {selectedNotification.title}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <div className="text-slate-700 leading-8 text-base whitespace-pre-wrap">
            {selectedNotification.message}
          </div>

          <div className="mt-6 pt-4 border-t text-sm text-slate-400">
            {new Date(
              selectedNotification.createdAt,
            ).toLocaleString("ar-EG")}
          </div>
        </div>
      </>
    )}
  </DialogContent>
</Dialog>

    </div>
  );
}