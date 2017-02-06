(function (doc, win) {
  var
    form = doc.getElementById('action-network-form'),
    prevTop = 0;

  win.addEventListener('scroll', function () {
    var
      currentTop = win.scrollY;

    if (currentTop < prevTop) {
      if (currentTop > 0 && form.classList.contains('scrolled')) {
        form.classList.add('stuck');
      } else {
        form.classList.remove('stuck', 'scrolled');
      }
    } else {

      form.classList.remove('stuck');

      if (currentTop > form.clientHeight) {
        form.classList.add('scrolled')
      }
    }

    prevTop = currentTop;
  });
}(document, window));
