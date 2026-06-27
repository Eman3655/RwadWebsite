import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { BellRing, Check } from "lucide-react";

function arrayBufferToBase64(buffer: ArrayBuffer | null) {
  if (!buffer) return "";
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export default function EnableNotifications() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  
  const saveSubscription = trpc.notification.savePushSubscription.useMutation();

  const enablePushNotifications = async () => {
    setStatus("loading");

    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      alert("متصفحك لا يدعم الإشعارات");
      setStatus("error");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("error");
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      const vapidKey = import.meta.env.VITE_PUBLIC_VAPID_KEY;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
      });

      const payload = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(subscription.getKey("p256dh")),
          auth: arrayBufferToBase64(subscription.getKey("auth")),
        },
      };

      await saveSubscription.mutateAsync(payload);
      
      setStatus("success");
    } catch (error) {
      console.error("خطأ في تفعيل الإشعارات:", error);
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <Button disabled className="bg-green-100 text-green-700 hover:bg-green-100">
        <Check className="h-4 w-4 ml-2" />
        تم تفعيل الإشعارات بنجاح
      </Button>
    );
  }

  return (
    <Button 
      onClick={enablePushNotifications} 
      disabled={status === "loading"}
      className="bg-blue-600 hover:bg-blue-700"
    >
      <BellRing className="h-4 w-4 ml-2" />
      {status === "loading" ? "جاري التفعيل..." : "تفعيل إشعارات الجوال"}
    </Button>
  );
}