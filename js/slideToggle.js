/* slideToggle */

var getCurrent = require('js/getCurrentPosition'),
    getDistance = require('js/getDistance'),
    getCar = require('js/getCar'),
    calculateCost = require('js/calculateCost'),
    opts = {
      lines: 7, // The number of lines to draw
      length: 0, // The length of each line
      width: 10, // The line thickness
      radius: 11, // The radius of the inner circle
      corners: 1, // Corner roundness (0..1)
      rotate: 0, // The rotation offset
      direction: 1, // 1: clockwise, -1: counterclockwise
      color: '#FFF', // #rgb or #rrggbb or array of colors
      shadow: false, // Whether to render a shadow
    },
    spinner = new Spinner(opts).spin(),
    historyTable = document.getElementById('historyTable'),
    input = document.getElementById('destinationInput'),
    historyCount = 1,
    totalHistoryCost = 0.0,
    arr = [],
    item;

var _old = $.fn.fadeIn;

$.fn.fadeIn = function(){
    var self = this;
    _old.apply(this,arguments).promise().done(function(){
        self.trigger("fadeIn");
    });
};

function arrowChange(name) {
    var $t = $('#' + name + 'Panel');
    if ($t.is(':visible')) {
        if (name == "totalTripCost") $("#" + name + "Arrow").addClass('glyphicon-refresh').removeClass('glyphicon-chevron-down');
        else $("#" + name + "Arrow").addClass('glyphicon-chevron-down').removeClass('glyphicon-chevron-up');
    } else {
        if (name == "totalTripCost") $("#" + name + "Arrow").addClass('glyphicon-refresh').removeClass('glyphicon-chevron-down');
        else $("#" + name + "Arrow").addClass('glyphicon-chevron-up').removeClass('glyphicon-chevron-down');
    }
}

$("#dialog").dialog({
    autoOpen: false,
    show: {
      effect: "fadeIn",
      duration: 50
    },
    hide: {
      effect: "fadeOut",
      duration: 50
    }
});

$("#dialogHistory").dialog({
    autoOpen: false,
    show: {
      effect: "fadeIn",
      duration: 50
    },
    hide: {
      effect: "fadeOut",
      duration: 50
    }
});

$(document).ready(function () {
    sortLocalStorageKeys();
    document.getElementById('loadingPlaceHolder').appendChild(spinner.el);
    $("#routeFlip").click(function () {
        $("#routePanel").slideToggle("fast", "linear", arrowChange('route'));
    });
    $("#carFlip").click(function () {
        $("#carPanel").slideToggle("fast", "linear", arrowChange('car'));
    });
    $("#make").hide();
    $("#model").hide();
    $("#year").hide();

    $('select[id=make]').change(function() {
      window.localStorage.setItem('make', $(this).val());
    });

    $('select[id=model]').change(function() {
      window.localStorage.setItem('model', $(this).val());
    });

    $('select[id=year]').change(function() {
      window.localStorage.setItem('year', $(this).val());
    });
    $("#dialog").dialog("option", "height", 400);
    $("#dialog").dialog("option", "width", $(window).width() * 0.85);
    $("#dialogHistory").dialog("option", "height", 250);
    $("#dialogHistory").dialog("option", "width", $(window).width() * 0.85);

    $(".ui-widget-header").click(function () { $(".dialogClass").dialog("close"); });

    $("#info").click(function() {
      $("#dialog").dialog("open").scrollTop(0, 0);
    });
    $("#history").click(function() {
      $("#dialogHistory").dialog("open").scrollTop(0, 0);
    });
    $("#subName").fadeIn(300);
    $("#addToHistory").hide();

    populateHistory();
    deleteHistoryInit();
});

$("#carFlip").one("click", function() {
    item = window.localStorage.getItem('make');
    if (item != null) {
      $('select[id=make]').val(item);
      document.getElementById('make').onchange();
      $("#model").one('fadeIn', function() {
          item = window.localStorage.getItem('model');
          if (item != null) {
              $('select[id=model]').val(item);
              document.getElementById('model').onchange();
              $("#year").one('fadeIn', function() {
                  item = window.localStorage.getItem('year');
                  if (item != null) {
                      $('select[id=year]').val(item);
                      document.getElementById('year').onchange();
                  }
              });
          }
      });
    }
});

function populateHistory() {
  nextKey = arr[0];
  if (typeof nextKey !== "undefined") { historyCount = parseInt(nextKey) + 1; }
  arr.forEach(function(key) {
    var currentHistoryLookup = JSON.parse(window.localStorage.getItem(key));

    var tmpHistory = historyTable.insertRow(-1),
        removeHistory = tmpHistory.insertCell(0),
        cost = tmpHistory.insertCell(1);
        home = tmpHistory.insertCell(2),
        destination = tmpHistory.insertCell(3),
        date = tmpHistory.insertCell(4),
        time = tmpHistory.insertCell(5),
        run = tmpHistory.insertCell(6),

    removeHistory.innerHTML = '<span id="minusButton" class="glyphicon glyphicon-minus minusBtn blue"></span>';
    cost.innerHTML = '<strong>' + currentHistoryLookup[0] + '</strong>';
    home.innerHTML = currentHistoryLookup[1];
    destination.innerHTML = currentHistoryLookup[2];
    date.innerHTML = currentHistoryLookup[3];
    time.innerHTML = currentHistoryLookup[4];
    run.innerHTML = currentHistoryLookup[5];
  });

  $('#historyTable tbody tr td:nth-child(2)').each(function() {
    totalHistoryCost = totalHistoryCost + parseFloat($(this).text().split('$')[1]);
  })
  document.getElementById('totalHistory').innerHTML = '<h5>Total: <strong>$ ' + Math.round(totalHistoryCost * 100) / 100 + '</strong></h5>'
}

function deleteHistoryInit() {
  $('.minusBtn').click(function(){
    $(this).closest("tr").fadeOut(500, function () {
      var itemToDelete = $(this).find('td:eq(6)').text();
      var costToRemove = JSON.parse(window.localStorage.getItem(itemToDelete))[0];
      totalHistoryCost = totalHistoryCost - parseFloat(costToRemove.split('$')[1]);
      window.localStorage.removeItem(itemToDelete);
      $('#totalHistory').fadeOut(200);
      document.getElementById('totalHistory').innerHTML = '<h5>Total: <strong>$ ' + Math.round(totalHistoryCost * 100) / 100 + '</strong></h5>'
      $('#totalHistory').fadeIn(200);
    });
  });
}

$("#totalTripCostFlip").click(function () {
    if (document.getElementById("destinationInput").value === "") {
      alert("Unable to get route.\nPlease enter a destination");
      return;
    } else if (document.getElementById("avgKml").innerHTML === "") {
      alert("Unable to get vehicle mpg.\nPlease select a vehicle");
      return;
    }
    $("#totalTripCostPanel").slideDown("fast", "linear", arrowChange("totalTripCost"));
    /*$("#loadingResults").append("<img class='load' style='display: block; margin-left: auto; margin-right: auto;' src='img/resultsLoadingGif.gif' width='30' height='30'/>");*/
    $('html, body').animate({ scrollTop: $('#scrollMarker').offset().top }, "fast");
    getDistance.directionInitialize();
});

$('#gasPrice').keypress(function(event) {
    if ((event.keyCode || event.which) == 13) {
        event.preventDefault();
        return false;
    }
});

$('#addToHistory').click(function () {
  var day = new Date(),
      costValue = '$' + Math.round(calculateCost.returnTotalCost() * 100) / 100,
      homeAddress = getCurrent.returnCurrentAddress(),
      destinationAddress = input.value,
      dateValue = day.toDateString(),
      timeValue = getCurrent.returnTime(),
      runValue = historyCount;

  var arrayHistory = [];
  arrayHistory.push(costValue);
  arrayHistory.push(homeAddress);
  arrayHistory.push(destinationAddress);
  arrayHistory.push(dateValue);
  arrayHistory.push(timeValue);
  arrayHistory.push(runValue);

  window.localStorage.setItem(runValue, JSON.stringify(arrayHistory));
  var runValue = historyCount;

  // insert into dialog
  var tmpHistory = historyTable.insertRow(1),
      removeHistory = tmpHistory.insertCell(0),
      cost = tmpHistory.insertCell(1);
      home = tmpHistory.insertCell(2),
      destination = tmpHistory.insertCell(3),
      date = tmpHistory.insertCell(4),
      time = tmpHistory.insertCell(5);
      run = tmpHistory.insertCell(6);

  removeHistory.innerHTML = '<span id="minusButton" class="glyphicon glyphicon-minus minusBtn blue"></span>';
  var day = new Date();
  cost.innerHTML = '<strong>' + costValue + '</strong>';
  home.innerHTML = homeAddress;
  destination.innerHTML = destinationAddress;
  date.innerHTML = dateValue;
  time.innerHTML = timeValue;
  run.innerHTML = runValue;

  $('#historyTable tr:eq(1)').fadeOut(100);
  $('#totalHistory').fadeOut(100);

  historyCount++;
  deleteHistoryInit();

  $("#dialogHistory").dialog("open").scrollTop(0, 0);

  totalHistoryCost = totalHistoryCost + parseFloat(costValue.split('$')[1]);
  $('#historyTable tr:eq(1)').fadeIn(300);
  document.getElementById('totalHistory').innerHTML = '<h5>Total: <strong>$ ' + Math.round(totalHistoryCost * 100) / 100 + '</strong></h5>'
  $('#totalHistory').fadeIn(1000);
});

function sortLocalStorageKeys() {
    for (key in localStorage) {
        if (localStorage.hasOwnProperty(key) && !isNaN(key)) {
            arr.push(key);
        }
    }
    arr.sort(function(a, b){return b-a});
}

self = {
    arrowChange: arrowChange,
}

exports = self;