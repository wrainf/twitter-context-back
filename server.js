const express = require('express');
const dotenv = require('dotenv')
const fetch = require('node-fetch');
const cors = require('cors')

dotenv.config()
const app = express();
const { getSingleWOEID } = require('twitter-woeid');

app.use(cors());
// twitter api needs WOEID to work
function getWOEID(location) {
  country = getSingleWOEID(location)[0].country
  countryID = getSingleWOEID(country)[0].woeid
  return countryID;
}

// turns a string into titleCase
// used to format input string
function titleCase(string) {
  var sentence = string.toLowerCase().split(" ");
  for(var i = 0; i< sentence.length; i++){
     sentence[i] = sentence[i][0].toUpperCase() + sentence[i].slice(1);
  }

  return sentence.join(" ");
}

// returns the trends for a given location
async function getTrends(city) {
  
  try {
    const cityTidy = titleCase(city)
    const woeid = getWOEID(cityTidy);
    console.log(woeid);
    const response = await fetch(`https://api.twitter.com/1.1/trends/place.json?id=${woeid}`, {
      method: 'GET',
      headers: {
        'authorization': `Bearer ${process.env.TWITTER_BEARER}` 
      }
    });
    const trends = await response.json();
    console.log(trends[0].trends)
    return trends[0].trends;
    
  } catch (e) {
    console.log(e, 'ERORR');
    return [];
  }
}

// make call to twitter api based on location parameter in url
app.get("/trends/:location", async (req, res, next) => {
  const trends = await getTrends(req.params.location);
  res.send(trends);
 });

app.listen(3000, () => {
  console.log("Server running on port 3000");
})
