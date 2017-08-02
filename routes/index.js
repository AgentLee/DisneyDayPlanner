var express     = require('express');
var router      = express.Router();
var themeparks  = require('themeparks');
var json        = require('jsonfile');
var fs          = require('fs');
var request       = require('request');
var cheerio       = require('cheerio');

var weather;
var url = "https://weather.com/weather/today/l/USFL0615:1:US";
request(url, function(err, resp, body) {
  var $ = cheerio.load(body);

  // Gets you 5 day forecast
  var temp      = $('.today-daypart-temp');
  // Only want the first temperature
  var tempText  = temp.text().substring(0, 3);

  weather = tempText;
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Walt Disney World Wait Times', weather : weather });
});

// This gets triggered when the user clicks on a button
// for a park. The park contains an id and value that
// differentiates the four parks. Each park has their
// own redirect page. 
// Future plans is to pass in the park variable into
// the hbs file so that I only have to reroute once.
router.post('/park/submit', function(req, res, next)
{
  var park = req.body.id;

  switch(park)
  {
    case "MagicKingdom":
      console.log("MK");
      res.redirect('/magickingdom');   
      break;
    case "EPCOT":
      console.log("EPCOT");
      res.redirect('/epcot');   
      break;
    case "HollywoodStudios":
      console.log("HollywoodStudios");
      res.redirect('/hollywoodstudios');   
      break;
    case "AnimalKingdom":
      console.log("AnimalKingdom");
      res.redirect('/animalkingdom');   
      break;
    default:
      // TODO: Add 404
      break;
  }
});

// MK
router.get('/magickingdom', function(req, res, next) 
{
  var ride_names  = [];
  var wait_times  = [];

  var mk       = new themeparks.Parks.WaltDisneyWorldMagicKingdom();
  var mk_file  = './mk/waits.json';
  var mk_rides = {};

  mk.GetWaitTimes(function(err, rides) 
  {
    var waittimes = [];
    var ridenames = [];
    if (err) 
      return console.error(err);

    // print each wait time
    for(var i=0, ride; ride=rides[i++];) {
        // console.log(ride.name + ": " + ride.waitTime + " minutes wait");
        
        var name = ride.name;
        if( name.includes('Horses') ||
            name.includes('Mickey\'s Very Merry Christmas Party') ||
            name.includes('Mickey\'s Not-So-Scary'))
              continue;

        waittimes.push(ride.waitTime);
        ridenames.push(ride.name);
    }

    var obj = 
    {
      attractions : []
    };
    for(var i = 0; i < waittimes.length; i++) {
      obj.attractions.push({ name : ridenames[i], time : waittimes[i] });
    }

    var jayson = JSON.stringify(obj);
    fs.writeFile(mk_file, jayson, 'utf8', function(err) {
      console.error(err);
    });

    mk_rides = obj;

    res.render('magickingdom', { park : 'Magic Kingdom', rides : mk_rides, weather : weather });
  });
});

// EPCOT
router.get('/epcot', function(req, res, next) {
  var epcot       = new themeparks.Parks.WaltDisneyWorldEpcot();
  // JSON object
  var epcot_rides = 
  {
    attractions : []
  };

  epcot.GetWaitTimes(function(err, rides) 
  {
    if (err) 
      return console.error(err);

    for(var i=0, ride; ride=rides[i++];) {
        epcot_rides.attractions.push({ name : ride.name, time : ride.waitTime });
    }

    // Render the page once the rides/times are loaded
    res.render('epcot', { park : 'EPCOT', rides : epcot_rides, weather : weather });
  });
});

// DHS
router.get('/hollywoodstudios', function(req, res, next) {
  var dhs       = new themeparks.Parks.WaltDisneyWorldHollywoodStudios();
  // JSON object
  var dhs_rides = 
  {
    attractions : []
  };

  dhs.GetWaitTimes(function(err, rides) 
  {
    if (err) 
      return console.error(err);

    for(var i=0, ride; ride=rides[i++];) {
        var name = ride.name;

        // Filter
        if( name.includes('Lights, Motors, Action') ||
            name.includes('Wandering Oaken\'s') ||
            name.includes('Olaf') ||
            name.includes('Short Film') ||
            name.includes('Star Wars') ||
            name.includes('Cars 3') ||
            name.includes('Pirates')) 
                continue;

        dhs_rides.attractions.push({ name : ride.name, time : ride.waitTime });
    }

    // Render the page once the rides/times are loaded
    res.render('hollywoodstudios', { park : 'Disney\'s Hollywood Studios', rides : dhs_rides, weather : weather });
  });
});

// DAK
router.get('/animalkingdom', function(req, res, next) {
  var dak       = new themeparks.Parks.WaltDisneyWorldAnimalKingdom();
  // JSON object
  var dak_rides = 
  {
    attractions : []
  };

  dak.GetWaitTimes(function(err, rides) 
  {
    if (err) 
      return console.error(err);

    for(var i=0, ride; ride=rides[i++];) {
        var name = ride.name;
        if( name.includes('Disney Animals') || 
            name.includes('Affection Section') ||
            name.includes('Conservation Station') ||
            name.includes('Jungle Trek') ||
            name.includes('Exploration Trail')) 
              continue;

        dak_rides.attractions.push({ name : ride.name, time : ride.waitTime });
    }

    // Render the page once the rides/times are loaded
    res.render('animalkingdom', { park : 'Disney\'s Animal Kingdom', rides : dak_rides, weather : weather });
  });
});


module.exports = router;
