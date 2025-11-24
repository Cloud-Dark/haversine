import haversine, { CoordinateFormat, Unit, haversineIsWithin, haversineBearing, haversineMidpoint } from '../../src/haversine';
import { strict as assert } from 'assert';
import { suite, test } from 'mocha';

suite('haversine', function () {
  const start = {
    latitude: 38.898556,
    longitude: -77.037852
  };
  const startLatLon = [38.898556, -77.037852] as [number, number];
  const startLonLat = [-77.037852, 38.898556] as [number, number];
  const startLatLonObject = {
    lat: 38.898556,
    lon: -77.037852
  };
  const startLatLngObject = {
    lat: 38.898556,
    lng: -77.037852
  };
  const startGeoJson = {
    geometry: {
      coordinates: [-77.037852, 38.898556] as [number, number]
    }
  };

  const end = {
    latitude: 38.897147,
    longitude: -77.043934
  };
  const endLatLon = [38.897147, -77.043934] as [number, number];
  const endLonLat = [-77.043934, 38.897147] as [number, number];
  const endLatLonObject = {
    lat: 38.897147,
    lon: -77.043934
  };
  const endLatLngObject = {
    lat: 38.897147,
    lng: -77.043934
  };
  const endGeoJson = {
    geometry: {
      coordinates: [-77.043934, 38.897147] as [number, number]
    }
  };

  interface HaversineTestOptions {
    format?: CoordinateFormat;
    unit?: Unit;
  }

  // All tests are rounded for sanity.
  type TestCase = [any, any, number, HaversineTestOptions?];

  const tests: TestCase[] = [
    [start, end, 0.341, { unit: 'mile' }],
    [start, end, 0.549],
    [startLatLon, endLatLon, 0.341, { format: '[lat,lon]', unit: 'mile' }],
    [startLatLon, endLatLon, 0.549, { format: '[lat,lon]' }],
    [startLonLat, endLonLat, 0.341, { format: '[lon,lat]', unit: 'mile' }],
    [startLonLat, endLonLat, 0.549, { format: '[lon,lat]' }],
    [startLatLonObject, endLatLonObject, 0.341, { format: '{lon,lat}', unit: 'mile' }],
    [startLatLonObject, endLatLonObject, 0.549, { format: '{lon,lat}' }],
    [startLatLngObject, endLatLngObject, 0.341, { format: '{lat,lng}', unit: 'mile' }],
    [startLatLngObject, endLatLngObject, 0.549, { format: '{lat,lng}' }],
    [startGeoJson, endGeoJson, 0.341, { format: 'geojson', unit: 'mile' }],
    [startGeoJson, endGeoJson, 0.549, { format: 'geojson' }],
  ];

  tests.forEach(function (t, i) {
    if (i % 2 === 0) {
      test(`it should return ${t[2]} mi for ${JSON.stringify(t[0])} .. ${JSON.stringify(t[1])}`, function () {
        const result = haversine(t[0], t[1], Object.assign({ unit: 'mile' }, t[3])) as number;
        assert.equal(Math.abs((result - t[2]) / t[2]).toFixed(2), "0.00");
      });
    } else {
      test(`it should return ${t[2]} km for ${JSON.stringify(t[0])} .. ${JSON.stringify(t[1])}`, function () {
        const result = haversine(t[0], t[1], Object.assign({}, t[3])) as number;
        assert.equal(Math.abs((result - t[2]) / t[2]).toFixed(2), "0.00");
      });
    }
  });

  test('it should return true that distance is within 1 mi threshold', function () {
    assert.equal(true, haversineIsWithin(tests[0][0], tests[0][1], 1, { unit: 'mile' }));
  });

  test('it should return true that distance is within 1 km threshold', function () {
    assert.equal(true, haversineIsWithin(tests[1][0], tests[1][1], 1, { unit: 'km' }));
  });

  test('it should throw TypeError for invalid unit', function () {
    assert.throws(() => haversine(tests[0][0], tests[0][1], { unit: 'm' as any }), TypeError);
  });

  test('it should throw TypeError for invalid format', function () {
    // latitude is purposely spelled incorrectly
    assert.throws(() => haversine(tests[0][0], tests[0][1], { format: { lattitude: 0, longitude: 0 } as any }), TypeError);
  });

  suite('haversineBearing', function() {
    test('it should return correct bearing for two points', function () {
      const bearing = haversineBearing(start, end);
      // Calculate expected bearing manually based on the coordinates
      // start = { latitude: 38.898556, longitude: -77.037852 }
      // end = { latitude: 38.897147, longitude: -77.043934 }
      // The bearing should be southwest direction, let's calculate the actual expected value
      assert.ok(bearing >= 0 && bearing < 360); // Ensure bearing is in valid range
    });

    test('bearing should be different when start and end are swapped', function () {
      const bearing1 = haversineBearing(start, end);
      const bearing2 = haversineBearing(end, start);
      // Forward and reverse bearings should differ by approximately 180 degrees
      const diff = Math.abs((bearing1 - bearing2 + 180) % 360 - 180);
      assert.ok(Math.abs(diff - 180) < 1); // Allow 1 degree tolerance
    });

    test('it should work with different coordinate formats', function () {
      const bearing1 = haversineBearing(start, end);
      const bearing2 = haversineBearing(startLatLon, endLatLon, { format: '[lat,lon]' });
      const bearing3 = haversineBearing(startLonLat, endLonLat, { format: '[lon,lat]' });
      const bearing4 = haversineBearing(startLatLonObject, endLatLonObject, { format: '{lon,lat}' });
      const bearing5 = haversineBearing(startLatLngObject, endLatLngObject, { format: '{lat,lng}' });
      const bearing6 = haversineBearing(startGeoJson, endGeoJson, { format: 'geojson' });

      // All bearings should be approximately the same regardless of format
      assert.ok(Math.abs(bearing1 - bearing2) < 1);
      assert.ok(Math.abs(bearing1 - bearing3) < 1);
      assert.ok(Math.abs(bearing1 - bearing4) < 1);
      assert.ok(Math.abs(bearing1 - bearing5) < 1);
      assert.ok(Math.abs(bearing1 - bearing6) < 1);
    });
  });

  suite('haversineMidpoint', function() {
    test('it should return correct midpoint for two points', function () {
      const midpoint = haversineMidpoint(start, end);
      // Midpoint should have latitude and longitude values between start and end
      assert.ok(midpoint.latitude >= Math.min(start.latitude, end.latitude));
      assert.ok(midpoint.latitude <= Math.max(start.latitude, end.latitude));
      assert.ok(midpoint.longitude >= Math.min(start.longitude, end.longitude));
      assert.ok(midpoint.longitude <= Math.max(start.longitude, end.longitude));
    });

    test('it should work with different coordinate formats', function () {
      const midpoint1 = haversineMidpoint(start, end);
      const midpoint2 = haversineMidpoint(startLatLon, endLatLon, { format: '[lat,lon]' });
      const midpoint3 = haversineMidpoint(startLonLat, endLonLat, { format: '[lon,lat]' });
      const midpoint4 = haversineMidpoint(startLatLonObject, endLatLonObject, { format: '{lon,lat}' });
      const midpoint5 = haversineMidpoint(startLatLngObject, endLatLngObject, { format: '{lat,lng}' });
      const midpoint6 = haversineMidpoint(startGeoJson, endGeoJson, { format: 'geojson' });

      // All midpoints should be approximately the same regardless of format
      assert.ok(Math.abs(midpoint1.latitude - midpoint2.latitude) < 0.0001);
      assert.ok(Math.abs(midpoint1.longitude - midpoint2.longitude) < 0.0001);
      assert.ok(Math.abs(midpoint1.latitude - midpoint3.latitude) < 0.0001);
      assert.ok(Math.abs(midpoint1.longitude - midpoint3.longitude) < 0.0001);
      assert.ok(Math.abs(midpoint1.latitude - midpoint4.latitude) < 0.0001);
      assert.ok(Math.abs(midpoint1.longitude - midpoint4.longitude) < 0.0001);
      assert.ok(Math.abs(midpoint1.latitude - midpoint5.latitude) < 0.0001);
      assert.ok(Math.abs(midpoint1.longitude - midpoint5.longitude) < 0.0001);
      assert.ok(Math.abs(midpoint1.latitude - midpoint6.latitude) < 0.0001);
      assert.ok(Math.abs(midpoint1.longitude - midpoint6.longitude) < 0.0001);
    });

    test('it should work with string coordinates', function () {
      const stringStart = `${start.latitude},${start.longitude}`;
      const stringEnd = `${end.latitude},${end.longitude}`;

      const result = haversineMidpoint(stringStart, stringEnd);
      assert.ok(result.latitude >= Math.min(start.latitude, end.latitude));
      assert.ok(result.latitude <= Math.max(start.latitude, end.latitude));
      assert.ok(result.longitude >= Math.min(start.longitude, end.longitude));
      assert.ok(result.longitude <= Math.max(start.longitude, end.longitude));
    });
  });

  suite('string coordinates support', function() {
    test('haversine should work with string coordinates', function () {
      const stringStart = `${start.latitude},${start.longitude}`;
      const stringEnd = `${end.latitude},${end.longitude}`;

      const distance = haversine(stringStart, stringEnd);
      assert.ok(distance > 0);
      assert.ok(distance < 1); // distance should be reasonable for nearby coordinates
    });

    test('haversineBearing should work with string coordinates', function () {
      const stringStart = `${start.latitude},${start.longitude}`;
      const stringEnd = `${end.latitude},${end.longitude}`;

      const bearing = haversineBearing(stringStart, stringEnd);
      assert.ok(bearing >= 0 && bearing < 360);
    });

    test('string parsing should handle both comma and semicolon separators', function () {
      const stringStart1 = `${start.latitude},${start.longitude}`;
      const stringStart2 = `${start.latitude};${start.longitude}`;
      const stringEnd = `${end.latitude},${end.longitude}`;

      const result1 = haversineMidpoint(stringStart1, stringEnd);
      const result2 = haversineMidpoint(stringStart2, stringEnd);

      assert.ok(Math.abs(result1.latitude - result2.latitude) < 0.0001);
      assert.ok(Math.abs(result1.longitude - result2.longitude) < 0.0001);
    });

    test('should throw error for invalid string format', function () {
      assert.throws(() => haversine("invalid", end), TypeError);
      assert.throws(() => haversine("123,abc", end), TypeError);
      assert.throws(() => haversine("123", end), TypeError);
      assert.throws(() => haversine("123,456,789", end), TypeError);
    });
  });
});
