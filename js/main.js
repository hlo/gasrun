/* main */

var ajax = require('js/ajaxRequest'), 
    currentPosition = require('js/getCurrentPosition'),
    getCar = require('js/getCar'),
    calculateCost = require('js/calculateCost');

function getCurrentPosition() {
    currentPosition.getCurrentPosition();
}

// runs on page load
getCurrentPosition();
getCar.getCarMake();