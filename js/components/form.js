(function (doc, win) {
  "use strict";

  var actionNetworkForm = doc.getElementById('action-network-form');
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
})(document, window);
