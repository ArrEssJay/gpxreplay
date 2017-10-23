declare module '@palleter/gpxreplay' {

  interface Point {
    lon: number;
    lat: number;
    elevation: number;
    fromPrevious: {
      bearing: number;
      veolocity: number;
      time: number;
      climb: number;
      distance: number
    };
    toCurrent: {
      time: number;
      meanVelocity: number;
      climb: number;
      distance: number
    };
  }

  type WaypointCallback = (point: Point) => void;

  interface GPXReplayOptions {
    rate: number;
    loop: boolean;
    limitWait: number;
    precision: number;
  }

  export const playTrack: (trackFile: string, printWaypoint: WaypointCallback, options: GPXReplayOptions) => void;
}
