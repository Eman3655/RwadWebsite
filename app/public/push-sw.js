// public/sw.js
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : { title: "مخيم الرواد", message: "لديك إشعار جديد" };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.message,
      icon: "/uploads/logo.png", 
      badge: "/uploads/logo.png", 
      vibrate: [200, 100, 200],
      data: {
        url: data.url || "/"
      }
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});