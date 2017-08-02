var express     = require('express');
var router      = express.Router();
var themeparks  = require('themeparks');
var json        = require('jsonfile');
var fs          = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Walt Disney World Wait Times' });
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
        console.log(ride.name + ": " + ride.waitTime + " minutes wait");

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

    res.render('magickingdom', { park : 'Magic Kingdom', rides : mk_rides });
  });
});

// EPCOT
router.get('/epcot', function(req, res, next) {
  res.render('epcot', { park : 'EPCOT'});
});

// DHS
router.get('/hollywoodstudios', function(req, res, next) {
  res.render('hollywoodstudios', { park : 'Disney\'s Hollywood Studios' });
});

// DAK
router.get('/animalkingdom', function(req, res, next) {
  res.render('animalkingdom', { park : 'Disney\'s Animal Kingdom' });
});


module.exports = router;
