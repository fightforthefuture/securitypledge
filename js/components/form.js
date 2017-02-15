(function (doc, win) {
  "use strict";

  var
    actionNetworkForm = doc.getElementById('action-network-form') || doc.createElement('div');

  function preSubmit() {
    /**
     * Fires up the loading modal and disables the form
     * @return {object} - modal with spinner
     * */

    var
      loadingContainer = doc.createElement('div'),
      loadingCopy = doc.createElement('h2'),
      loadingSpinner = doc.createElement('div');

    loadingSpinner.classList.add('circle-spinner', 'large');
    loadingCopy.textContent = 'Please wait one moment…';

    loadingContainer.classList.add('loading');
    loadingContainer.appendChild(loadingCopy);
    loadingContainer.appendChild(loadingSpinner);

    win.modals.generateModal({
      contents: loadingContainer,
      disableOverlayClick: true
    });

    actionNetworkForm.commit.setAttribute('disabled', true);
  }

  function compilePayloadPetition() {
    /**
     * Compiles FormData to send off to mothership queue
     *
     * @return {FormData} formData
     * */

    var
      tags = JSON.parse(actionNetworkForm['signature[tag_list]'].value),
      formData = new FormData();

    formData.append('guard', '');
    formData.append('hp_enabled', true);
    formData.append('org', 'fftf');
    formData.append('tag', actionNetworkForm.dataset.mothershipTag);
    formData.append('an_tags', JSON.stringify(tags));
    formData.append('an_url', win.location.href);
    formData.append('an_petition', actionNetworkForm.action.replace(/\/signatures\/?/, ''));
    formData.append('member[first_name]', actionNetworkForm['signature[first_name]'].value);
    formData.append('member[email]', actionNetworkForm['signature[email]'].value);
    // formData.append('member[postcode]', actionNetworkForm['signature[zip_code]'].value);
    formData.append('member[country]', 'US');

    if (actionNetworkForm['member[phone_number]'] && actionNetworkForm['member[phone_number]'].value !== '') {
      formData.append('member[phone_number]', actionNetworkForm['member[phone_number]'].value);
    }

    return formData;
  }

  function fireThankYouModal() {

    var
      shareContent = doc.createElement('div'),
      shareHeadline = doc.createElement('h1'),
      shareCopy = doc.createElement('p'),
      shareThis = doc.createElement('div'),
      thankYou = doc.createElement('p'),
      tweetButton = doc.getElementById('tweet-button').cloneNode(),
      shareButton = doc.getElementById('share-button').cloneNode();

    win.modals.dismissModal();

    tweetButton.classList.add('share-icon');
    shareButton.classList.add('share-icon');

    shareHeadline.textContent = "Thank you!";  
    shareCopy.textContent = "We'll send your signature along, but one more thing first:";

    function createRadio(options) {
      var groupbox = doc.createElement('groupbox');
      var radiogroup = doc.createElement('radiogroup');
      var radio;
      var button;
      
      if (options.label) {
        groupbox.appendChild(createLabel({
          textContent: "Do you work in tech?"
        }));
      }

      for (var i = 0; i < options.buttons.length; i++) {
        radio = doc.createElement('input');
        radio.type = "radio";

        button = options.buttons[i];

        if (button.id) radio.id = button.id;
        if (options.name) radio.setAttribute('name', options.name);

        if (button.label) {
          radiogroup.appendChild(createLabel({
            input: radio,
            textContent: button.label
          }));
        }

        radiogroup.appendChild(radio);
      }

      groupbox.appendChild(radiogroup);

      return groupbox;
    }

    function createInput(options) {
      var input = doc.createElement('input');

      if (options.type) input.type = options.type;
      if (options.id) input.id = options.id;
      if (options.class) input.class = options.class;
      if (options.name) input.name = options.name;
      if (options.placeholder) input.placeholder = options.placeholder;
      if (options.required) input.required = true;

      return input;
    }

    function handleRadio(event) {
      event.target.control.checked = true;
    }

    function createLabel(options) {
      var label = doc.createElement('label');

      if (options.input) label.setAttribute('for', options.input.getAttribute('id'));
      if (options.class) label.classList.add(options.class);
      if (options.textContent) label.textContent = options.textContent;

     label.addEventListener('click', handleRadio);

      return label;
    }

    var followupForm = doc.createElement('form');

    var tech = createRadio({
      id: "work-in-tech",
      name: "signature[tech]",
      label: "Do you work in tech?",
      buttons: [
        { id: "yes", label: "Yes", },
        { id: "no", label: "No", }
      ]
    });

    followupForm.appendChild(tech);

    var employer = createInput({
      type: "text",
      id: "employer",
      name: "signature[employer]",
      placeholder: "Comapny Name",
      class: "visually-hidden"
    });

    followupForm.appendChild(createLabel({
      input: employer,
      content: "For whom?",
      class: "visually-hidden"
    }));
    followupForm.appendChild(employer);

    var submit = doc.createElement('input');
    submit.type = "submit";
    submit.classList.add('submit');
    followupForm.appendChild(submit);

    // submission.open('PUT', 'https://queue.fightforthefuture.org/action', true);
    // submission.send(compilePayloadPetition());

    shareThis.classList.add('share-icons');
    shareThis.appendChild(tweetButton);
    shareThis.appendChild(shareButton);

    thankYou.textContent = 'Thanks for signing!';
    thankYou.classList.add('thanks');

    shareContent.appendChild(shareHeadline);
    shareContent.appendChild(shareCopy);
    shareContent.appendChild(followupForm);
    shareContent.appendChild(shareThis);

    actionNetworkForm.commit.removeAttribute('disabled');

    win.modals.generateModal({contents: shareContent});

    actionNetworkForm.parentNode.insertBefore(thankYou, actionNetworkForm);
  }

  function confirmSMSSubmission() {
    actionNetworkForm.reset();
    doc.getElementById('form-phone_number').setAttribute('value', 'All set!');
    doc.getElementById('form-phone_number').setAttribute('disabled', true);
    doc.getElementById('submit-phone').setAttribute('disabled', true);
  }

  function submitForm(event) {
    /**
     * Submits the form to ActionNetwork or Mothership-Queue
     *
     * @param {event} event - Form submission event
     * */

    event.preventDefault();

    var
      submission = new XMLHttpRequest();

    /*
    if (actionNetworkForm['signature[zip_code]'].value === '') {
      // Since iOS Safari doesn’t do its goddamn job.
      return;
    }
    */

    if (!actionNetworkForm['member[phone_number]'] || actionNetworkForm['member[phone_number]'].value === '') {
      preSubmit();
    }

    function handleHelperError(e) {
      /**
       * Figures out what to say at just the right moment
       * @param {event|XMLHttpRequest} e - Might be an event, might be a response
       * from an XMLHttpRequest
       * */

      win.modals.dismissModal();

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

      actionNetworkForm.commit.removeAttribute('disabled');

      win.modals.generateModal({contents: errorMessageContainer});
    }

    function loadHelperResponse() {
      /**
       * Does the thing after we get a response from the API server
       * */

      if (submission.status >= 200 && submission.status < 400) {
        if (actionNetworkForm['member[phone_number]'] && actionNetworkForm['member[phone_number]'].value !== '') {
          confirmSMSSubmission();
        } else {
          fireThankYouModal();
        }
      } else {
        handleHelperError(submission);
      }
    }

    submission.open('POST', 'https://queue.fightforthefuture.org/action', true);
    submission.addEventListener('error', handleHelperError);
    submission.addEventListener('load', loadHelperResponse);
    submission.send(compilePayloadPetition());
  }

  actionNetworkForm.addEventListener('submit', submitForm);

})(document, window);
