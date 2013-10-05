/*

  Keyboard and mouse enabled horizontal screen
  scrolling plugin, with automatic realignment.

  Written in 2013 by Suraj N. Kurapati for
  Readably https://github.com/sunaku/readably
  and thus distributed under the ISC license.

  Requires: "column-gap: 0" to be set in CSS.
  Otherwise, page alignment will be incorrect.

  Requires: jQuery 1.2.6 or newer
  http://docs.jquery.com/Release:jQuery_1.2.6

  Optional: jquery-mousewheel 3.1.3 or newer
  https://github.com/brandonaaron/jquery-mousewheel

*/
$(function() {
  var $window   = $(window),
      $document = $(document),
      $screen   = $('html,body'),
      wheeling  = false;

  // Computes the width of a page (amount of content that fits on a screen).
  function boundary() {
    //
    // +-----FRAME-----+        <-- FRAME measures the browser window size
    // | +---IMAGE---+ |        <-- IMAGE measures the content canvas size
    // | |...........| |
    // | |...USAGE...| |        <-- USAGE is amount of FRAME used by IMAGE
    // | |...........| |
    // | +-----------+ |
    // +---------------+
    //
    var frame = $window.width(),
        image = $screen.width(),
        usage = image / frame;

    // further reduce IMAGE by USAGE to mirror "padding: 1%" in the CSS
    return Math.round(image * usage);
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
  function horizoll(where, options) {
    // browser could not fit document vertically into window so don't
    // interfere with user's ability to scroll the document normally
    if ($document.height() > $window.height()) return;

    // browser was able to fit document horizontally into window, so
    // scrolling is unnecessary: there's nothing here to be scrolled!
    if ($document.width() < $window.width()) return;

    var start = typeof where === 'number' ? where : $document.scrollLeft(),
        limit = boundary(),
        depth = start % limit,
        space = limit - depth;

    switch (where) {
      case 'left' : where = start - (depth > 0 ? depth : limit); break;
      case 'right': where = start + (depth > 0 ? space : limit); break;
      case 'align': if (depth >= space) { where = start + space; break; }
                    // else fall through
      default     : where = start - depth;
    }

    $screen.animate({ scrollLeft: where }, options);
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

  // Tests whether the given event qualifies as a cause for scrolling.
  function qualify(event) {
    return !(
      // event originated from a form input field, so don't interfere:
      // the user is probably trying to enter text or scroll the field
      event.target.hasOwnProperty('form') ||

      // modifier was pressed along with keystroke, so don't interfere
      event.altKey || event.ctrlKey || event.metaKey || (
        // shift modifier was pressed along with a non-space-bar key
        event.shiftKey && (event.keyCode !== 32) // space bar
      )
    );
  }

  // traverse page boundaries using the keyboard
  $document.bind('keyup', function(event) {
    if (qualify(event)) {
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

        case 32: // space bar
          horizoll(event.shiftKey ? 'left' : 'right');
          break;

        case 36: // home key
          horizoll(0);
          break;

        case 35: // end key
          horizoll($document.width());
          break;
      }
    }
  });

  // traverse page boundaries using the mouse wheel
  $document.bind('mousewheel', function(event, delta, deltaX, deltaY) {
    if (!wheeling && delta !== 0 && deltaX === 0 && qualify(event)) {
      wheeling = true;
      horizoll(deltaY > 0 ? 'left' : 'right', {
        complete: function() {
          wheeling = false;
        }
      });
    }
  });

  // automatically realign to nearest page boundary
  $window.bind('resize', realign);
  setTimeout(realign, 500);

});
