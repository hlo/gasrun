    /* getDistance */

var input = document.getElementById('destinationInput'),
    mapCanvas = document.getElementById('map_canvas'),
    distanceOneWay = document.getElementById('distanceOneWay'),
    duration = document.getElementById('duration'),
    destinationAddress = document.getElementById('destinationAddress'),
    turnByTurnDirection = document.getElementById('turnByTurnDirections'),
    directionsService = new google.maps.DirectionsService(),
    directionsDisplay = new google.maps.DirectionsRenderer(),
    locator = new google.maps.Geocoder(),
    destinationPlace,
    oneWayDistance,
    oneWayResponse,
    autocomplete,
    origin,
    self;

function initialize() {
    origin = require('js/getCurrentPosition');
    var locationBias = {
        location: require('js/getCurrentPosition').returnCurrentLatLng(),
    };
    autocomplete = new google.maps.places.Autocomplete(input, locationBias);
    google.maps.event.addListener(autocomplete, 'place_changed', function() { getDistanceToDestination()});
}

function getDistanceToDestination() {
    destinationPlace = autocomplete.getPlace();
}

function directionInitialize() {
    directionsDisplay = new google.maps.DirectionsRenderer();
    mapOptions = {
        zoom: 15,
        center: origin.returnCurrentLatLng(),
    };

    map = new google.maps.Map(mapCanvas, mapOptions);
    directionsDisplay.setMap(map);
    calculateRoute();
}

function calculateRoute() {
    var start = origin.returnCurrentAddress();
    var end;
    if (destinationPlace === undefined) end = input.value;
    else end = destinationPlace.formatted_address;

    var request = {
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode.DRIVING,
        avoidTolls: true
    };

    directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            oneWayResponse = response;
            oneWayDistance = oneWayResponse.routes[0].legs[0].distance.value / 1000;

            // get return trip distance
            request = {
                origin: end,
                destination: start,
                travelMode: google.maps.TravelMode.DRIVING
            };
            directionsService.route(request, function(response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    calculateCost.sendDistance(oneWayDistance, response.routes[0].legs[0].distance.value / 1000);
                    calculateCost.calculateTotalCost();
                    directionsDisplay.setDirections(oneWayResponse);
                    turnByTurnDirection.innerHTML = '<a href="' + 'http://maps.google.com/maps?saddr=”'
                                                    + start + '”&daddr=”' + end + '" target="_blank">Turn-by-turn Directions</a>';
                } else {
                    // TODO: better error handling
                    alert('Error: unable to get route');
                }
            });  
        } else {
            // TODO: better error handling
            alert('Error: unable to get route');
        }
    });
}

function returnDestinationAddress() {
    return destinationPlace.formatted_address;
}

self = {
    initialize: initialize,
    returnDestinationAddress: returnDestinationAddress,
    directionInitialize: directionInitialize,
}

exports = self;