const PUBLIC_KEY = 'BPhmk1dRsQFc0m2laCDsoD6MWdkiziFP5OFtF-Pxb2H9r7waH4vQrTySpdio3E_H3V4_GePYHQhSVYt60NFG7DA';

const pushButton = document.getElementById('push-btn');

const isLocalhost = Boolean(
  window.location.hostname === "localhost" ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === "[::1]" ||
    // 127.0.0.0/8 are considered localhost for IPv4.
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

function initializeUI() {
  pushButton.addEventListener('click', function () {
    pushButton.disabled = true;
    if (isSubscribed) {
      unsubscribeUser();
    } else {
      subscribeUser();
    }
  });

  updateSubscribe();
}

function updateSubscribe() {
  // Set the initial subscription value
  window.swRegistration.pushManager
    .getSubscription()
    .then(function (subscription) {
      isSubscribed = !(subscription === null);

      if (isSubscribed) {
        console.log("User IS subscribed.");
      } else {
        console.log("User is NOT subscribed.");
      }

      updateBtn();
    });
}

function updateBtn() {
  if (Notification.permission === 'denied') {
    pushButton.textContent = 'Push Messaging Blocked.';
    pushButton.disabled = true;
    updateSubscriptionOnServer(null);
    return;
  }

  if (isSubscribed) {
    pushButton.textContent = 'Disable Push Messaging';
  } else {
    pushButton.textContent = 'Enable Push Messaging';
  }

  pushButton.disabled = false;
}

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function subscribeUser() {
  const applicationServerKey = urlB64ToUint8Array(PUBLIC_KEY);
  window.swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey
    })
    .then(function (subscription) {
      console.log('User is subscribed.');

      updateSubscriptionOnServer(subscription);

      isSubscribed = true;

      updateBtn();
    })
    .catch(function (err) {
      console.log('Failed to subscribe the user: ', err);
      updateBtn();
    });
}

function unsubscribeUser() {
  window.swRegistration.pushManager.getSubscription()
    .then(function (subscription) {
      subscription
        .unsubscribe();

      return subscription;
    })
    .then(removeSubscriptionFromServer)
    .finally(function () {
      updateSubscribe();
    });
};

function removeSubscriptionFromServer(subscription) {
  const endpoint = subscription.endpoint;

  const url = isLocalhost ? 'http://localhost:8081/unsubscribe' : '/api/unsubscribe';

  return fetch(url, {
    method: "POST",
    body: JSON.stringify({
      endpoint,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function sendSubscriptionToServer(subscription) {
  const p256dh =subscription.keys.p256dh;
  const auth =subscription.keys.auth;
  const endpoint = subscription.endpoint;

  const url = isLocalhost ? 'http://localhost:8081/subscribe' : '/api/subscribe';

  fetch(url, {
    method: "POST",
    body: JSON.stringify({
      p256dh,
      auth,
      endpoint,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function updateSubscriptionOnServer(subscription) {
  sendSubscriptionToServer(JSON.parse(JSON.stringify(subscription)));

  const subscriptionJson = document.querySelector('.js-subscription-json');

  if (subscription) {
    subscriptionJson.textContent = JSON.stringify(subscription);
  }
}
