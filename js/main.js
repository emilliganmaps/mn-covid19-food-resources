var app = app || {};

mapboxgl.accessToken = 'pk.eyJ1IjoiZW1pbGxpZ2FuIiwiYSI6ImNrN3d1YmRtbTA1azgzbW83ZzBjMjI4NHQifQ._FKFeKzwH66KlpuuVqKPng';

var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/light-v10', // stylesheet location
    center: [-93.1531872, 44.9962139], // starting position [lng, lat]
    zoom: 9 // starting zoom
});

var geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,

    countries: 'us',

    // apply a client side filter to further limit results

    filter: function(item) {

        return item.context
            .map(function(i) {
                return (
                    i.id.split('.').shift() === 'region' &&
                    i.text === 'Minnesota'
                );
            })
            .reduce(function(acc, cur) {
                return acc || cur;
            });
    },
});

document.getElementById('geocoder').appendChild(geocoder.onAdd(map));

map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

map.on('load', function () {
    map.addSource("places", {
        "type": "geojson",
        "data": "./data/mn_covid_food_resources.geojson"
    });

    map.addLayer({
        "id": "places",
        "interactive": true,
        "type": "circle",
        "source": "places",
        "paint": {
            "circle-radius": 7,
            "circle-color": "#2A3478"
        }
    });
});

map.on('click', 'places', function(e) {
    var coordinates = e.features[0].geometry.coordinates.slice();

    var md = e.features[0].properties;

    var description = '';

    if (md.school_name.length){
        description += md.place_name + ', located at ' +
        md.address_street + ', in ' + md.address_city + '<br />';
    }

    if (md.availability.length){
        description += '<br />Availability: ' + md.availability;
    }

    if (md.offering.length){
        description += '<br />Details: ' + md.offering;
    }
    
    if (md.link.length){
        description += '<br /><a href=' + md.link + ' target=\'blank\'>More information</a>';
    }

    // ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(description)
        .addTo(map);
});

// indicate that the markers are clickable
map.on('mouseenter', 'places', function() {
    map.getCanvas().style.cursor = 'pointer';
});

// change it back to a pointer when it leaves.
map.on('mouseleave', 'places', function() {
    map.getCanvas().style.cursor = '';
});