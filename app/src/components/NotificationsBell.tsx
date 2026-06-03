import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  CheckCheck,
  Info,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
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
    border: "border-blue-100",
  },
  success: {
    icon: CheckCircle,
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-100",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-100",
  },
};

export default function NotificationsBell() {
  const utils = trpc.useUtils();
  const [selectedNotification, setSelectedNotification] = useState<any>(null);

  const { data: notifications } = trpc.notification.list.useQuery(undefined, {
    refetchInterval: 30000,
  });

  const { data: unreadCount } = trpc.notification.unreadCount.useQuery(
    undefined,
    { refetchInterval: 30000 },
  );

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

  const latestNotifications = notifications?.slice(0, 5) ?? [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full hover:bg-blue-50"
        >
          <Bell className="h-5 w-5 text-slate-600" />

          {!!unreadCount && unreadCount > 0 && (
            <span className="absolute -top-1 -left-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[11px] flex items-center justify-center border-2 border-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[360px] p-0 overflow-hidden rounded-3xl shadow-xl border-slate-100"
      >
        <div className="p-4 border-b bg-gradient-to-l from-blue-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900">الإشعارات</div>
              <div className="text-xs text-slate-500 mt-1">
                {unreadCount ? `${unreadCount} إشعار غير مقروء` : "لا توجد إشعارات جديدة"}
              </div>
            </div>

            {!!unreadCount && unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAllRead.mutate()}
                className="text-blue-700 hover:bg-blue-100"
              >
                <CheckCheck className="h-4 w-4 ml-1" />
                قراءة الكل
              </Button>
            )}
          </div>
        </div>

        <div className="max-h-[380px] overflow-y-auto bg-white">
          {latestNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <Bell className="h-7 w-7 text-slate-400" />
              </div>
              <div className="font-medium text-slate-700">لا توجد إشعارات</div>
              <div className="text-sm text-slate-400 mt-1">
                ستظهر هنا التنبيهات المهمة الخاصة بك.
              </div>
            </div>
          ) : (
            latestNotifications.map((n) => {
              const style =
                typeStyle[n.type as keyof typeof typeStyle] ?? typeStyle.info;
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
                  className={`w-full text-right p-4 border-b border-slate-50 hover:bg-slate-50 transition ${
                    !n.isRead ? "bg-blue-50/40" : "bg-white"
                  }`}
                >
                  <div className="flex gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 ${style.bg} ${style.border}`}
                    >
                      <Icon className={`h-5 w-5 ${style.text}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold text-sm text-slate-900 line-clamp-1">
                          {n.title}
                        </div>

                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                        )}
                      </div>

                      <div className="text-sm text-slate-500 mt-1 line-clamp-2 leading-6">
                        {n.message}
                      </div>

                      <div className="text-xs text-slate-400 mt-2">
                        {new Date(n.createdAt).toLocaleString("ar-EG")}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <Link to="/notifications">
          <Button
            variant="ghost"
            className="w-full rounded-none h-12 border-t bg-slate-50 hover:bg-blue-50 text-blue-700"
          >
            عرض كل الإشعارات
            <ExternalLink className="h-4 w-4 mr-2" />
          </Button>
        </Link>
      </DropdownMenuContent>
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
      
    </DropdownMenu>

    
  );
}