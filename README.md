# Haversine

A simple haversine formula module for Node.js

## Installation

`npm install haversine` or `yarn add haversine`

## Usage

### haversine (start, end, options)

```js
const haversine = require('haversine');
// import haversine from 'haversine';

const start = {
  latitude: 30.849635,
  longitude: -83.24559
};

const end = {
  latitude: 27.950575,
  longitude: -82.457178
};

// You can also use string coordinates:
const startString = "30.849635,-83.24559";
const endString = "27.950575,-82.457178";

console.log(haversine(start, end)); // unit: 'km'
// 331.281531778995
console.log(haversine(start, end, { unit: 'mile' }));
// 205.91349330479048
console.log(haversine(start, end, { unit: 'meter' }));
// 331281.531778995
console.log(haversine(start, end, { threshold: 1 }));
// false
console.log(haversine(start, end, { threshold: 1, unit: 'mile' }));
// false
console.log(haversine(start, end, { threshold: 1, unit: 'meter' }));
// false

// Using string coordinates:
console.log(haversine(startString, endString)); // Also works with string coordinates
// 331.281531778995

// Using the new functions:
const { haversineBearing, haversineMidpoint } = require('haversine');

console.log(haversineBearing(start, end)); // 223.54 (degrees from North)
console.log(haversineMidpoint(start, end));
// { latitude: 29.399..., longitude: -82.851... }
```

#### API Reference

- `options.unit = 'km'` - Unit of measurement applied to result { `km` for kilometer, `mile`, `meter`, `nmi` for nautical mile }
  - if invalid, the function will throw a TypeError
- `options.threshold = undefined` - If a number is provided, the funciton will return a boolean indicating if the two points are within this distance
- `options.format = undefined` - The format of start and end coordinate arguments. See table below for available values.
  - if invalid, the function will throw a TypeError

| Format        | Example
| ------------- |--------------------------|
| `undefined` (default) | `{ latitude: 30.849635, longitude: -83.24559 }`
| `[lat,lon]`   | `[30.849635, -83.24559]`
| `[lon,lat]`   | `[-83.24559, 30.849635]`
| `{lon,lat}`   | `{ lat: 30.849635, lon: -83.24559 }`
| `{lat,lng}`   | `{ lat: 30.849635, lng: -83.24559 }`
| `geojson`     | `{ type: 'Feature', geometry: { coordinates: [-83.24559, 30.849635] } }`
| `string`      | `"30.849635,-83.24559"` or `"30.849635;-83.24559"`

### haversineBearing (start, end, options)

```js
const { haversineBearing } = require('haversine');

const start = {
  latitude: 30.849635,
  longitude: -83.24559
};

const end = {
  latitude: 27.950575,
  longitude: -82.457178
};

console.log(haversineBearing(start, end)); // 223.54 (degrees from North)
```

Calculates the initial bearing (forward azimuth) between two points.
- Returns the bearing in degrees from North (0-360)
- Supports the same coordinate formats as the main haversine function
- Accepts an optional `format` option to specify coordinate format

### haversineMidpoint (start, end, options)

```js
const { haversineMidpoint } = require('haversine');

const start = {
  latitude: 30.849635,
  longitude: -83.24559
};

const end = {
  latitude: 27.950575,
  longitude: -82.457178
};

console.log(haversineMidpoint(start, end));
// { latitude: 29.399..., longitude: -82.851... }
```

Calculates the midpoint between two points along a great circle path.
- Returns an object with `latitude` and `longitude` properties
- Supports the same coordinate formats as the main haversine function
- Accepts an optional `format` option to specify coordinate format

[MIT License](http://opensource.org/licenses/MIT)
