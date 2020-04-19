importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

// Note: Ignore the error that Glitch raises about workbox being undefined.
workbox.core.skipWaiting();
workbox.core.clientsClaim();

self.addEventListener('push', function (event) {
  console.log('[Service Worker] Push Received.');
  console.log(`[Service Worker] Push had this data: "${JSON.stringify(event.data.json())}"`);

  const data = event.data.json();
  const title = 'New incoming Message';
  const options = {
    body: data.message,
    icon: 'images/icon.png',
    badge: 'images/badge.png',
    actions: [
      {
        action: 'reply',
        title: 'Reply',
        type: 'text',
        placeholder: 'Type your quick reply here',
      }
    ],
    data,
    requireInteraction: true,
  };

  const notificationPromise = self.registration.showNotification(title, options);
  event.waitUntil(notificationPromise);
});

self.sendReply = function (event) {
  const data = {
    appReplyId: Date.now(),
    body: event.reply,
    inquiryId: event.notification.data.inquiryId,
    senderDealerId: event.notification.data.senderDealerId,
    senderUserId: event.notification.data.senderUserId,
  };

  fetch("https://dev-dsg11-api.carcode.com/carcode/v1/dealer/replies", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "x-auth-token": event.notification.data.token,
      "Content-Type": "application/json",
    },
  });
};

self.addEventListener('notificationclick', function (event) {
  console.log('[Service Worker] Notification click Received.');

  console.log(event);

  event.notification.close();

  if (event.action === 'reply') {
    sendReply(event);
  } else {
    event.waitUntil(
      clients.openWindow('https://www.carcode.com')
    );
  }
});

self.customPaths = [];

const {
  core,
  routing,
  strategies,
  precaching
} = workbox;

precaching.precacheAndRoute([{"revision":"3d0eb82897010abcb4048a0ed955c87d","url":"index.html"},{"revision":"d22d8c9d3f51ada9cea448ee7fa33686","url":"service-worker-custom-install.js"},{"revision":"9de7b8f75135ed763708765d5f3c2d4f","url":"service-worker-push.js"},{"revision":"20b52e679ac429aa46fb2433643d97a4","url":"service-worker-registration.js"}].concat(self.customPaths), {});

routing.registerRoute(
  new RegExp('/'),
  new workbox.strategies.StaleWhileRevalidate()
);
