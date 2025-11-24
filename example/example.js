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

console.log("Jarak antara dua titik (km):", haversine(start, end));
console.log("Jarak antara dua titik (mil):", haversine(start, end, { unit: 'mile' }));
console.log("Jarak antara dua titik (meter):", haversine(start, end, { unit: 'meter' }));
console.log("Jarak antara dua titik (cm):", haversine(start, end, { unit: 'cm' }));
console.log("Jarak antara dua titik (ft):", haversine(start, end, { unit: 'ft' }));
console.log("Jarak antara dua titik (inci):", haversine(start, end, { unit: 'in' }));
console.log("Apakah jarak < 1 km? (true/false):", haversineModule.haversineIsWithin(start, end, 1));
console.log("Apakah jarak < 1 mil? (true/false):", haversineModule.haversineIsWithin(start, end, 1, { unit: 'mile' }));
console.log("Apakah jarak < 1 meter? (true/false):", haversineModule.haversineIsWithin(start, end, 1, { unit: 'meter' }));

// Using string coordinates:
console.log("Jarak dengan string coordinates:", haversine(startString, endString));

// Using the new functions:
const { haversineBearing, haversineMidpoint } = haversineModule;

console.log("Arah antara dua titik (derajat dari utara):", haversineBearing(start, end));
console.log("Titik tengah antara dua titik:", haversineMidpoint(start, end));

// Using additional units:
console.log("Jarak dalam cm:", haversine(start, end, { unit: 'cm' }));
console.log("Jarak dalam ft:", haversine(start, end, { unit: 'ft' }));
console.log("Jarak dalam inci:", haversine(start, end, { unit: 'in' }));
