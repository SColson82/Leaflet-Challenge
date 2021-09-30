// Store our API endpoint as queryUrl.
var queryUrl =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place and time of the earthquake.
  function bindPopuptoEarthquake(feature, layer) {
    layer.bindPopup(
      `<h3>Location: ${feature.properties.place}<br>Magnitude: ${
        feature.properties.mag
      }</h3><hr><p>${new Date(feature.properties.time)}</p>`
    );
  }

  function generateEarthquakeRadius(depth) {
    return Math.sqrt(depth / 3.1415);
  }
  function generateEarthquakeColor(magnitude) {
    if (magnitude > 9.0) {
      return "#160206";
    }
    if (magnitude > 8.0) {
      return "#2c040c";
    }
    if (magnitude > 7.0) {
      return "#420612";
    }
    if (magnitude > 6.0) {
      return "#580818";
    }
    if (magnitude > 5.0) {
      return "#6e0a1e";
    }
    if (magnitude > 4.0) {
      return "#840c24";
    }
    if (magnitude > 3.0) {
      return "#9a0e2a";
    }
    if (magnitude > 2.0) {
      return "#b01030";
    }
    if (magnitude > 1.0) {
      return "#c61236";
    } else {
      return "#dc143c";
    }
  }
  function generateEarthquakeStyle(feature) {
    console.log(feature);
    return {
      color: generateEarthquakeColor(feature.properties.mag),
      radius: generateEarthquakeRadius(feature.geometry.coordinates[2]),
    };
  }

  function generateEarthquakeMarker(feature, layer) {
    return L.circleMarker(layer);
  }
  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  var earthquakes = L.geoJSON(data.features, {
    onEachFeature: bindPopuptoEarthquake,
    style: generateEarthquakeStyle,
    pointToLayer: generateEarthquakeMarker,
  });
  console.log(earthquakes);
  // Create the base layers.
  var street = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }
  );

  var topo = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
  });

  let dark = L.tileLayer(
    "https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      accessToken: API_KEY,
    }
  );

  let satellite = L.tileLayer(
    "https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      accessToken: API_KEY,
    }
  );

  // Create a baseMaps object.
  var baseMaps = {
    "Street Map": street,
    "Topographic Map": topo,
    Dark: dark,
    Satellite: satellite,
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  var myMap = L.map("map", {
    center: [20.0, -4.0],
    zoom: 3,
    layers: [satellite, earthquakes],
  });

  var tectonicPlates;

  d3.json(
    "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"
  ).then(function (tectonicPlateData) {
    tectonicPlates = new L.LayerGroup();
    L.geoJson(tectonicPlateData).addTo(tectonicPlates);
    tectonicPlates.addTo(myMap);
    console.log(tectonicPlates);
  });

  // Create an overlay object to hold our overlay.
  var overlayMaps = {
    // Add Tectonic Plates
    // "Tectonic Plates": tectonicPlates,
    Earthquakes: earthquakes,
  };

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control
    .layers(baseMaps, overlayMaps, {
      collapsed: false,
    })
    .addTo(myMap);

  // Set up the legend.
  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function () {
    var div = L.DomUtil.create("div", "info legend");
    var limits = [0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0];
    var colors = [
      "#dc143c",
      "#c61236",
      "#b01030",
      "#9a0e2a",
      "#840c24",
      "#6e0a1e",
      "#580818",
      "#420612",
      "#2c040c",
      "#160206",
    ];

    // Add the minimum and maximum.
    var legendInfo = `
      <h1>Earthquake Magnitude and Depth</h1>
      <div class="labels">
      <div class="min">
      ${limits[0]}
      </div>
      <div class="max">
      ${limits[limits.length - 1]}
      </div>
      </div>
      <ul>`;

    limits.forEach(function (limit, index) {
      legendInfo += '<li style="background-color: ' + colors[index] + '"></li>';
    });

    legendInfo += "</ul>";
    div.innerHTML = legendInfo;
    return div;
  };

  // Adding the legend to the map
  legend.addTo(myMap);
});
