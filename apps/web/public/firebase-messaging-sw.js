importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyAhYAQaYz426m6eWZTWKIUVtPM6AAUftKo",
  authDomain: "neuralpay-ai-notify.firebaseapp.com",
  projectId: "neuralpay-ai-notify",
  messagingSenderId: "70963151111",
  appId: "1:70963151111:web:81c7bba7563820a16045a2",
});

const messaging = firebase.messaging();

// public/firebase-messaging-sw.js
messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Background message received:", payload);

  const title =
    payload.notification?.title || payload.data?.title || "New Notification";
  const body = payload.notification?.body || payload.data?.body || "";

  console.log("[SW] Showing notification:", { title, body });

  self.registration.showNotification(title, {
    body,
    // Skip icons for now to eliminate the 404 noise
    tag: payload.data?.relatedId ?? "default",
    data: payload.data,
    requireInteraction: false,
  });
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.actionUrl ?? "/dashboard";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            return client.focus().then(() => client.navigate(url));
          }
        }
        return clients.openWindow(url);
      }),
  );
});
