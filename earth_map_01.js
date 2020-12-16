
(function () {
  "use strict"
  const width = 1200;
  const height = 600;
  let satelliteLonDegrees = -35.0;
  let lonViewDegrees = 0.0;
  let latViewDegrees = 0.0;
  let elevationDegrees = 5.0;
  let beamPoints = 6;
  let azArrayOffsetDegrees = 0.0;
  let elArrayOffsetDegrees = 0.0;
  let beamRadiusDegrees = 0.2;
  let arrayRadiusDegrees = 6.4;
  const MAX_VALUE_OF_I_OR_J = 13;
  const REUSE_COMBINATIONS = enumerateReuseCombinations(MAX_VALUE_OF_I_OR_J);
  let clusterSizeIndex = 3;
  let v0, // Mouse position in Cartesian coordinates at start of drag gesture.
    r0, // Projection rotation as Euler angles at start.
    q0; // Projection rotation as versor at start.
  let beams = generateAzElCentresArray(arrayRadiusDegrees, beamRadiusDegrees)


  //set up projection
  let projection = d3
    .geoOrthographic()
    .center([150, 0.0])
    .rotate([lonViewDegrees, latViewDegrees])
    .scale(300)
    .translate([width / 2, height / 2])
    .clipAngle(90)
    .precision(0.1);
  //set up path generator using the projection
  const path = d3.geoPath().projection(projection);
  //append SVG to the DOM

  let svg = d3
    .select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  svg
    .append("path")
    .datum(d3.geoGraticule())
    .attr("class", "graticule")
    .attr("d", path);

  d3.json("world-110m-withlakes.json")
    .then((data) => drawCountries(data))
    .then(() => drawBeams());

  //append an HTML slider to control the satellite longitude
  const satLonInput = d3
    .select("body")
    .append("div")
    .attr("class", "satLonInput");
  satLonInput
    .append("input")
    .attr("type", "range")
    .attr("min", satelliteLonDegrees - 180.0)
    .attr("max", satelliteLonDegrees + 180.0)
    .attr("step", 0.1)
    .attr("value", satelliteLonDegrees)
    .attr("class", "slider")
    .attr("id", "satLonSlider")
    .on("input", function () {
      satelliteLonDegrees = parseFloat(this.value);
      d3.select("#satLonLabel").text(
        `Satellite Longitude ${satelliteLonDegrees}°`
      );
      drawBeams();
    });
  satLonInput
    .append("label")
    .attr("id", "satLonLabel")
    .text(`Satellite Longitude ${satelliteLonDegrees}°`);



  //append an HTML slider to control the elevation angle contour
  const elevationContourInput = d3
    .select("body")
    .append("div")
    .attr("class", "elevationContour");
  elevationContourInput
    .append("input")
    .attr("type", "range")
    .attr("min", 0.0)
    .attr("max", 90.0)
    .attr("step", 0.1)
    .attr("value", elevationDegrees)
    .attr("class", "slider")
    .attr("id", "elevationContourSlider")
    .on("input", function () {
      elevationDegrees = parseFloat(this.value);
      d3.select("#elevationLabel").text(
        `Satellite Elevation ${elevationDegrees}°`
      );
      drawElevationContour();
    });
  elevationContourInput
    .append("label")
    .attr("id", "elevationLabel")
    .text(`Elevation Contour ${elevationDegrees}°`);

  //append an HTML slider to control the points per beam
  const beamPointsInput = d3
    .select("body")
    .append("div")
    .attr("class", "beamPoints");
  beamPointsInput
    .append("input")
    .attr("type", "range")
    .attr("min", 6)
    .attr("max", 128)
    .attr("step", 1)
    .attr("value", beamPoints)
    .attr("class", "slider")
    .attr("id", "beamPointsSlider")
    .on("input", function () {
      beamPoints = parseFloat(this.value);
      d3.select("#beamPointsLabel").text(`Points Per Beam ${beamPoints}`);
      drawBeams();
    });
  beamPointsInput
    .append("label")
    .attr("id", "beamPointsLabel")
    .text(`Points Per Beam ${beamPoints}`);


  const azArrayOffsetInput = d3
    .select("body")
    .append("div")
    .attr("class", "azArrayOffsetDegrees");
  azArrayOffsetInput
    .append("input")
    .attr("type", "range")
    .attr("min", -7.0)
    .attr("max", 7.0)
    .attr("step", 0.01)
    .attr("value", azArrayOffsetDegrees)
    .attr("class", "slider")
    .attr("id", "azArrayOffsetSlider")
    .on("input", function () {
      azArrayOffsetDegrees = parseFloat(this.value);
      d3.select("#azArrayOffsetLabel").text(`Array Azimuth Offset ${azArrayOffsetDegrees}°`);
      drawBeams();
    });
  azArrayOffsetInput
    .append("label")
    .attr("id", "azArrayOffsetLabel")
    .text(`Array Azimuth Offset ${azArrayOffsetDegrees}°`);

  const elArrayOffsetInput = d3
    .select("body")
    .append("div")
    .attr("class", "elArrayOffsetDegrees");
  elArrayOffsetInput
    .append("input")
    .attr("type", "range")
    .attr("min", -7.0)
    .attr("max", 7.0)
    .attr("step", 0.01)
    .attr("value", elArrayOffsetDegrees)
    .attr("class", "slider")
    .attr("id", "elArrayOffsetSlider")
    .on("input", function () {
      elArrayOffsetDegrees = parseFloat(this.value);
      d3.select("#elArrayOffsetLabel").text(`Array Elevation Offset ${elArrayOffsetDegrees}°`);
      drawBeams();
    });
  elArrayOffsetInput
    .append("label")
    .attr("id", "elArrayOffsetLabel")
    .text(`Array Elevation Offset ${elArrayOffsetDegrees}°`);

  const arrayRadiusInput = d3
    .select("body")
    .append("div")
    .attr("class", "arrayRadiusDegrees");
  arrayRadiusInput
    .append("input")
    .attr("type", "range")
    .attr("min", 0.1)
    .attr("max", 8.7)
    .attr("step", 0.01)
    .attr("value", arrayRadiusDegrees)
    .attr("class", "slider")
    .attr("id", "arrayRadiusSlider")
    .on("input", function () {
      arrayRadiusDegrees = parseFloat(this.value);
      d3.select("#arrayRadiusLabel").text(`Array Radius ${arrayRadiusDegrees}°`);
      beams = generateAzElCentresArray(arrayRadiusDegrees, beamRadiusDegrees);
      drawBeams();
    });
  arrayRadiusInput
    .append("label")
    .attr("id", "arrayRadiusLabel")
    .text(`Array Radius ${arrayRadiusDegrees}°`);

  const beamRadiusInput = d3
    .select("body")
    .append("div")
    .attr("class", "beamRadiusDegrees");
  beamRadiusInput
    .append("input")
    .attr("type", "range")
    .attr("min", 0.1)
    .attr("max", 4)
    .attr("step", 0.001)
    .attr("value", beamRadiusDegrees)
    .attr("class", "slider")
    .attr("id", "beamRadiusSlider")
    .on("input", function () {
      beamRadiusDegrees = parseFloat(this.value);
      d3.select("#beamRadiusLabel").text(`Beam Radius ${beamRadiusDegrees}°`);
      beams = generateAzElCentresArray(arrayRadiusDegrees, beamRadiusDegrees);
      drawBeams();
    });
  beamRadiusInput
    .append("label")
    .attr("id", "beamRadiusLabel")
    .text(`Beam Radius ${beamRadiusDegrees}°`);

  //add here
  const clusterSizeIndexInput = d3
    .select("body")
    .append("div")
    .attr("class", "clusterSize");
  clusterSizeIndexInput
    .append("input")
    .attr("type", "range")
    .attr("min", 0)
    .attr("max", REUSE_COMBINATIONS.length - 1)
    .attr("step", 1)
    .attr("value", clusterSizeIndex)
    .attr("class", "slider")
    .attr("id", "clusterSizeIndexSlider")
    .on("input", function () {
      clusterSizeIndex = parseFloat(this.value);
      d3.select("#clusterSizeLabel").text(`Cluster Size: ${clusterSize(clusterSizeIndex)} colours`);
      beams = generateAzElCentresArray(arrayRadiusDegrees, beamRadiusDegrees);
      drawBeams();
    });
  clusterSizeIndexInput
    .append("label")
    .attr("id", "clusterSizeLabel")
    .text(`Cluster Size: ${clusterSize(clusterSizeIndex)} colours`);
  //stop here

  //register events on the SVG to allow the user to drag and rotate the map
  svg.call(d3.drag().on("start", dragstarted).on("drag", dragged));
  svg.call(d3.zoom().on("zoom", zoomed));

  function dragstarted() {
    v0 = versor.cartesian(projection.invert(d3.mouse(this)));
    r0 = projection.rotate();
    q0 = versor(r0);
  }

  function dragged() {
    var v1 = versor.cartesian(projection.rotate(r0).invert(d3.mouse(this))),
      q1 = versor.multiply(q0, versor.delta(v0, v1)),
      r1 = versor.rotation(q1);
    r1[2] = 0; //north lock
    projection.rotate(r1);
    d3.selectAll("path").attr("d", path);
  }

  function zoomed() {
    svg.attr("transform", `scale(${d3.event.transform.k})`);
  }

  //callback function to draw the satellite beams on the globe
  function drawBeams() {
    let xInitialBeamGridCoord = 0;
    let yInitialBeamGridCoord = beams.nestedArrayofBeamCentres[xInitialBeamGridCoord].findIndex(i => i != null);
    identifyReusedBeams(beams.nestedArrayofBeamCentres,
      xInitialBeamGridCoord,
      yInitialBeamGridCoord,
      REUSE_COMBINATIONS[clusterSizeIndex].i,
      REUSE_COMBINATIONS[clusterSizeIndex].j);


    let geoJArray = [];
    beams.flatArrayofBeamCentres.forEach((element) => {

      if (element.reuse) {
        const az = element.az + azArrayOffsetDegrees;
        const el = element.el + elArrayOffsetDegrees;
        if (isBeamInEarthCoverage(az, el, beamRadiusDegrees)) {

          //generate array of points of az el circle from centre/radius in degrees seen from the satellite
          const circleArray = generateCircle(az, el, beamRadiusDegrees, beamPoints);

          //translate azEl circle into lonLat - array with each element an array of two floats
          const lonLatCircleArray = [];
          circleArray.forEach((item) =>
            lonLatCircleArray.push(azElToLonLat(item, satelliteLonDegrees))
          );
          //convert each beam array into geoJSON object and add it to an array of those geoJSON objects
          //console.log(lonLatCircleArray);
          geoJArray.push(makeGeoJSONPolygon(lonLatCircleArray));
        }
      }
    }
    );

    //use a d3path generator to insert an SVG path into the DOM.

    plotSVGd3Paths(svg, geoJArray, "path.reuseBeam", "reuseBeam", path);


    //try without reuse
    geoJArray = [];
    beams.flatArrayofBeamCentres.forEach((element) => {

      if (!element.reuse) {
        const az = element.az + azArrayOffsetDegrees;
        const el = element.el + elArrayOffsetDegrees;
        if (isBeamInEarthCoverage(az, el, beamRadiusDegrees)) {
          //generate array of points of az el circle from centre/radius in degrees seen from the satellite
          const circleArray = generateCircle(az, el, beamRadiusDegrees, beamPoints);

          //translate azEl circle into lonLat - array with each element an array of two floats
          const lonLatCircleArray = [];
          circleArray.forEach((item) =>
            lonLatCircleArray.push(azElToLonLat(item, satelliteLonDegrees))
          );
          //convert each beam array into geoJSON object and add it to an array of those geoJSON objects
          //console.log(lonLatCircleArray);
          geoJArray.push(makeGeoJSONPolygon(lonLatCircleArray));
        }
      }
    }
    );

    //use a d3path generator to insert an SVG path into the DOM.

    plotSVGd3Paths(svg, geoJArray, "path.beam", "beam", path);

    //stop reuse




    drawSatelliteIcon(satelliteLonDegrees);

    drawElevationContour();

    drawArrayBoundary();

    svg.selectAll("#beamCountText")
      .remove();

    const arrayArea = Math.PI * arrayRadiusDegrees * arrayRadiusDegrees;
    const cellArea = 6 * beamRadiusDegrees * beamRadiusDegrees * Math.sqrt(3) / 4;
    const cellsInArray = (arrayArea / cellArea).toFixed(1);

    svg.append("text")
      .attr("id", "beamCountText")
      .attr("x", 10)
      .attr("y", 15)
      .text(`Cells Drawn = ${beams.flatArrayofBeamCentres.length}, Cells in Array Area= ${cellsInArray}`);

    const numReuses = beams.flatArrayofBeamCentres.reduce(reuseCount, 0);
    const coFreqCentresSeparationDegrees = (Math.sqrt(REUSE_COMBINATIONS[clusterSizeIndex].clusterSize * 3) * beamRadiusDegrees).toFixed(2);
    const coFreqEdgesSeparationDegrees = (Math.sqrt(REUSE_COMBINATIONS[clusterSizeIndex].clusterSize * 3) * beamRadiusDegrees - 2 * beamRadiusDegrees).toFixed(2);

    svg.append("text")
      .attr("id", "beamCountText")
      .attr("x", 10)
      .attr("y", 40)
      .text(`No. Freq. Reuses = ${numReuses}, Dist b/t Co-Freq Centres = ${coFreqCentresSeparationDegrees} °, Dist b / t Co - Freq Edges = ${coFreqEdgesSeparationDegrees}°`);

  }

  function drawSatelliteIcon(lonDegrees) {
    const satellitePoly1 = [
      [1 + lonDegrees, 1],
      [1 + lonDegrees, -1],
      [-1 + lonDegrees, -1],
      [-1 + lonDegrees, 1],
      [1 + lonDegrees, 1],
    ];

    const satellitePoly2 = [
      [-0.7 + lonDegrees, 1.5],
      [-0.7 + lonDegrees, 6],
      [0.7 + lonDegrees, 6],
      [0.7 + lonDegrees, 1.5],
      [-0.7 + lonDegrees, 1.5],
    ];

    const satellitePoly3 = [
      [-0.7 + lonDegrees, -1.5],
      [0.7 + lonDegrees, -1.5],
      [0.7 + lonDegrees, -6],
      [-0.7 + lonDegrees, -6],
      [-0.7 + lonDegrees, -1.5],
    ];
    const satellite = [
      makeGeoJSONPolygon(satellitePoly1),
      makeGeoJSONPolygon(satellitePoly2),
      makeGeoJSONPolygon(satellitePoly3),
    ];

    plotSVGd3Paths(svg, satellite, "path.satelliteIcon", "satelliteIcon", path);
  }

  function drawElevationContour() {
    const ELEVATIONCONTOURVERTICES = 256;
    const radiusDegs = getElevationContourRadiusDegs(elevationDegrees);
    let azElCircleArray = generateCircle(
      0.0,
      0.0,
      radiusDegs,
      ELEVATIONCONTOURVERTICES
    );

    const lonLatElevationArray = [];
    azElCircleArray.forEach((item) =>
      lonLatElevationArray.push(azElToLonLat(item, satelliteLonDegrees))
    );

    let geoJPathArray = [makeGeoJSONPolygon(lonLatElevationArray)];

    plotSVGd3Paths(
      svg,
      geoJPathArray,
      "path.elevationContour",
      "elevationContour",
      path
    );
  }

  function drawArrayBoundary() {
    const ARRAYBOUNDARYVERTICES = 256;
    let azElCircleArray = generateCircle(
      azArrayOffsetDegrees,
      elArrayOffsetDegrees,
      arrayRadiusDegrees,
      ARRAYBOUNDARYVERTICES
    );

    const arrayBoundaryArray = [];
    azElCircleArray.forEach((item) =>
      arrayBoundaryArray.push(azElToLonLat(item, satelliteLonDegrees))
    );

    let geoJPathArray = [makeGeoJSONPolygon(arrayBoundaryArray)];

    plotSVGd3Paths(
      svg,
      geoJPathArray,
      "path.arrayContour",
      "arrayContour",
      path
    );
  }

  function generateCircle(x_centre, y_centre, radius, points) {
    //determine increment angle
    const increment = (2 * Math.PI) / points;
    const circle = [];
    let i = 0;
    let vertices = points;
    while (vertices > 0) {
      const x = x_centre + radius * Math.cos(i);
      const y = y_centre + radius * Math.sin(i);
      circle.push([x, y]);
      vertices = vertices - 1;
      i = i - increment;
    }
    circle.push([circle[0][0], circle[0][1]]);
    return circle;
  }

  function plotSVGd3Paths(
    svgReference,
    pathData,
    cssSelector,
    cssClass,
    pathGenerator
  ) {
    svgReference
      .selectAll(cssSelector)
      .data(pathData)
      .join("path")
      .attr("class", cssClass)
      .attr("d", pathGenerator);
  }

  function makeGeoJSONPolygon(arrayOfPoints) {
    const polygon = {};
    polygon["type"] = "Polygon";
    polygon["coordinates"] = [arrayOfPoints];
    return polygon;
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180.0);
  }

  function rad2deg(rad) {
    return rad * (180.0 / Math.PI);
  }

  function drawCountries(world) {
    // paste the world land  into the svg from the json file
    svg
      .insert("path")
      .datum(topojson.feature(world, world.objects.land))
      .attr("class", "land")
      .attr("d", path);

    //paste the country boundries into the svg from the json file
    svg
      .insert("path")
      .datum(
        topojson.mesh(world, world.objects.countries, function (a, b) {
          return a !== b;
        })
      )
      .attr("class", "boundary")
      .attr("d", path);
  }

  function getElevationContourRadiusDegs(userElevationAngleDegs) {
    const EARTHRADIUS = 6378.0;
    const SATELLITERADIUS = 42164.0;
    return rad2deg(
      Math.asin(
        (EARTHRADIUS / SATELLITERADIUS) *
        Math.cos(deg2rad(userElevationAngleDegs))
      )
    );
  }


  function clusterSize(clusterSizeIndex) {
    return REUSE_COMBINATIONS[clusterSizeIndex].clusterSize;
  }


  function enumerateReuseCombinations(maxValueofIorJ) {
    let arrayOfCombinations = [];
    for (let i = 1; i < maxValueofIorJ; i++) {
      for (let j = 0; j < i + 1; j++) {
        arrayOfCombinations.push({
          clusterSize: i * i + i * j + j * j,
          i: i,
          j: j
        });
      }
    }
    return arrayOfCombinations.sort(function (a, b) {
      return a.clusterSize - b.clusterSize;
    });
  }

  function reuseCount(accumulator, currentValue, i, array) {
    return array[i].reuse ? accumulator + 1 : accumulator;
  }





  function generateAzElCentresArray(coverageRadiusDegrees, beamRadiusDegrees) {
    const MAXAZ = coverageRadiusDegrees + beamRadiusDegrees;
    let maxEl = MAXAZ;
    const MINEL = -MAXAZ;
    const flatArrayResult = [];
    const nestedArrayResult = [];
    let beamAz = -coverageRadiusDegrees;
    let beamEl = maxEl;
    let x = 0;
    while (beamAz < MAXAZ) {
      let y = 0;
      let innerArray = [];
      while (beamEl > MINEL) {
        if (
          Math.sqrt(beamAz * beamAz + beamEl * beamEl) <
          coverageRadiusDegrees + beamRadiusDegrees
        ) {
          let beamCentreCoordinate = { az: beamAz, el: beamEl };
          flatArrayResult.push(beamCentreCoordinate);
          innerArray[y] = beamCentreCoordinate;
        }
        y++;
        beamEl = beamEl - Math.sqrt(3) * beamRadiusDegrees;
      }
      beamAz = beamAz + 1.5 * beamRadiusDegrees;
      maxEl = maxEl + (Math.sqrt(3) * beamRadiusDegrees) / 2;
      beamEl = maxEl;
      nestedArrayResult[x] = innerArray;
      x++;
      innerArray = [];
    }
    return {
      flatArrayofBeamCentres: flatArrayResult,
      nestedArrayofBeamCentres: nestedArrayResult
    };
  }


  function identifyReusedBeams(
    nestedArrayofBeamCentres,
    xCoordinate,
    yCoordinate,
    iReuseDistance,
    jReuseDistance
  ) {
    if (nestedArrayofBeamCentres[xCoordinate] == undefined) {
      return;
    }
    if (nestedArrayofBeamCentres[xCoordinate][yCoordinate] == undefined) {
      return;
    }
    if (nestedArrayofBeamCentres[xCoordinate][yCoordinate].reuse == true) {
      return;
    }
    nestedArrayofBeamCentres[xCoordinate][yCoordinate].reuse = true;
    let hexagonDirections = ["N", "NE", "SE", "S", "SW", "NW"];
    for (const direction of hexagonDirections) {
      let newX, newY;
      switch (direction) {
        case "N":
          newX = xCoordinate + jReuseDistance;
          newY = yCoordinate - iReuseDistance;
          break;
        case "NE":
          newX = xCoordinate + iReuseDistance + jReuseDistance;
          newY = yCoordinate + jReuseDistance;
          break;
        case "SE":
          newX = xCoordinate + iReuseDistance;
          newY = yCoordinate + jReuseDistance + iReuseDistance;
          break;
        case "S":
          newX = xCoordinate - jReuseDistance;
          newY = yCoordinate + iReuseDistance;
          break;
        case "SW":
          newX = xCoordinate - iReuseDistance - jReuseDistance;
          newY = yCoordinate - jReuseDistance;
          break;
        case "NW":
          newX = xCoordinate - iReuseDistance;
          newY = yCoordinate - jReuseDistance - iReuseDistance;
          break;
      }

      identifyReusedBeams(
        nestedArrayofBeamCentres,
        newX,
        newY,
        iReuseDistance,
        jReuseDistance
      );
    }
  }

  function isBeamInEarthCoverage(az, el, beamRadiusDegrees) {
    const earthEdgeFromGeo = 8.49;
    const nearestEdgeOfBeam = Math.sqrt(az * az + el * el) - beamRadiusDegrees;
    return (nearestEdgeOfBeam < earthEdgeFromGeo);
  }

})();
