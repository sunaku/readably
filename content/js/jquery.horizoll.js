/*****************************************************************************

  Keyboard and mouse enabled horizontal screen
  scrolling plugin, with automatic realignment.

  See https://github.com/sunaku/jquery-horizoll

******************************************************************************

  (the ISC license)

  Copyright 2013 Suraj N. Kurapati <sunaku@gmail.com>

  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted, provided that the above
  copyright notice and this permission notice appear in all copies.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
  WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
  MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
  ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
  WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
  ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
  OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

*****************************************************************************/

$(function() {
  var $document = $(document),
      $window   = $(window),
      $html     = $('html'),
      $body     = $('body'),
      wheeling  = false,
      SPACE     = 32, // space bar
      PRIOR     = 33, // page up
      NEXT      = 34, // page down
      END       = 35, // end key
      HOME      = 36, // home key
      LEFT      = 37, // left arrow
      UP        = 38, // up arrow
      RIGHT     = 39, // right arrow
      DOWN      = 40; // down arrow

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
    // browser was able to fit document horizontally into window, so
    // scrolling is unnecessary: there's nothing here to be scrolled!
    if ($document.width() <= $window.width()) return;

    var start = typeof where === 'number' ? where : $document.scrollLeft(),
        limit = $body.width(),
        depth = start % limit,
        space = limit - depth;

    switch (where) {
      case 'left' : where = start - (depth > 0 ? depth : limit); break;
      case 'right': where = start + (depth > 0 ? space : limit); break;
      case 'align': if (depth >= space) { where = start + space; break; }
                    // else fall through
      default     : where = start - depth;
    }

    $('html,body').animate({ scrollLeft: where }, options);
  }

  // Aligns the screen to the nearest page boundary
  // while ensuring that any hash target is visible.
  function realign() {
    if (window.location.hash.length > 1) {
      var target = $(':target,' + window.location.hash);
      if (target.length) {
        horizoll(target.offset().left);
      }
      else {
        // hash was specified in URL but no DOM in document matched so retry
        // after some time because matching DOM might be created dynamically
        setTimeout(realign, 1000);
      }
    }
    else {
      horizoll('align');
    }
  }

  // Tests whether the given event qualifies as a cause for scrolling.
  function qualify(event, approved_scrolling_keycodes) {
    return !(
      // event originated from a form input field, so don't interfere:
      // the user is probably trying to enter text or scroll the field
      $(event.target).is(':input') ||

      // modifier was pressed along with keystroke, so don't interfere
      event.altKey || event.ctrlKey || event.metaKey ||

      // shift was pressed with a non-space-bar key, so don't interfere
      (event.shiftKey && event.keyCode !== SPACE) ||

      // browser could not fit document vertically into window so don't
      // interfere with user's ability to scroll the document normally...
      //
      // (NOTE: document height matches window height in Chrome browser;
      // whereas in other browsers, document height matches html height)
      //
      ($document.height() > Math.max($window.height(), $html.height()) &&
       // ...unless the user has pressed an approved scrolling keycode
       $.inArray(event.keyCode, approved_scrolling_keycodes) === -1)
    );
  }

  // traverse page boundaries using the keyboard
  $document.bind('keyup', function(event) {
    if (qualify(event, [LEFT, RIGHT])) {
      switch (event.keyCode) {
        case PRIOR:
        case LEFT:
        case UP:
          horizoll('left');
          break;

        case NEXT:
        case RIGHT:
        case DOWN:
          horizoll('right');
          break;

        case SPACE:
          horizoll(event.shiftKey ? 'left' : 'right');
          break;

        case HOME:
          horizoll(0);
          break;

        case END:
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
  window.onhashchange = realign;
  setTimeout(realign, 500);

});
