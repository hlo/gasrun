/* getCurrentPosition */

var currentLatLng,
    currentAddress,
    firstRun = true,
    city,
    time,
    self;

function getCurrentPosition() {
    $("#loadingText").hide().text('getting current position...').fadeIn(500);
    $("#origin").hide();
    if (navigator.geolocation) {
        // showLatLng and showError are callbacks
        navigator.geolocation.getCurrentPosition(currentLatLngFcn, showError);
    } else {
        // TODO: need better error handling
        alert('Sorry, unable to get current location.\nError Message: ' + err);
        return;
    }
}

function currentLatLngFcn(position) {
    currentLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    new google.maps.Geocoder().geocode({'latLng': currentLatLng}, geoLocationCallback);
}

function geoLocationCallback(results, status) {
    if (status == google.maps.GeocoderStatus.OK && typeof results[0] !== 'undefined') {
        if (results[1]) {
            // formatted address
            currentAddress = results[0].formatted_address;
            // find country name
            for (var i = 0; i < results[0].address_components.length; i++) {
                for (var b = 0; b < results[0].address_components[i].types.length; b++) {
                    if (results[0].address_components[i].types[b] == "locality") {
                        city = results[0].address_components[i].long_name;
                        updateCurrentLocationOnPanel();
                        break;
                    }
                }
            }
        }
    }
}

function updateCurrentLocationOnPanel() {
    document.getElementById('origin').innerHTML = '<span class="glyphicon glyphicon-home red"></span> <strong>' + currentAddress + '</strong>';
    if (firstRun) {
        // send city info to ajax requestHandler
        $("#loadingText").hide().text('retrieving latest gas prices in your city and forecasting tomorrow\'s trend ...').fadeIn(500);
        ajax.sendToPython(city, 'gas');
        firstRun = false;
    }   
    $("#origin").fadeIn();
}

function parseCurrentPosition(response) {
    // TODO: better parsing of python response
    var cityReturned = response.split('city=')[1].split(';')[0],
        gasPrice = response.split('avgGasPrice=')[1].split(';')[0],
        gasForecast = response.split('2dayForecast=')[1].split(';')[0],
        gasForecastMsg = "FORECAST ",
        currentTime = new Date();

    if (currentTime.getHours() > 11) amPm = 'PM';
    else amPm = 'AM';

    var hour = currentTime.getHours() > 12 ? (currentTime.getHours() - 12) : currentTime.getHours();
    if (hour === 0) { hour = 12; }

    time = hour + ":" + (currentTime.getMinutes() < 10 ? '0' : '') + currentTime.getMinutes() + " " + amPm;

    document.getElementById('gasPrice').innerHTML = Math.round(gasPrice * 100)/ 100;
    document.getElementById('unit').innerHTML = '¢/L';
    if (gasForecast === 'no change') gasForecastMsg += '<h3><span class="glyphicon glyphicon-pause yellow" style="vertical-align:-1px;"/></h3>';
    if (gasForecast === 'up') gasForecastMsg += '<h3><span class="glyphicon glyphicon-arrow-up orange" style="vertical-align:-1px;"/></h3>';
    if (gasForecast === 'down') gasForecastMsg += '<h3><span class="glyphicon glyphicon-arrow-down green" style="vertical-align:-1px;"/></h3>';
    document.getElementById('gasCity').innerHTML = cityReturned;
    document.getElementById('gasForecast').innerHTML = gasForecastMsg;
    document.getElementById('time').innerHTML = time;

    // reveal gas price
    $("#loadingText").remove();
    $("#loadingPlaceHolder").remove();
    $("#bodyDashBoard").fadeIn(400);
    $("#bodyContent").fadeIn(500);
    document.getElementById('originRefresh').onclick = getCurrentPosition;
}

function showError(error) {
    console.log(error.message);
}

function returnCurrentAddress() {
    return currentAddress;
}

function returnCurrentLatLng() {
    return currentLatLng;
}

function returnCurrentCity() {
    return city;
}

function returnTime() {
    return time;
}

self = {
    getCurrentPosition: getCurrentPosition,
    returnCurrentAddress: returnCurrentAddress,
    returnCurrentLatLng: returnCurrentLatLng,
    parseCurrentPosition: parseCurrentPosition,
    returnCurrentCity: returnCurrentCity,
    returnTime: returnTime,
}

exports = self;