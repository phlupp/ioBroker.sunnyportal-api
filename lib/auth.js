'use strict';

const request = require('request');

function authRequest(clientID, client_secret) {

  let param = "client_id=" + clientID + "&client_secret=" + client_secret + "&response_type=code&redirect_uri=localhost&state=ioBroker";

  return new Promise((resolve, reject) => {

    request({
        method: 'POST',
        url: 'https://sandbox.smaapis.de/oauth2/auth',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: param
      },

      function (error, response, body) {

        if (!error && response.statusCode != 200) {
          let statusPost = response.statusCode;
          reject(statusPost);
        } else {

          let obj = JSON.parse(body);
          let authCode = obj.code;
          let state = obj.state;
          resolve([authCode, state]);

        }

      }

    );
  });
}

module.exports.authRequest = authRequest;
