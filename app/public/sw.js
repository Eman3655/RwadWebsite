self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : { title: "مخيم الرواد", message: "لديك إشعار جديد" };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.message,
      icon: "/icons/icon-192x192.png", 
      badge: "/icons/badge-72x72.png",
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