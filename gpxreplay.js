/*
 * Output GPX Tracklog Waypoints in real-time
 * @author Rob Jones
 * @license CC-BY-4.0
 * @version 1.0.0
 */

var gpxParse = require("gpx-parse");
var LatLon = require('geodesy').LatLonEllipsoidal;
var fs = require('fs');

var options = {
  rate : 1,
  loop : false,
  limitWait : -1,
  precision : -1
};

var precisionIterator = function (obj, stack) {
  for (var property in obj) {
    if (obj.hasOwnProperty(property)) {
      if (typeof obj[property] == "object") {
        precisionIterator(obj[property], stack + '.' + property);
      } else if (typeof (obj[property]) == 'number') {
        obj[property] = parseFloat(obj[property].toFixed(options.precision));
      }
    }
  }
};

var sendData = function(data, callback) {
  var len = data.length;
  var delay = 0;
  data.forEach(function (currentValue, index, array){
    delay = delay + currentValue.delay; //all timers are created at the same time so add
    setTimeout(function(x){
      return function() {
        callback(currentValue.data);
        if (options.loop && index == len - 1) sendData(data, callback); //loop
      };
    }(currentValue), delay);
  });
};

var playGPX = function(data, callback) {
  var track = (data.tracks[0]);
  var tseg = track.segments[0];
  var tlen = tseg.length;
  var trackData = [];

  var totalDistance = 0;
  var totalClimb = 0;
  var totalTime = 0;
  var meanVelocity = 0;
  for (var i = 0; i < tlen - 1; i++) { //we always need a next-segment
    var tp1 = tseg[i], tp2 = tseg[i+1];
    var p1 = new LatLon(tp1.lat, tp1.lon);
    var p2 = new LatLon(tp2.lat, tp2.lon);
    var t = Date.parse(tp2.time) - Date.parse(tp1.time);
    totalTime = totalTime + t/1000;
    var d = p1.distanceTo(p2);
    var v = 3600 * d / t;
    meanVelocity = ( meanVelocity + v )/2;
    var b = p1.initialBearingTo(p2);

    //if requested, set the max time between waypoints
    //rate divider sets playback speed
    var delay = ((options.limitWait > 0) ? (t > options.limitWait ? options.limitWait : t) : t)/options.rate;

    op = {
      'data': {
        'lon': tp2.lon,
        'lat': tp2.lat,
        'fromPrevious' :{
          'bearing': b,
          'velocity': v,
          'time': t/1000
        },
        'toCurrent' : {
          'time': totalTime,
          'meanVelocity': meanVelocity
        }
      },
      'delay': delay
    };

    //if elevation included in legs, use straight line approximation
    if (tp1.elevation !== undefined && tp2.elevation !== undefined){
      var climb = tp2.elevation - tp1.elevation;
      totalClimb = totalClimb + climb;
      d = Math.sqrt(d * d + climb * climb);
      op.data.fromPrevious.climb = climb;
      op.data.elevation = tp2.elevation;
      op.data.toCurrent.climb = totalClimb;
    }
    //include the leg length
    totalDistance = totalDistance + d;
    op.data.fromPrevious.distance = d;
    op.data.toCurrent.distance = totalDistance;

    //limit precision
    if (options.precision >=0){
      precisionIterator(op, '');
    }
    trackData.push(op);
  }
  sendData(trackData, callback);
};

/**
 * For each waypoint in the GPX file, call the callback function with an object
 * containing the waypoint data and various statistics.
 *
 * Note that the first point in the track is not reported as it has no
 * previous point to refer to.
 *
 * @param   {string} file - GPX file to parse
 * @param   {function} callback - Callback method
 * @param   {function} options - Optional arguments
 */
playTrack = function(file, callback, _options) {
    if (typeof file != 'string') return;

    //parse optional args
    for (var op in _options){
      if (op in options && typeof(options[op]) === typeof(_options[op])){
        if (typeof(_options[op]) === 'number' && _options[op] < 0) break;
        options[op] = _options[op];
      }
    }

    var parseHandler = function(error, data) {
      if (error) {
        console.log("Error: ");
        console.log(error);
        return;
      }

      playGPX(data, callback);
    };

    fs.lstat(file, function(err, stat) {
      if (stat && stat.isFile()) {
        gpxParse.parseGpxFromFile(file, parseHandler);
      } else {
        gpxParse.parseGpx(file, parseHandler);
      }
    });
};

if (typeof module != 'undefined' && module.exports) module.exports.playTrack = playTrack;
