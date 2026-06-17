// Tufte-style sidenotes: move footnote definitions into the right margin on
// wide screens, aligned with their reference. Falls back to bottom-of-page
// footnotes on narrow screens. Does nothing if there are no footnotes.
(function () {
  var article = document.querySelector('.article');
  if (!article) return;

  var defs = [].slice.call(article.querySelectorAll('.footnote-definition'));
  if (!defs.length) return;

  var MIN_WIDTH = 1080; // viewport width needed before sidenotes appear

  function layout() {
    var wide = window.innerWidth >= MIN_WIDTH;
    article.classList.toggle('has-sidenotes', wide);

    if (!wide) {
      defs.forEach(function (d) { d.style.top = ''; });
      return;
    }

    var artTop = article.getBoundingClientRect().top + window.scrollY;
    var prevBottom = -Infinity;

    defs.forEach(function (def) {
      var ref = article.querySelector('.footnote-reference a[href="#' + def.id + '"]');
      if (!ref) return;
      var refTop = ref.getBoundingClientRect().top + window.scrollY - artTop;
      // Avoid overlapping the previous note.
      var top = Math.max(refTop, prevBottom + 12);
      def.style.top = top + 'px';
      prevBottom = top + def.offsetHeight;
    });
  }

  window.addEventListener('resize', layout);
  window.addEventListener('load', layout);
  // MathJax can reflow the article after it typesets — re-run once it settles.
  setTimeout(layout, 1200);
  layout();
})();
