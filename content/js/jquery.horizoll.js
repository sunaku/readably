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
      $screen   = $('html,body'),
      wheeledAt = 0,
      scrolling = false,
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

    // we are already in the process of scrolling to the given location
    if (scrolling === where) return;
    scrolling = where;

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

    if (!options) options = {};
    var complete = options.complete;
    options.complete = function() {
      scrolling = false;
      if (complete) complete();
    }
    options.queue = false;
    $screen.animate({ scrollLeft: where }, options);
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
  function qualify(event) {
    // event originated from a form input field, so don't interfere:
    // the user is probably trying to enter text or scroll the field
    return !$(event.target).is(':input');
  }

  // traverse page boundaries using the keyboard
  $document.bind('keydown', function(event) {
    if (// modifier was pressed along with keystroke, so don't interfere
        !event.altKey && !event.ctrlKey && !event.metaKey &&

        // shift was pressed with a non-space-bar key, so don't interfere
        !(event.shiftKey && event.keyCode !== SPACE) &&

        // qualify this event further before proceeding to take any action
        qualify(event)
    )
    {
      var where = null;
      switch (event.keyCode) {
        case PRIOR:
        case LEFT:
        case UP:
          where = 'left';
          break;

        case NEXT:
        case RIGHT:
        case DOWN:
          where = 'right';
          break;

        case SPACE:
          where = event.shiftKey ? 'left' : 'right';
          break;

        case HOME:
          where = 0;
          break;

        case END:
          where = $document.width();
          break;
      }
      if (where !== null) {
        event.stopPropagation();
        event.preventDefault();
        horizoll(where);
      }
    }
  });

  // traverse page boundaries using the mouse wheel
  $document.bind('mousewheel', function(event) {
    // we are only interested in scroll wheels that travel along Y axis
    if (qualify(event) && event.deltaY !== 0) {
      event.stopPropagation();
      event.preventDefault();
      if (
          // ignore touchpad swipes that travel along _both_ Y and X axes!
          event.deltaX === 0 &&

          // ignore touchpads swipes that produce extreme/fractional deltas
          event.deltaFactor == 16 &&

          // ignore redundant event spam that we get after touchpads swipes
          event.timeStamp - wheeledAt > 50
      ) {
        horizoll(event.deltaY > 0 ? 'left' : 'right');
      }
    }
    wheeledAt = event.timeStamp;
  });

  // automatically realign to nearest page boundary
  $window.bind('resize', realign);
  window.onhashchange = realign;
  setTimeout(realign, 500);

});
