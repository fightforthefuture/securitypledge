(function (doc, win) {
  "use strict";

  var sideShareButtons = doc.getElementById('fixed-side-social-container');
  var form = doc.getElementById('action-network-form');
  var formBottom = form.offsetTop + form.clientHeight;
  var wrapper = doc.querySelectorAll('.form-wrapper')[0];

  win.addEventListener('scroll', function() {
    // Fixed side social container
    if (win.scrollY > doc.querySelector('header').offsetTop) {
      sideShareButtons.classList.add('fade-in');
    } else {
      sideShareButtons.classList.remove('fade-in')
    }

    // Sticky form
    if (win.scrollY >= formBottom) {
      form.classList.add('stuck');
      wrapper.classList.add('stuck');
    } else {
      form.classList.remove('stuck');
      wrapper.classList.remove('stuck');
    }
  });

  var util = {
    parseQueryString: function() {
      var queryString = window.location.search;
      var queryObject = {};

      if (queryString[0] === '?') {
        queryString = queryString.substr(1);
      }

      var pairs = queryString.split('&');
      var i = pairs.length;

      while (i--) {
        queryObject[pairs[i].split('=')[0]] = pairs[i].split('=')[1];
      }

      return queryObject;
    }
  };

  var ref = util.parseQueryString();

  if (ref.ref) {
    var tagList = form['signature[tag_list]'].value;
    if (tagList) {
      tagList = JSON.parse(tagList);
      tagList.push('from-' + ref.ref);
      form['signature[tag_list]'].value = JSON.stringify(tagList);
    }
  }
})(document, window);
