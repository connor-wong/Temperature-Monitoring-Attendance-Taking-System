self.addEventListener("push", (event) => {
  const data = event.data.json();
  console.log("New notification", data);
  const options = {
    body: data.body,
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  console.log(
    "[Service Worker] Notification click Received.",
    event.notification.data
  );

  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data));
});
