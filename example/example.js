var gpxreplay = require('../gpxreplay');

var printWaypoint = function(point){
  console.log(point);
};

var options = {
  rate : 10,
  loop : true,
  limitWait: 5000,
  precision : 3
};

gpxreplay.playTrack('./track_log.gpx', printWaypoint, options);

