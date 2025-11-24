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

console.log("Distance between two points (km):", haversine(start, end));
console.log("Distance between two points (miles):", haversine(start, end, { unit: 'mile' }));
console.log("Distance between two points (meters):", haversine(start, end, { unit: 'meter' }));
console.log("Distance between two points (cm):", haversine(start, end, { unit: 'cm' }));
console.log("Distance between two points (ft):", haversine(start, end, { unit: 'ft' }));
console.log("Distance between two points (in):", haversine(start, end, { unit: 'in' }));
console.log("Is distance < 500 km? (true/false):", haversineModule.haversineIsWithin(start, end, 500));
console.log("Is distance < 500 miles? (true/false):", haversineModule.haversineIsWithin(start, end, 500, { unit: 'mile' }));
console.log("Is distance < 500 meters? (true/false):", haversineModule.haversineIsWithin(start, end, 500, { unit: 'meter' }));

// Using string coordinates:
console.log("Distance with string coordinates:", haversine(startString, endString));

// Using the new functions:
const { haversineBearing, haversineMidpoint } = haversineModule;

console.log("Bearing between two points (degrees from North):", haversineBearing(start, end));
console.log("Midpoint between two points:", haversineMidpoint(start, end));

// Using additional units:
console.log("Distance in cm:", haversine(start, end, { unit: 'cm' }));
console.log("Distance in ft:", haversine(start, end, { unit: 'ft' }));
console.log("Distance in inches:", haversine(start, end, { unit: 'in' }));
