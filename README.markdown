Readably: YAML + Slim => HTML5
==============================================================================

                       _____
                      (, /   )          /)     /)  /)
                        /__ /  _  _   _(/ _   (/_ //
                     ) /   \__(/_(_(_(_(_(_(_/_) (/_ (_/_
                    (_/                             .-/
                                                   (_/


Readably is a minimal static blog engine that emits clean, readable Web pages.
You can view them locally on your own computer without needing a Web server.
And when you publish them to *any* Web server, they will function just as they
did locally on your computer.  This is the benefit of a *static* blog engine!

See my blog at <http://sunaku.github.io> for an example of Readably output.

------------------------------------------------------------------------------
Features
------------------------------------------------------------------------------

  * Its output is easy to read and beautiful to print in modern Web browsers.

  * Its output is self-explanatory and multi-lingual: no translation needed.
    (There is only 1 English phrase in the entire output, for attribution.)

  * It has simple navigation that works well in both text-mode Web browsers
    (such as Lynx, elinks, and w3m) and modern Web browsers (like Firefox).

  * It supports several popular JavaScript-based blog commenting services:
    - [Giscus](https://giscus.app)
    - [Disqus](http://disqus.com)
    - [IntenseDebate](http://intensedebate.com)

  * It supports automatic syntax highlighting of code blocks in Markdown.

  * It is implemented in less than 200 lines of pure Ruby code! :-)

------------------------------------------------------------------------------
Prerequisites
------------------------------------------------------------------------------

  * Ruby 3.1 or newer:  <http://www.ruby-lang.org>
  * Bundler 2.3 or newer: <http://gembundler.com>
  * NodeJS 4.0 or newer:  <https://nodejs.org>

------------------------------------------------------------------------------
Installing
------------------------------------------------------------------------------

Setup:

    git clone https://github.com/sunaku/readably.git
    cd readably
    bundle install # with markdown OR
    bundle install --without markdown

Demo:

    bundle exec rake
    firefox content/index.html

------------------------------------------------------------------------------
Configuring
------------------------------------------------------------------------------

  * Edit the `config.yaml` and `template/*` files to your liking.

  * Edit the `Rakefile` to configure the blog processing logic.
    (This isn't really necessary, but you are free to do so.)

------------------------------------------------------------------------------
Running
------------------------------------------------------------------------------

NOTE: If you are using Ruby 1.8.7, add `-rubygems` to the following commands.

Run `bundle exec rake --tasks` to see available commands:

    bundle exec rake preview  # Live blog preview at http://localhost:35729/.

    bundle exec rake build    # Build entire blog.
    bundle exec rake entry    # Build entry pages.
    bundle exec rake index    # Build index pages.
    bundle exec rake style    # Build stylesheet.

    bundle exec rake clean    # Remove any temporary products.
    bundle exec rake clobber  # Remove any generated file.

    bundle exec rake upgrade  # Upgrade blog software.

------------------------------------------------------------------------------
Blogging
------------------------------------------------------------------------------

To create a new blog entry (`*.readably` file) from the template:

    cp content/entry.readably content/your-entry-file-name.readably
    edit content/your-entry-file-name.readably

To create a new blog entry (`*.readably` file) in a nested directory:

    cp content/entry.readably content/your/path/your-entry-file-name.readably
    edit content/your/path/your-entry-file-name.readably

------------------------------------------------------------------------------
Previewing
------------------------------------------------------------------------------

Run `bundle exec rake preview` to launch a *local* live preview of your blog at
http://localhost:35729/ which auto-updates when you modify your blog entries.

Alternatively, you can manually preview your blog entries as follows.  First,
open the `content/index.html` file in your Web browser.  Then, whenever you
modify your blog sources, run `bundle exec rake` and refresh your Web browser.

------------------------------------------------------------------------------
Publishing
------------------------------------------------------------------------------

Use your favorite file uploading software to upload the content/ directory
(while omitting `*.readably` files from it) to your web hosting platform.

Here is an example that uses [rsync](http://rsync.samba.org) to upload to a
`DESTINATION`.  (NOTE: the trailing slash after `DESTINATION` is necessary!)

    rsync -auv content/ --exclude '*.readably' DESTINATION/

You can take this further and make it a Rake task by adding it to `Rakefile`:

    desc 'Publish your blog.'
    task :publish => :build do
      sh "rsync -auv content/ --exclude '*.readably' DESTINATION/"
    end

From then onwards, you can publish your blog at any time, simply by running:

    bundle exec rake publish

------------------------------------------------------------------------------
Upgrading
------------------------------------------------------------------------------

To upgrade your copy of Readably, run the following command:

    bundle exec rake upgrade

------------------------------------------------------------------------------
Contributing
------------------------------------------------------------------------------

Fork this project on GitHub and send pull requests.

------------------------------------------------------------------------------
Bugs, Features, Issues, Questions
------------------------------------------------------------------------------

File a report on [the issue tracker](
http://github.com/sunaku/readably/issues/ ).

------------------------------------------------------------------------------
License
------------------------------------------------------------------------------

[Spare A Life]: https://sunaku.github.io/vegan-for-life.html
> Like my work? :+1:  Please [spare a life] today as thanks!
:cow::pig::chicken::fish::speak_no_evil::v::revolving_hearts:

Copyright 2010 Suraj N. Kurapati <https://github.com/sunaku>

Distributed under the terms of the ISC license (see the LICENSE file).
