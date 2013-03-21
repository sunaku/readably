//
// Keyboard and mouse enabled horizontal screen
// scrolling logic, with automatic realignment.
//
// Written in 2013 by Suraj N. Kurapati for
// Readably https://github.com/sunaku/readably
//
$(document).ready(function() {
  var scroll = function(ascend, amount) {
    if (typeof(ascend) === 'boolean') {
      amount = (ascend ? '-=' : '+=') + amount;
    }
    $('body, html').animate({ scrollLeft: amount });
  };

  // computes the effective width of a screen page
  var boundary = function() {
    var panorama = $(document).width();
    var viewport = $('html').width();
    var interval = Math.round(panorama / Math.round(panorama / viewport));
    return Math.max(viewport, interval);
  }

  // aligns the screen to the nearest page boundary
  var align = function() {
    var limit = boundary();
    var error = $(document).scrollLeft() % limit;
    if (error > 0) {
      if (error < Math.round(limit / 2)) {
        scroll(true, error);
      }
      else {
        scroll(false, limit - error);
      }
    }
  };

  // travel between screen pages using the keyboard
  $(document).bind('keydown', function(event) {
    switch (event.keyCode) {
      case 33: // page up
      case 37: // left arrow
      case 38: // up arrow
        scroll(true, boundary());
        break;

      case 34: // page down
      case 39: // right arrow
      case 40: // down arrow
        scroll(false, boundary());
        break;

      case 36: // home
        scroll(null, 0);
        break;

      case 35: // end
        scroll(null, $(document).width());
        break;
    }
  });

  // travel between screen pages using the mouse wheel
  $(document).bind('mousewheel', function(event, delta, deltaX, deltaY) {
    if (delta !== 0 && deltaX === 0) {
      scroll(deltaY === 1, boundary());
    }
  });

  // align the screen to a page boundary automatically
  var settle = function() { setTimeout(align, 500); };
  $(window).bind('resize', settle);
  settle();
});
