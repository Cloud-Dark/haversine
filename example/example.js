const haversineModule = require('../dist/src/haversine.js');
const haversine = haversineModule.default || haversineModule;
// import haversine from '../dist/src/haversine.js';  // for ES modules

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
console.log(haversine(start, end, { unit: 'cm' }));
// 33128153.1778995
console.log(haversine(start, end, { unit: 'ft' }));
// 1086881.6692257049
console.log(haversine(start, end, { unit: 'in' }));
// 13042580.030708458
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
const { haversineBearing, haversineMidpoint } = haversineModule;

console.log(haversineBearing(start, end)); // 223.54 (degrees from North)
console.log(haversineMidpoint(start, end));
// { latitude: 29.399..., longitude: -82.851... }

// Using additional units:
console.log(haversine(start, end, { unit: 'cm' }));  // in centimeters
console.log(haversine(start, end, { unit: 'ft' }));  // in feet
console.log(haversine(start, end, { unit: 'in' }));  // in inches
