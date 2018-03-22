/**
 *
 * @source: https://github.com/fightforthefuture
 *
 * @licstart  The following is the entire license notice for the
 *  JavaScript code in this page.
 *
 * Copyright (C) Fight for the Future
 *
 *
 * The JavaScript code in this page is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License (GNU GPL) as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option)
 * any later version.  The code is distributed WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
 *
 * As additional permission under GNU GPL version 3 section 7, you
 * may distribute non-source (e.g., minimized or compacted) forms of
 * that code without the copy of the GNU GPL normally required by
 * section 4, provided you include this license notice and a URL
 * through which recipients can access the Corresponding Source.
 *
 * @licend  The above is the entire license notice
 * for the JavaScript code in this page.
 *
 */

// modals.js
(function (doc, win) {
  "use strict";

  win.modals = win.modals || {};

  function detectEscKey(e) {
    if (e.code === 'Escape' || e.which === 27) {
      win.removeEventListener('keyup', detectEscKey);
      return true;
    }
  }

  function generateModal(options) {
    /**
     * Triggers a modal
     *
     * @param {node} options.contents - any HTML to be used as modal content
     * (also accepts array of nodes)
     * @param {boolean} options.disableOverlayClick - if false (or absent),
     * function adds event listener to allow dismissal of modal by clicking on
     * overlay.
     * @param {boolean} options.noFrame - if true, adds `no-frame` class to
     * modal content element.
     * @param {boolean} options.noFrame - a function that will be called when the
     * modal is closed.
     * @return {Object} an object with a dismissModal method to close the modal
     * */

    var
      i,
      contents = options.contents,
      onClose  = options.onClose,
      body     = doc.getElementsByTagName('body')[0],
      overlay  = doc.createElement('div'),
      modal    = doc.createElement('div'),
      closeModal;

    if (typeof contents === 'object') {
      if (contents.length === undefined) {
        contents = [contents];
      }
    } else {
      return false;
    }

    overlay.classList.add('overlay');
    modal.classList.add('modal-content', 'visible');

    function dismissModal() {
      /**
       * Removes modal from DOM
       * */

      overlay.classList.remove('visible');
      modal.classList.remove('visible');
      doc.querySelector('body').classList.remove('modal-present');

      win.setTimeout(function () {
        while (modal.firstChild) {
          modal.removeChild(modal.firstChild);
        }

        modal.remove();
        overlay.remove();

        if (typeof options.onClose === 'function') options.onClose();
      }, 420);
    }

    if (options.noFrame) {
      modal.classList.add('no-frame');
    }

    if (!options.disableOverlayClick) {
      closeModal = doc.createElement('button');
      closeModal.classList.add('close-modal');
      closeModal.textContent = '\u00D7';
      modal.appendChild(closeModal);
      closeModal.addEventListener('click', dismissModal);
      overlay.addEventListener('click', dismissModal);
    }

    for (i = 0; i < contents.length; i++) {
      modal.appendChild(contents[i]);
    }

    body.appendChild(overlay);
    body.appendChild(modal);
    doc.querySelector('body').classList.add('modal-present');

    win.setTimeout(function () {
      overlay.classList.add('visible');
    }, 50);

    win.addEventListener('keyup', function(event) {
      if (detectEscKey(event)) dismissModal();
    });

    return {
      dismissModal: dismissModal
    };
  }

  win.modals.generateModal = generateModal;
}(document, window));

// form.js
(function (doc, win) {
  "use strict";

  var actionNetworkForm = doc.getElementById('action-network-form');
  var demandProgressForm = doc.getElementById('dp-form');
  var submitted = false;
  var modal;
  var timer;

  function compileFormData() {
    /**
     * Compiles FormData to send off to mothership queue
     *
     * @return {FormData} formData
     * */

    var tags = JSON.parse(actionNetworkForm['signature[tag_list]'].value);
    var formData = new FormData();

    formData.append('guard', '');
    formData.append('hp_enabled', true);
    formData.append('org', 'fftf');
    formData.append('tag', actionNetworkForm.dataset.mothershipTag);
    formData.append('an_tags', JSON.stringify(tags));
    formData.append('an_url', win.location.href);
    formData.append('an_petition', actionNetworkForm.action.replace(/\/signatures\/?/, ''));
    formData.append('member[first_name]', actionNetworkForm['signature[first_name]'].value);
    formData.append('member[email]', actionNetworkForm['signature[email]'].value);

    if (actionNetworkForm['signature[tech_worker]'].value !== '') {
      formData.append('member[tech_worker]', actionNetworkForm['signature[tech_worker]'].value === 'yes' ? true : false);

      if (actionNetworkForm['signature[employer]'].value !== '') {
        formData.append('member[employer]', actionNetworkForm['signature[employer]'].value);
      }
    }

    return formData;
  }

  function submitForm(event) {
    /**
     * Submits the form to ActionNetwork or Mothership-Queue
     *
     * @param {event} event - Form submission event
     * */

    if (event) event.preventDefault();
    
    // If form has already been submitted, return early.
    if (submitted) return;

    // Start form submission.
    submitted = true;

    var submission = new XMLHttpRequest();

    var modalCopyNode = doc.querySelectorAll('.modal-content .copy');
    if (modalCopyNode.length) modalCopyNode[0].textContent = 'Thanks for signing!';

    function handleHelperSuccess() {
      clearTimeout(timer);
      win.removeEventListener('beforeunload', submitForm);
    }

    function handleHelperError(e) {
      /**
       * Figures out what to say at just the right moment
       * @param {event|XMLHttpRequest} e - Might be an event, might be a response
       * from an XMLHttpRequest
       * */

      modal.dismissModal();

      // Form submission failed, allow new attempt.
      submitted = false;

      var
        error = e || {},
        errorMessageContainer = doc.createElement('div'),
        errorMessage = doc.createElement('h2'),
        errorMessageInfo = doc.createElement('p');

      errorMessage.textContent = 'Something went wrong';

      if (error.type) {
        errorMessageInfo.textContent = 'There seems to be a problem somewhere in between your computer and our server. Might not be a bad idea to give it another try.';
      } else if (error.status) {
        errorMessageInfo.textContent = '(the nerdy info is that the server returned a status of "' + error.status + '" and said "' + error.statusText + '".)'
      } else {
        errorMessageInfo.textContent = 'this seems to be a weird error. the nerds have been alerted.';
      }

      errorMessageContainer.appendChild(errorMessage);
      errorMessageContainer.appendChild(errorMessageInfo);

      win.modals.generateModal({contents: errorMessageContainer});
    }

    function loadHelperResponse() {
      /**
       * Does the thing after we get a response from the API server
       * */

      if (submission.status >= 200 && submission.status < 400) {
        handleHelperSuccess();
      } else {
        handleHelperError(submission);
      }
    }

    submission.open(actionNetworkForm.getAttribute('method'), 'https://queue.fightforthefuture.org/action', true);
    submission.addEventListener('error', handleHelperError);
    submission.addEventListener('load', loadHelperResponse);
    submission.send(compileFormData());
  }

  function fireThankYouModal(event) {
    event.preventDefault();

    // New signup from home page form, reset submitted status.
    submitted = false;

    var modalForm = actionNetworkForm.cloneNode(true);
    modalForm.classList.remove('dissolve', 'stuck');
    modalForm.querySelectorAll('fieldset.signature')[0].classList.add('hidden');
    modalForm.querySelectorAll('fieldset.tech-worker')[0].classList.remove('hidden');

    var modalContent = doc.createElement('div');
    var upperContent = doc.createElement('div');
    upperContent.classList.add('upper');

    var modalHeadline = doc.createElement('h1');
    modalHeadline.textContent = 'Thank you!';  
    upperContent.appendChild(modalHeadline);

    var modalCopy = doc.createElement('p');
    modalCopy.classList.add('copy');
    modalCopy.textContent = "We'll send your signature along, but one more thing first:";
    upperContent.appendChild(modalCopy);

    var lowerContent = doc.createElement('div');
    lowerContent.classList.add('lower');
    lowerContent.appendChild(modalForm);

    var shareThis = doc.querySelectorAll('.share-this')[0].cloneNode();

    var twitter = doc.getElementById('footer-tweet').cloneNode();
    twitter.textContent = 'Share on Twitter';
    shareThis.appendChild(twitter);

    var facebook = doc.getElementById('footer-share').cloneNode();
    facebook.textContent = 'Share on Facebook';
    shareThis.appendChild(facebook);

    lowerContent.appendChild(shareThis);

    function handleRadio(event) {
      event.currentTarget.control.checked = true;

      modalForm.querySelectorAll('fieldset.tech-worker')[0].classList.add('hidden');

      if (event.currentTarget.control.value === 'yes') {
        // Ask for tech industry employer before submitting.
        modalForm.querySelectorAll('fieldset.employer')[0].classList.remove('hidden');

        // Setup event listener for emplyoer submit button.
        modalForm.addEventListener('submit', function(event) {
          event.preventDefault();

          modalForm.querySelectorAll('fieldset.employer')[0].classList.add('hidden');
          shareThis.classList.remove('hidden');

          submitForm();
        });
      } else {
        shareThis.classList.remove('hidden');

        // Does not work in tech, submit form now.
        submitForm();
      }
    }

    // Configure tech worker form interaction.
    var labels = modalForm.querySelectorAll('fieldset.radio label');
    for (var i = 0; i < labels.length; i++) {
      labels[i].addEventListener('click', handleRadio);
    }

    modalContent.appendChild(upperContent);
    modalContent.appendChild(lowerContent);

    modal = win.modals.generateModal({
      contents: modalContent,
      onClose: submitForm
    });

    // Submit form after two minutes if it has not already been submitted.
    timer = setTimeout(function() {
      submitForm();
    }, 120000);

    win.addEventListener('beforeunload', submitForm);
  }
  actionNetworkForm.addEventListener('submit', fireThankYouModal);

  // Submit Demand Progress form
  demandProgressForm.addEventListener('submit', function(event) {
    event.preventDefault();

    // New signup from home page form, reset submitted status.
    submitted = false;

    var modalContent = doc.createElement('div');
    var upperContent = doc.createElement('div');
    upperContent.classList.add('upper');

    var modalHeadline = doc.createElement('h1');
    modalHeadline.textContent = 'Thank you!';  
    upperContent.appendChild(modalHeadline);

    var modalCopy = doc.createElement('p');
    modalCopy.classList.add('copy');
    modalCopy.textContent = "Thanks for signing!";
    upperContent.appendChild(modalCopy);

    var lowerContent = doc.createElement('div');
    lowerContent.classList.add('lower');

    var shareThis = doc.querySelectorAll('.share-this')[0].cloneNode();

    var twitter = doc.getElementById('footer-tweet').cloneNode();
    twitter.textContent = 'Share on Twitter';
    shareThis.appendChild(twitter);

    var facebook = doc.getElementById('footer-share').cloneNode();
    facebook.textContent = 'Share on Facebook';
    shareThis.appendChild(facebook);

    lowerContent.appendChild(shareThis);
    shareThis.classList.remove('hidden');

    modalContent.appendChild(upperContent);
    modalContent.appendChild(lowerContent);

    modal = win.modals.generateModal({
      contents: modalContent
    });
  });
})(document, window);

// countdown.js
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


// main.js
(function (doc, win) {
  "use strict";

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

  // Make ?source=dp load the Demand Progress UI
  var isDemandProgressPage = (ref.source === 'dp');
  if (isDemandProgressPage) {
    var body = document.querySelector('body');
    body.classList.remove('fftf');
    body.classList.add('dp');
  }

  var sideShareButtons = doc.getElementById('fixed-side-social-container');
  var form = isDemandProgressPage ? doc.getElementById('dp-form') : doc.getElementById('action-network-form');
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
})(document, window);