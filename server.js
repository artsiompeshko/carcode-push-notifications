let express = require("express");
let webPush = require("web-push");
let atob = require('atob');
let bodyParser = require('body-parser');
let util = require('util');

let app = express();

let subscribers = [];

let VAPID_SUBJECT = 'mailto:peshkoartembsu@gmail.com';
let VAPID_PUBLIC_KEY = 'BPhmk1dRsQFc0m2laCDsoD6MWdkiziFP5OFtF-Pxb2H9r7waH4vQrTySpdio3E_H3V4_GePYHQhSVYt60NFG7DA';
let VAPID_PRIVATE_KEY = 'OyMOokq7w1rNrA2jyAqhxkhFgVvoQ-6k0t9OSKdfXmI';

if (!VAPID_SUBJECT) {
  return console.error('VAPID_SUBJECT environment variable not found.')
} else if (!VAPID_PUBLIC_KEY) {
  return console.error('VAPID_PUBLIC_KEY environment variable not found.')
} else if (!VAPID_PRIVATE_KEY) {
  return console.error('VAPID_PRIVATE_KEY environment variable not found.')
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

webPush.setVapidDetails(
  VAPID_SUBJECT,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

app.use(express.static('static'));

app.get('/status', function (req, res) {
  res.send('Server Running!')
});

app.post('/notify', function (req, res) {
  let message = req.body.message;
  let inquiryId = req.body.inquiryId;
  let senderDealerId = req.body.senderDealerId;
  let senderUserId = req.body.senderUserId;
  let token = req.body.token;

  let subscription = {
    endpoint:
      "https://fcm.googleapis.com/fcm/send/cJkdlTBjW14:APA91bGIsUQtdaZBBAt_SM8ZdVg6Vohnuk9lRs_98U0dDajSFMnzwTAmsHDIFtnPkmD1kR41QZFbdRwPR9YaIwc6joXieBqQpHxzz1nZP9-RYpaWo7D0qFhfolGEo2jlSxsyJESrqUHv",
    expirationTime: null,
    keys: {
      p256dh:
        "BCLxYzXcsROoHbYZdVlHM1VUe3rIZcR89TI9UofDDDNwqLcYyTxBg8C1gaepsE-pcGWT1igiBWfkSfDQMVSPc4U",
      auth: "jRehFokXT_9URATFtXeqPw",
    },
  };

  let payload = JSON.stringify({
    message,
    inquiryId,
    senderDealerId,
    senderUserId,
    token,
  });

  console.log('payload', payload);

  webPush
    .sendNotification(subscription, payload, {})
    .then((response) => {
      console.log("Status : " + util.inspect(response.statusCode));
      console.log("Headers : " + JSON.stringify(response.headers));
      console.log("Body : " + JSON.stringify(response.body));
    })
    .catch((error) => {
      console.log("Status : " + util.inspect(error.statusCode));
      console.log("Headers : " + JSON.stringify(error.headers));
      console.log("Body : " + JSON.stringify(error.body));
    });

  res.send('Notification sent!');
});

app.post('/subscribe', function (req, res) {
  let endpoint = req.body['notificationEndPoint'];
  let publicKey = req.body['publicKey'];
  let auth = req.body['auth'];

  let pushSubscription = {
    endpoint: endpoint,
    keys: {
      p256dh: publicKey,
      auth: auth
    }
  };

  subscribers.push(pushSubscription);

  res.send('Subscription accepted!');
});

app.post('/unsubscribe', function (req, res) {
  let endpoint = req.body['notificationEndPoint'];

  subscribers = subscribers.filter(subscriber => {
    endpoint == subscriber.endpoint
  });

  res.send('Subscription removed!');
});

let PORT = process.env.PORT || 8081;
app.listen(PORT, function () {
  console.log(`push_server listening on port ${PORT}!`)
});
