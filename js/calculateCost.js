/* calculateCost */

//var currentPosition = require('js/getCurrentPosition'),
var toKmL = 0.425143707,
    avgGasPrice,
    distance,
    avgMpg,
    self;

function sendDistance(oneWay, roundTrip) {
    distance = oneWay;
    returnDistance = roundTrip;
}

function sendAvgMpg(response) {
    avgMpg = response;
}

function calculateTotalCost() {
    $("#keyResults").hide();
    avgGasPrice = document.getElementById('gasPrice').innerHTML.replace(/<[^>]*>/g, "");
    roundTripDistance = Math.round((distance + returnDistance) * 100) / 100;
    totalLitresUsed = distance / (avgMpg * toKmL);
    totalCost = totalLitresUsed * (avgGasPrice / 100);
    totalRoundTripCost = (roundTripDistance / (avgMpg * toKmL)) * (avgGasPrice / 100);
    document.getElementById('totalCost').innerHTML = '<h3><strong>$ ' + Math.round(totalCost * 100) / 100 + '</strong></h3> / ' + distance + ' km';
    document.getElementById('totalRoundTripCost').innerHTML = '<h3><strong>$ ' + Math.round(totalRoundTripCost * 100) / 100 + '</strong></h3> / ' + roundTripDistance + ' km';
    document.getElementById('totalLitresUsed').innerHTML = '<h3><strong>' + Math.round(totalLitresUsed * 100) / 100 + ' (' + Math.round((distance / avgMpg) * 100) / 100 + ')</strong></h3> / one way';
    $("#keyResults").fadeIn();
    $("#addToHistory").fadeIn();
}

function returnTotalCost() {
    return totalCost;
}

self = {
    sendDistance: sendDistance,
    sendAvgMpg: sendAvgMpg,
    calculateTotalCost: calculateTotalCost,
    returnTotalCost: returnTotalCost,
}

exports = self;