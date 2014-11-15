/* getCar */

var makeArray = new Array(),
    make,
    model,
    year,
    avgMpg,
    self;

function clearDropDown(m, y, a) {
    if (m) { document.getElementById('model').innerHTML='<option value="" disabled selected>Model</option>'; $("#model").fadeOut(); }
    if (y) { document.getElementById('year').innerHTML='<option value="" disabled selected>Year</option>'; $("#year").fadeOut(); }
    if (a) { document.getElementById('avgKml').innerHTML=''; $("#vehicleInfo").fadeOut(); $("#avgMpg").fadeOut(); }
}

function getCarMake() {
    $("#loadingText").hide().text('populating vehicle database ...').fadeIn(500);
    $("#dropDowns").append("<img class='load' src='img/loadingGif.gif' width='20' height='20'/>");
    ajax.sendToPython('getMake', 'make');
}

function getCarModel(value) {
    clearDropDown(1, 1, 1);
    make = value;
    require('js/ajaxRequest').sendToPython('makeM:' + make, 'model');
}

function getCarYear(value) {
    clearDropDown(0, 1, 1);
    model = value;
    require('js/ajaxRequest').sendToPython('makeY:' + make + ':model:' + model, 'year');
}

function getAvgMpg(value) {
    clearDropDown(0, 0, 1);
    year = value;
    require('js/ajaxRequest').sendToPython('makeMpg:' + make + ':model:' + model + ':year:' + year, 'avgMpg');
}

function parseAndUpdateCarMake(response) {
    makeArray = response.replace(/[\[\]\']+/g, '').split('"getMake"')[1].replace(/(\r\n|\n|\r)/gm,"").replace(/, /g, '/').split("/");
    for (i in makeArray) {
        document.getElementById('make').add(new Option(makeArray[i]));
    };
    $("#make").fadeIn();
}

function parseAndUpdateCarModel(response) {
    modelArray = response.replace(/[\[\]\']+/g, '').split('"makeM:' + make + '"')[1].replace(/(\r\n|\n|\r)/gm,"").replace(/, /g, ';').split(";");
    for (i in modelArray) {
        document.getElementById('model').add(new Option(modelArray[i]));
    };
    $("#model").fadeIn();
}

function parseAndUpdateCarYear(response) {
    yearArray = response.replace(/u\'/g, '').replace(/[\[\]\']+/g, '').split('"makeY:' + make + ':model:' + model + '"')[1].replace(/(\r\n|\n|\r)/gm,"").replace(/, /g, ';').split(";");
    uniqueYear = [];

    $.each(yearArray, function(i, el) {
        if($.inArray(el, uniqueYear) === -1) uniqueYear.push(el);
    });
    uniqueYear.forEach(function(entry) {
        document.getElementById('year').add(new Option(entry));
    });
    $("#year").fadeIn();
}

function parseAvgMpg(response) {
    total = 0;
    count = 0;
    avgMsgArray = response.replace(/u\'/g, '').replace(/[\[\]\']+/g, '').split('"makeMpg:' + make + ':model:' + model + ':year:' + year + '"')[1].replace(/(\r\n|\n|\r)/gm,"").replace(/, /g, ';').split(";");
    avgMsgArray.forEach(function(entry) {
        total = total + parseFloat(entry);
        count = count + 1;
    });
    avgMpg = total/count;
    calculateCost.sendAvgMpg(avgMpg);
    document.getElementById('avgKml').innerHTML = 'average KM/L <strong>' + Math.round((0.425143707 * avgMpg) * 100) / 100 + '</strong>';
    document.getElementById('vehicleInfo').innerHTML = year + ' ' + make + ' ' + model;
    $("#vehicleInfo").fadeIn();
    $("#avgMpg").fadeIn();
}

self = {
    getCarMake: getCarMake,
    getCarModel: getCarModel,
    getCarYear: getCarYear,
    getAvgMpg: getAvgMpg,
    parseAndUpdateCarMake: parseAndUpdateCarMake,
    parseAndUpdateCarModel: parseAndUpdateCarModel,
    parseAndUpdateCarYear: parseAndUpdateCarYear,
    parseAvgMpg: parseAvgMpg,
};

exports = self;