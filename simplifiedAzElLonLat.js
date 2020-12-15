function azElToLonLat(azEl, SAT_orbital_degs = 0.0) {
  const az = deg2rad(azEl[0]);
  const el = deg2rad(azEl[1]);
  const SAT_orbital = deg2rad(SAT_orbital_degs);
  const A = 6378137.0; //< Major Radius
  const B = 6356752.3142; //< Semi-Minor Radius
  const E2 = 0.00669437999014; //< 1st Eccentricity^2
  const ES2 = 0.00673949674228; //< 2nd Eccentricity^2
  const SATELLITERADIUS = 42164137.0;
  const SATx = SATELLITERADIUS * Math.cos(SAT_orbital);
  const SATy = SATELLITERADIUS * Math.sin(SAT_orbital);

  //  Unit cartesian pointing vector in satellite (EE) frame
  const POINTINGx = -Math.cos(az) * Math.cos(el);
  const POINTINGy = Math.sin(az) * Math.cos(el);
  const POINTINGz = Math.sin(el);

  // Convert to unit cartesian pointing vector in ECEF frame
  const EPx =
    POINTINGx * Math.cos(SAT_orbital) - POINTINGy * Math.sin(SAT_orbital);
  const EPy =
    POINTINGx * Math.sin(SAT_orbital) + POINTINGy * Math.cos(SAT_orbital);
  const EPz = POINTINGz;

  // Find the distance between the satellite and the point on the earth
  const t1 = (EPx ** 2 + EPy ** 2) / A ** 2 + EPz ** 2 / B ** 2;
  const t2 = 2 * ((SATx * EPx + SATy * EPy) / A ** 2);
  const t3 = (SATx ** 2 + SATy ** 2) / A ** 2 - 1;

  // Solve quadratic equation
  // If the discriminant is negative, the look angle is not towards the earth

  const det = t2 * t2 - 4 * t1 * t3;
  var shortest_distance;
  if (det >= 0) {
    // There are two solutions, (front and back side of the earth)
    const distance_1 = (-t2 + Math.sqrt(det)) / (2 * t1);
    const distance_2 = (-t2 - Math.sqrt(det)) / (2 * t1);

    // Choose the smaller of the two
    shortest_distance = Math.min(distance_1, distance_2);
  } else {
    // the direction from the satellite misses the earth althogether so clamp it to the closest point on the limb of the earth
    shortest_distance = -(SATx * EPx) - SATy * EPy;
  }
  // Find the point on the earth in ECEF coordinates
  const INTERSECx = SATx + EPx * shortest_distance;
  const INTERSECy = SATy + EPy * shortest_distance;
  const INTERSECz = EPz * shortest_distance;

  // Convert ECEF to Latitude and Longitude
  const P = Math.sqrt(INTERSECx ** 2 + INTERSECy ** 2);
  const theta = Math.atan((INTERSECz * A) / (P * B));
  const latitude = Math.atan(
    (INTERSECz + ES2 * B * Math.pow(Math.sin(theta), 3)) /
      (P - E2 * A * Math.pow(Math.cos(theta), 3))
  );
  const longitude = Math.atan2(INTERSECy, INTERSECx);

  return [rad2deg(longitude), rad2deg(latitude)];

  function deg2rad(deg) {
    return deg * (Math.PI / 180.0);
  }

  function rad2deg(rad) {
    return rad * (180.0 / Math.PI);
  }
}
