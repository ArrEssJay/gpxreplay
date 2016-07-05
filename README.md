


gpxreplay
========


**gpxreplay** is a simple node module that streams waypoints in a GPX track. This may be useful for simulating realtime GPS data.

----------


Usage in node.js
-----------------------

Install using npm.
```
npm install gpxreplay
```

A simple example:
```
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
```

Data returned will be of the format:
```
{
  'lon': 134.753,
  'lat': -29.015,
  'elevation': 223.64,
  'fromPrevious': {
    'bearing': 135.327,
    'velocity': 1.433,
    'time': 15,
    'climb': 0,
    'distance': 5.97
  },
  'toCurrent': {
    'time': 27,
    'meanVelocity': 2.537,
    'climb': -0.48,
    'distance': 14.303
  }
}
```

Waypoint Units
----------------------
Data returned is returned with units

- **time**: seconds
- **distance**: metres
- **angles**: degrees

Options
-----------
- **rate** (number): Playback rate multiplier
- **loop** (boolean): Loop at end of track
- **limitWait** (number): maximum time between sending waypoints (mS)
- **precision** (number): Limit numbers to n decimal places