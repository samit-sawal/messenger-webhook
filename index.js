'use strict';

// Imports dependencies and set up http server
const
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json()),// creates express http server
  util = require('util'),
  request = require('request');

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

// Creates the endpoint for our webhook 
app.post('/webhook', (req, res) => {  
 
  let body = req.body;
  console.log('post req.body:' +JSON.stringify(req.body));

  // Checks this is an event from a page subscription
  if (body.object === 'page') {

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {

      // Gets the message. entry.messaging is an array, but 
      // will only ever contain one message, so we get index 0
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);

      var messageData = {
        "messaging_type": "RESPONSE",
        "recipient": {
          "id": entry.messaging[0].sender.id
        },
        "message": {
          "text": "hello, world!"
        }
      };

      setTimeout(function () {callSendAPI(messageData)}, 3000);
    });

    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});

function callSendAPI(messageData) {
  //console.log("Send api-", messageData);

  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: 'EAALE1BqjKvEBALVqcLYoomAzZCG9rNSFzhdowwTWlOK7DKz3iA6sB37cBsZBuNmI7WZBXuF8m6s6gzVlDapoutw21UlQih7KWTWifAC2mIdEgVJqCPqnZCnlaE3mdj4HWZCHcGWsfXBl0vYS5D2TqjZBfTuqFBwgRLgZAZAZA4QBVHwZDZD' },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      if (messageId) {
        console.log("Successfully sent message with id %s to recipient %s",
          messageId, recipientId);
      } else {
        console.log("Successfully called Send API for recipient %s",
          recipientId);
      }
    } else {
      console.log("Failed calling Send API - Error=", error);
      console.log("Failed calling Send API - Response=", response);
      console.log("Failed calling Send API - Body=", body);
      //console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
    }
  });
}

// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {
  
  console.log('get req.query:' +JSON.stringify(req.query));

  // Your verify token. Should be a random string.
  let VERIFY_TOKEN = "samit";
    
  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
    
  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
  
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);      
    }
  }
});
