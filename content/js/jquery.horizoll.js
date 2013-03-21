/*

  Keyboard and mouse enabled horizontal screen
  scrolling plugin, with automatic realignment.

  Written in 2013 by Suraj N. Kurapati for
  Readably https://github.com/sunaku/readably
  and thus distributed under the ISC license.

  Requires: jQuery 1.2.6 or newer
  http://docs.jquery.com/Release:jQuery_1.2.6

  Optional: jquery-mousewheel 3.1.3 or newer
  https://github.com/brandonaaron/jquery-mousewheel

*/
$(function() {

  // scrolls the screen horizontally by given amount
  function scroll(leftward, amount) {
    if (typeof(leftward) === 'boolean') {
      amount = (leftward ? '-=' : '+=') + amount;
    }
    $('body, html').animate({ scrollLeft: amount });
  }

  // computes page boundary based on screen width
  function stride() {
    var panorama = $(document).width();
    var viewport = $('html').width();
    var boundary = Math.round(panorama / Math.round(panorama / viewport));
    return Math.max(viewport, boundary);
  }

  // aligns the screen to the nearest page boundary
  function align() {
    var limit = stride();
    var depth = $(document).scrollLeft() % limit;
    if (depth > 0) {
      if (depth < Math.round(limit / 2)) {
        scroll(true, depth);
      }
      else {
        scroll(false, limit - depth);
      }
    }
  }

  // traverse page boundaries using the keyboard
  $(document).bind('keydown', function(event) {
    switch (event.keyCode) {
      case 33: // page up
      case 37: // left arrow
      case 38: // up arrow
        scroll(true, stride());
        break;

      case 34: // page down
      case 39: // right arrow
      case 40: // down arrow
        scroll(false, stride());
        break;

      case 36: // home
        scroll(null, 0);
        break;

      case 35: // end
        scroll(null, $(document).width());
        break;
    }
  });

  // traverse page boundaries using the mouse wheel
  $(document).bind('mousewheel', function(event, delta, deltaX, deltaY) {
    if (delta !== 0 && deltaX === 0) {
      scroll(deltaY === 1, stride());
    }
  });

  // automatically realign to nearest page boundary
  $(window).bind('resize', align);
  setTimeout(align, 500);

});
