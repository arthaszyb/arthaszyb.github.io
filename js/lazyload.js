document.addEventListener('DOMContentLoaded', function() {
  var images = document.querySelectorAll('img[data-src]');
  if ('IntersectionObserver' in window) {
    let observer = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          let img = entry.target;
          img.src = img.getAttribute('data-src');
          img.onload = function() { img.classList.add('lazyloaded'); };
          observer.unobserve(img);
        }
      });
    });
    images.forEach(function(img) { observer.observe(img); });
  } else {
    // Fallback for old browsers
    images.forEach(function(img) {
      img.src = img.getAttribute('data-src');
      img.onload = function() { img.classList.add('lazyloaded'); };
    });
  }
});
