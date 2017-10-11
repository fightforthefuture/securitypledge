(function () {
  "use strict";

  var launch = new Date('November 1, 2017');
  var deadline = new Date('November 6, 2018');

  var since = document.getElementById('days-since');
  var remaining = document.getElementById('days-remaining');

  function getTimeRemaining() {
    var since = new Date() - launch;
    var remaining = deadline - new Date();
    var remainingDays = Math.floor( remaining / (1000 * 60 * 60 * 24) );

    return {
      'since': Math.ceil( since / (1000 * 60 * 60 * 24) ),
      'remaining': remainingDays > 0 ? remainingDays : 0
    };
  }

  function pluralDays(days) {
    return (days === 1) ? 'day' : 'days';
  }

  var time = getTimeRemaining();
  since.textContent = time.since + ' ' + pluralDays(time.since);
  remaining.textContent = time.remaining + ' ' + pluralDays(time.remaining);
})();
