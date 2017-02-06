(function (doc, win) {
  var
    form = doc.getElementById('action-network-form'),
    formBottom = form.offsetTop + form.clientHeight;

  win.addEventListener('scroll', function () {
    var currentTop = win.scrollY;

    if (currentTop > formBottom) {
        form.classList.add('stuck');
    } else {
      form.classList.remove('stuck');
    }
  });
}(document, window));
