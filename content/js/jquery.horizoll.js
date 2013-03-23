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

  // Computes the width of a page (amount of content that fits on a screen).
  function boundary() {
    var panorama = $(document).width();
    var viewport = $('html').width();
    var interval = Math.round(panorama / Math.round(panorama / viewport));
    return Math.max(viewport, interval);
  }

  // Scrolls the screen horizontally to the given location, which can be
  // an absolute pixel offset (number) or one of the following (string):
  //
  // 'left':  if not aligned, scroll to start of current page;
  //          otherwise, scroll to start of previous page
  //
  // 'right': scroll to start of next page
  //
  // 'align': if beyond half of current page, scroll to start of next page;
  //          otherwise, scroll to start of current page
  //
  // In either case, the screen will be left-aligned to a page boundary.
  //
  function horizoll(where) {
    var start = typeof where === 'number' ? where : $(document).scrollLeft();
    var limit = boundary();
    var depth = start % limit;
    var space = limit - depth;
    switch (where) {
      case 'left' : where = start - (depth > 0 ? depth : limit); break;
      case 'right': where = start + (depth > 0 ? space : limit); break;
      case 'align': if (depth >= space) { where = start + space; break; }
      default     : where = start - depth; // ELSE for above IF falls through
    }
    $('body, html').animate({ scrollLeft: where });
  }

  // Aligns the screen to the nearest page boundary
  // while ensuring that any hash target is visible.
  function realign() {
    var target = $(':target');
    if (target.length) {
      horizoll(target.offset().left);
    }
    else {
      horizoll('align');
    }
  }

  // traverse page boundaries using the keyboard
  $(document).bind('keydown', function(event) {
    if (!event.target.hasOwnProperty('form')) { // don't intercept form input
      switch (event.keyCode) {
        case 33: // page up
        case 37: // left arrow
        case 38: // up arrow
          horizoll('left');
          break;

        case 34: // page down
        case 39: // right arrow
        case 40: // down arrow
          horizoll('right');
          break;

        case 36: // home key
          horizoll(0);
          break;

        case 35: // end key
          horizoll($(document).width());
          break;
      }
    }
  });

  // traverse page boundaries using the mouse wheel
  $(document).bind('mousewheel', function(event, delta, deltaX, deltaY) {
    if (!event.target.hasOwnProperty('form')) { // don't intercept form input
      if (delta !== 0 && deltaX === 0) {
        horizoll(deltaY > 0 ? 'left' : 'right');
      }
    }
  });

  // automatically realign to nearest page boundary
  $(window).bind('resize', realign);
  setTimeout(realign, 500);

});
