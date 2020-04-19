let express = require("express");
let webPush = require("web-push");
let bodyParser = require('body-parser');
let util = require('util');
let cors = require('cors');

let app = express();

app.use(
  cors({
    origin: '*',
    optionsSuccessStatus: 200,
  })
);

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

  let payload = JSON.stringify({
    message,
    inquiryId,
    senderDealerId,
    senderUserId,
    token,
  });

  console.log('payload', payload);

  for (let subscription of subscribers) {
    console.log('subscription', subscription);

    webPush
      .sendNotification(subscription, payload, {})
      .then((response) => {
        console.log("Status : " + util.inspect(response.statusCode));
        console.log("Headers : " + JSON.stringify(response.headers));
        console.log("Body : " + JSON.stringify(response.body));
      })
      .catch((error) => {
        console.error(error);

        console.log("Status : " + util.inspect(error.statusCode));
        console.log("Headers : " + JSON.stringify(error.headers));
        console.log("Body : " + JSON.stringify(error.body));
      });
  }

  res.send('Notification sent!');
});

app.post('/subscribe', function (req, res) {
  let endpoint = req.body["endpoint"];
  let p256dh = req.body['p256dh'];
  let auth = req.body['auth'];

  let pushSubscription = {
    endpoint,
    keys: {
      p256dh,
      auth
    }
  };

  subscribers.push(pushSubscription);

  res.send('Subscription accepted!');
});

app.post('/unsubscribe', function (req, res) {
  let endpoint = req.body["endpoint"];

  subscribers = subscribers.filter(subscriber => {
    endpoint == subscriber.endpoint
  });

  res.send('Subscription removed!');
});

let PORT = process.env.PORT || 8081;
app.listen(PORT, function () {
  console.log(`push_server listening on port ${PORT}!`)
});
