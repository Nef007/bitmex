
const request = require('request');
const crypto = require('crypto');

const apiKey = 'cbE3LfNhBlv4C1tSuH2ZNMDu';
const apiSecret = '-fkPgTfQK__WBRW09hTQzTBqZTNnglTtxT84zqjru8c9IQl2';


const verb = 'GET';
const path = '/api/v1/chat/channels';
const expires = Math.round(new Date().getTime() / 1000) + 60; // 1 min in the future
const data = {
    // symbol: "XBTUSD",
    // orderQty: 1,
    // price: 590,
    // ordType: "Limit"
};

// Pre-compute the postBody so we can be sure that we're using *exactly* the same body in the requestBitMAX
// and in the signature. If you don't do this, you might get differently-sorted keys and blow the signature.
const postBody = JSON.stringify(data);

const signature = crypto.createHmac('sha256', apiSecret)
    .update(verb + path + expires + postBody)
    .digest('hex');

const headers = {
    'content-type' : 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    // This example uses the 'expires' scheme. You can also use the 'nonce' scheme. See
    // https://www.bitmex.com/app/apiKeysUsage for more details.
    'api-expires': expires,
    'api-key': apiKey,
    'api-signature': signature
};

const requestOptions = {
    headers: headers,
    // Notice we are using testnet here. Switch to www to query the production site.
    url: 'https://www.bitmex.com' + path,
    method: verb,
    body: postBody
};


module.exports = ( ) => {

  return   request(requestOptions, function(error, response, body) {
        if (error) { return error; }
       return response;
    });


}