document.addEventListener("DOMContentLoaded", function() {
  "use strict";

  var GENERIC_ERROR = "Sorry, but that didn't work. Could you try again in a minute?";

  function getOrg() {
    var orgs = ['dp', 'fftf'];

    for (var i = 0; i < orgs.length; i++) {
      if (window.location.href.indexOf('source=' + orgs[i]) !== -1) {
        return orgs[i];
      }
    }

    // random org
    return orgs[Math.floor(Math.random()*orgs.length)];
  }

  var app = new Vue({
    el: '#app',

    created: function() {
      window.addEventListener('scroll', this.handleScroll);
    },

    destroyed: function() {
      window.removeEventListener('scroll', this.handleScroll);
    },

    data: function() {
      return {
        name: null,
        email: null,
        phone: null,
        zipCode: null,
        modalVisible: false,
        socialSidebarVisible: false,
        formIsStuck: false,
        isLoading: false,
        formMessage: null,
        org: getOrg()
      }
    },

    computed: {
      isDemandProgressPage: function() {
        return this.org === 'dp';
      }
    },

    methods: {
      submitForm: function() {
        if (this.isDemandProgressPage) {
          this.submitDPForm();
        }
        else {
          this.submitFFTFForm();
        }
      },

      submitDPForm: function() {
        var self = this;
        self.isLoading = true;
        self.$refs.dpForm.submit();

        setTimeout(function() { 
          self.isLoading = false;
          self.showModal();
          self.resetForm();
        }, 5000);
      },

      submitFFTFForm: function() {
        var self = this;
        self.isLoading = true;
        self.formMessage = null;

        self.$http.post('https://queue.fightforthefuture.org/action', {
          member: {
            first_name: self.name,
            email: self.email,
            postcode: self.zipCode,
            country: 'US'
          },
          hp_enabled: 'true',
          guard: '',
          contact_congress: 0,
          org: self.org,
          an_tags: "[\"privacy\", \"security\"]",
          an_petition_id: '63aaf145-ed87-49a2-a1fc-861d46fc7118'
        }, { emulateJSON: true })
        .then(function(response){
          self.isLoading = false;

          if (response.ok) {
            self.showModal();
            self.resetForm();
          }
          else {
            self.formMessage = GENERIC_ERROR;
          }
        })
        .catch(function(error){
          self.isLoading = false;
          self.formMessage = GENERIC_ERROR;
        })
      },

      resetForm: function() {
        this.name = null;
        this.email = null;
        this.zipCode = null;
        this.isLoading = false;
        this.formMessage = null;
      },

      handleScroll: function() {
        // IE11 uses pageYOffset. everything else uses scrollY
        var scrollY = window.scrollY || window.pageYOffset;

        // Fixed side social container
        this.socialSidebarVisible = (scrollY > this.$refs.header.offsetTop);

        // Sticky form
        var form = this.$refs.form;
        var formBottom = form.offsetTop + form.clientHeight;
        this.formIsStuck = scrollY >= formBottom;
      },

      showModal: function() {
        this.modalVisible = true;
        document.querySelector('body').classList.add('modal-open');
      },

      hideModal: function() {
        this.modalVisible = false;
        document.querySelector('body').classList.remove('modal-open');
      },

      openPopup: function(url, title, w, h) {
        if (!title) {
          title = 'popup';
        }
        if (!w) {
          w = 600;
        }
        if (!h) {
          h = 500;
        }
        // Fixes dual-screen position
        var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
        var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;

        var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
        var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

        var left = ((width / 2) - (w / 2)) + dualScreenLeft;
        var top = ((height / 2) - (h / 2)) + dualScreenTop;
        var newWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

        // Puts focus on the newWindow
        if (window.focus) {
          newWindow.focus();
        }
      },

      shareOnFacebook: function() {
        this.openPopup('http://shpg.org/103/186936/facebook', 'facebook');
      },

      shareOnTwitter: function() {
        this.openPopup('http://shpg.org/103/186933/twitter', 'twitter');
      },
    }
  });
});