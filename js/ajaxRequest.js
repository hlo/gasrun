/* ajaxRequest */

var getDistance = require('js/getDistance'),
    getCarData = require('js/getCar'),
    self;

function onRequestSuccess(response) {
    console.debug('response', response);
    // error handling
    if (response.indexOf('city not supported') > -1) {
        $("#loadingPlaceHolder").remove();
        $("#loadingText").remove();
        $("#gasPrice").remove();
        document.getElementById('bodyContent').innerHTML = '<div style="text-align: center; color: white;"><p><h1><span class="glyphicon glyphicon-remove-circle"></span></h1></p><h3>CURRENT CITY NOT SUPPORTED...</h3></div>';
        $("#bodyContent").show();
        throw { name: 'FatalError', message: 'Something went badly wrong' };
    }

    if (response.indexOf("city") > -1) {
        getDistance.initialize();
        require('js/getCurrentPosition').parseCurrentPosition(response);
    } else if (response.indexOf("getMake") > -1) {
        $(".load").remove();
        getCarData.parseAndUpdateCarMake(response);
        document.getElementById("make").onchange = function() { $("#dropDowns").append("<img class='load' src='img/loadingGif.gif' width='20' height='20'/>"); getCarData.getCarModel(document.getElementById("make").value); };
    } else if (response.indexOf("makeM:") > -1) {
        getCarData.parseAndUpdateCarModel(response);
        $(".load").remove();
        document.getElementById("model").onchange = function() { $("#dropDowns").append("<img class='load' src='img/loadingGif.gif' width='20' height='20'/>"); getCarData.getCarYear(document.getElementById("model").value); };
    } else if (response.indexOf("makeY:") > -1) {
        getCarData.parseAndUpdateCarYear(response);
        $(".load").remove();
        document.getElementById("year").onchange = function() { $("#dropDowns").append("<img class='load' src='img/loadingGif.gif' width='20' height='20'/>"); getCarData.getAvgMpg(document.getElementById("year").value); };
    } else if (response.indexOf("makeMpg:") > -1) {
        getCarData.parseAvgMpg(response);
        $(".load").remove();
    }
}

function onRequestError(r, text_status, error_thrown) {
    console.debug('error', text_status + ", " + error_thrown + ":\n" + r.responseText);
}

function sendToPython(request, requestType) {
    // TODO: use switch statements instead
    if (requestType === 'gas') {
        // TODO: dynamic url, not hardcoded
        pythonUrl = 'http://192.168.1.109/cgi-bin/getGasPrice.py';
    } else if (requestType === 'make' || requestType === 'model' || requestType === 'year' || requestType === 'avgMpg') {
        pythonUrl = 'http://192.168.1.109/cgi-bin/getCarData.py';
    }
    jQuery.ajax({
        url: pythonUrl,
        type: 'POST',
        cache: false,
        data: JSON.stringify(request),
        contentType: 'application/json',
        processData: false,
        success: onRequestSuccess,
        error: onRequestError
    });
}

self = {
    sendToPython: sendToPython,
};

exports = self;
