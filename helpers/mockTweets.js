const fs = require('fs');
const path = require('path');

function getMockTweetsByLocation(locationName) {
  const filePath = path.join(__dirname, '..', 'data', 'mockTweets.json');
  const raw = fs.readFileSync(filePath);
  const tweets = JSON.parse(raw);
  return tweets.filter(tweet => tweet.location_name.toLowerCase() === locationName.toLowerCase());
}

module.exports = {
  getMockTweetsByLocation
};
