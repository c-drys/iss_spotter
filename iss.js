// index.js
// logic for fetching the data from each API endpoint

/**
 * Makes a single API request to retrieve the user's IP address.
 * Input:
 *   - A callback (to pass back an error or the IP string)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The IP address as a string (null if error). Example: "162.245.144.188"
 */

const request = require('request');

const nextISSTimesForMyLocation = function(callback) {
  fetchMyIP((error, ip) => {
    if (error) {
      return callback(error, null);
    }

    fetchCoordsByIP(ip, (error, loc) => {
      if (error) {
        return callback(error, null);
      }

      fetchISSFlyOverTimes(loc, (error, nextPasses) => {
        if (error) {
          return callback(error, null);
        }

        callback(null, nextPasses);
      });
    });
  });
};

const fetchMyIP = function(callback) {

  request("https://api.ipify.org?format=json", function(error, response, body) {
  // error can be set if invalid domain, user is offline, etc
    if (error)
      return callback(error, null);

    // if non-200 status, assume server error
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP: ${body}`;
      callback(Error(msg), null);
      return;
    }

    const data = JSON.parse(body);
    callback(null, data['ip']);
  });
};

const fetchCoordsByIP = function(ip, callback) {
  request(`https://ipvigilante.com/json/${ip}`, function(error, response, body) {
    if (error) {
      callback(error, null);
      return;
    }

    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching Coordinates for IP: ${body}`;
      callback(Error(msg), null);
      return;
    }

    const { latitude, longitude } = JSON.parse(body).data;

    callback(null, { latitude, longitude });
  });
};

const fetchISSFlyOverTimes = function(coords, callback) {
  request(`http://api.open-notify.org/iss-pass.json?lat=${coords['latitude']}&lon=${coords['longitude']}`, function(error, response, body) {
    if (error) {
      callback(error, null);
      return;
    }
	
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching passover times: ${body}`;
      callback(Error(msg), null);
      return;
    }
	
    const passes = JSON.parse(body).response;
    callback(null, passes);
  });
};


// module.exports = { fetchMyIP };
// module.exports = { fetchCoordsByIP };
// module.exports = { fetchISSFlyOverTimes };
module.exports = { nextISSTimesForMyLocation };