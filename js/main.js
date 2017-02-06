(function (doc, win) {
  "use strict";

  var since = doc.getElementById('days-since'),
    remaining = doc.getElementById('days-remaining'),
    launch = new Date('February 1, 2017'),
    deadline = new Date('January 1, 2018');

  function getTimeRemaining() {
    var since = new Date() - launch;
    var remaining = deadline - new Date();
    console.log(launch, deadline, since, remaining);
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

  var
    i,
    form = doc.getElementById('petition-form'),
    endorsements = doc.getElementById('endorsements'),
    endorsementToggle = doc.getElementById('toggle-list') || doc.createElement('button');

  endorsementToggle.addEventListener('click', function (e) {
    e.preventDefault();

    endorsements.classList.toggle('hidden');
    endorsementToggle.remove();
  });

  var util = {

    parseQueryString: function () {
      var
        i,
        pairs,
        queryObject = {},
        queryString = window.location.search;

      if (queryString[0] === '?') {
        queryString = queryString.substr(1);
      }

      pairs = queryString.split('&');
      i = pairs.length;

      while (i--) {
        queryObject[pairs[i].split('=')[0]] = pairs[i].split('=')[1];
      }

      return queryObject;
    }
  };

  var ref = util.parseQueryString();

  if (ref.ref) {
    var tagList = doc.getElementById('action-network-form')['signature[tag_list]'].value;
    if (tagList) {
      tagList = JSON.parse(tagList);
      tagList.push('from-'+ref.ref);
      doc.getElementById('action-network-form')['signature[tag_list]'].value = JSON.stringify(tagList);
    }
  }

  var twitterConnectButtons = document.querySelectorAll('a[href="#twitter"]');
  for (i = 0; i < twitterConnectButtons.length; i++) {
    twitterConnectButtons[i].addEventListener('click', function(e) {
      e.preventDefault();
      var url = 'https://mothership-js.fightforthefuture.org/connect/twitter?tag=tpp';
      var properties = 'width=600,height=500,toolbar=no,status=no,menubar=no';

      window.open(url, 'idl_connect', properties);
    });
  }

})(document, window);
