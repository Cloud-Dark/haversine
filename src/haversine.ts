export type Unit = 'km' | 'mile' | 'meter' | 'nmi';

export type CoordinateFormat = '[lat,lon]' | '[lon,lat]' | '{lon,lat}' | '{lat,lng}' | 'geojson' | undefined;

interface StandardCoordinates {
  latitude: number;
  longitude: number;
}

interface LatLonCoordinates {
  lat: number;
  lon: number;
}

interface LatLngCoordinates {
  lat: number;
  lng: number;
}

interface GeoJsonCoordinates {
  geometry: {
    coordinates: [number, number];
  };
}

type CoordinateInput =
  | StandardCoordinates
  | [number, number]
  | LatLonCoordinates
  | LatLngCoordinates
  | GeoJsonCoordinates
  | string;

interface HaversineOptions {
  unit?: Unit;
  format?: CoordinateFormat;
}

const RADII: Record<Unit, number> = {
  km: 6371,      // kilometer
  mile: 3960,    // mile
  meter: 6371000, // meter
  nmi: 3440      // nautical mile
};

// num: coordinate difference
function convertToRadian(num: number): number {
  return num * Math.PI / 180;
}

// convert coordinates to standard format based on the passed format option
function convertCoordinates(format: CoordinateFormat, coordinates: CoordinateInput): StandardCoordinates {
  // Handle string format
  if (typeof coordinates === 'string') {
    // Parse string coordinates in format "lat,lon" or "lat;lon"
    const parts = coordinates.split(/[,;]/);
    if (parts.length === 2) {
      const lat = parseFloat(parts[0].trim());
      const lon = parseFloat(parts[1].trim());
      if (!isNaN(lat) && !isNaN(lon)) {
        return { latitude: lat, longitude: lon };
      }
    }
    throw new TypeError(`Invalid string coordinate format. Expected "lat,lon" or "lat;lon", got: ${coordinates}`);
  }

  switch (format) {
    case '[lat,lon]':
      const latLon = coordinates as [number, number];
      return { latitude: latLon[0], longitude: latLon[1] };
    case '[lon,lat]':
      const lonLat = coordinates as [number, number];
      return { latitude: lonLat[1], longitude: lonLat[0] };
    case '{lon,lat}':
      const latLonObj = coordinates as LatLonCoordinates;
      return { latitude: latLonObj.lat, longitude: latLonObj.lon };
    case '{lat,lng}':
      const latLngObj = coordinates as LatLngCoordinates;
      return { latitude: latLngObj.lat, longitude: latLngObj.lng };
    case 'geojson':
      const geoJson = coordinates as GeoJsonCoordinates;
      return { latitude: geoJson.geometry.coordinates[1], longitude: geoJson.geometry.coordinates[0] };
    case undefined:
      // For non-string inputs without format, assume standard format
      if (Array.isArray(coordinates)) {
        const coordArray = coordinates as [number, number];
        return { latitude: coordArray[0], longitude: coordArray[1] };
      } else if ((coordinates as StandardCoordinates).latitude !== undefined) {
        return coordinates as StandardCoordinates;
      } else if ((coordinates as LatLonCoordinates).lat !== undefined && (coordinates as LatLonCoordinates).lon !== undefined) {
        const obj = coordinates as LatLonCoordinates;
        return { latitude: obj.lat, longitude: obj.lon };
      } else if ((coordinates as LatLngCoordinates).lat !== undefined && (coordinates as LatLngCoordinates).lng !== undefined) {
        const obj = coordinates as LatLngCoordinates;
        return { latitude: obj.lat, longitude: obj.lng };
      } else if ((coordinates as GeoJsonCoordinates).geometry !== undefined) {
        const obj = coordinates as GeoJsonCoordinates;
        return { latitude: obj.geometry.coordinates[1], longitude: obj.geometry.coordinates[0] };
      } else {
        throw new TypeError(`Invalid coordinate format provided. Got ${JSON.stringify(coordinates)}`);
      }
    default:
      throw new TypeError(`Invalid format provided. Got ${JSON.stringify(format)}`);
  }
}

/**
 *  Calculate the haversine distance between two points.
 *  @param startCoordinates Starting coordinates in the format provided by `format`
 *  @param endCoordinates Ending coordinates in the format provided by `format`
 *  @param options Options object with unit, threshold, and format
 *  @returns Distance apart
 */
export default function haversine(
  startCoordinates: CoordinateInput,
  endCoordinates: CoordinateInput,
  { unit = 'km', format }: HaversineOptions = {}
): number {
  if (!(unit in RADII)) throw new TypeError(`Invalid unit provided to haversine. Got ${unit}`);

  const R = RADII[unit];

  let start: StandardCoordinates;
  let end: StandardCoordinates;

  try {
    start = convertCoordinates(format, startCoordinates);
    end = convertCoordinates(format, endCoordinates);
  } catch (e) {
    throw e;
  }

  const dLat = convertToRadian(end.latitude - start.latitude);
  const dLon = convertToRadian(end.longitude - start.longitude);
  const lat1 = convertToRadian(start.latitude);
  const lat2 = convertToRadian(end.latitude);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Returns `true` if the distance between two coordinates is strictly less than the threshold
 */
export function haversineIsWithin(startCoordinates: CoordinateInput, endCoordinates: CoordinateInput, threshold: number, { unit = 'km', format }: HaversineOptions = {}) {
  return threshold > haversine(startCoordinates, endCoordinates, { unit, format });
}

/**
 * Calculate the bearing (angle) between two points.
 * @param startCoordinates Starting coordinates in the format provided by `format`
 * @param endCoordinates Ending coordinates in the format provided by `format`
 * @param options Options object with format
 * @returns Bearing in degrees from North (0-360)
 */
export function haversineBearing(
  startCoordinates: CoordinateInput,
  endCoordinates: CoordinateInput,
  { format }: Pick<HaversineOptions, 'format'> = {}
): number {
  let start: StandardCoordinates;
  let end: StandardCoordinates;

  try {
    start = convertCoordinates(format, startCoordinates);
    end = convertCoordinates(format, endCoordinates);
  } catch (e) {
    throw e;
  }

  const startLatRad = convertToRadian(start.latitude);
  const endLatRad = convertToRadian(end.latitude);
  const dLonRad = convertToRadian(end.longitude - start.longitude);

  // Calculate bearing using the formula
  const y = Math.sin(dLonRad) * Math.cos(endLatRad);
  const x = Math.cos(startLatRad) * Math.sin(endLatRad) -
            Math.sin(startLatRad) * Math.cos(endLatRad) * Math.cos(dLonRad);

  let bearing = Math.atan2(y, x);
  bearing = bearing * (180 / Math.PI); // Convert to degrees
  return (bearing + 360) % 360; // Normalize to 0-360 degrees
}

/**
 * Calculate the midpoint between two points.
 * @param startCoordinates Starting coordinates in the format provided by `format`
 * @param endCoordinates Ending coordinates in the format provided by `format`
 * @param options Options object with format
 * @returns Object with latitude and longitude of the midpoint
 */
export function haversineMidpoint(
  startCoordinates: CoordinateInput,
  endCoordinates: CoordinateInput,
  { format }: Pick<HaversineOptions, 'format'> = {}
): StandardCoordinates {
  let start: StandardCoordinates;
  let end: StandardCoordinates;

  try {
    start = convertCoordinates(format, startCoordinates);
    end = convertCoordinates(format, endCoordinates);
  } catch (e) {
    throw e;
  }

  // Convert to radians
  const startLatRad = convertToRadian(start.latitude);
  const startLonRad = convertToRadian(start.longitude);
  const endLatRad = convertToRadian(end.latitude);
  const endLonRad = convertToRadian(end.longitude);

  // Calculate differences
  const dLon = endLonRad - startLonRad;

  // Calculate midpoint using the formula
  const Bx = Math.cos(endLatRad) * Math.cos(dLon);
  const By = Math.cos(endLatRad) * Math.sin(dLon);

  const lat3 = Math.atan2(
    Math.sin(startLatRad) + Math.sin(endLatRad),
    Math.sqrt((Math.cos(startLatRad) + Bx) * (Math.cos(startLatRad) + Bx) + By * By)
  );

  const lon3 = startLonRad + Math.atan2(By, Math.cos(startLatRad) + Bx);

  // Convert back to degrees
  return {
    latitude: lat3 * (180 / Math.PI),
    longitude: lon3 * (180 / Math.PI)
  };
}
