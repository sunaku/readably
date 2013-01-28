Readably: YAML + Slim => HTML5 + Zenburn
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

See my blog <http://snk.tuxfamily.org/log/> for an example of Readably output.

------------------------------------------------------------------------------
Features
------------------------------------------------------------------------------

  * Its output is easy to read and beautiful to print in modern Web browsers.

  * Its output is self-explanatory and multi-lingual: no translation needed.
    (There is only 1 English phrase in the entire output, for attribution.)

  * It has simple navigation that works well in both text-mode Web browsers
    (such as Lynx, elinks, and w3m) and modern Web browsers (like Firefox).

  * It supports the two most popular Javascript-based blog comment services:
    [Disqus](http://disqus.com) and [IntenseDebate](http://intensedebate.com).

  * It is implemented in less than 200 lines of pure Ruby code! :-)

------------------------------------------------------------------------------
Prerequisites
------------------------------------------------------------------------------

  * Ruby 1.8.7 or newer:  <http://www.ruby-lang.org>
  * Rake 0.8.7 or newer:  `gem install rake`
  * Slim 1.0.3 or newer:  `gem install slim`


------------------------------------------------------------------------------
Installing
------------------------------------------------------------------------------

    # install
    git clone git://github.com/sunaku/readably.git

    # branch
    cd readably
    git checkout -b personal

    # initialize
    mkdir content/
    cp -vb EXAMPLE.entry.readably content/
    cp -vb EXAMPLE.config.yaml config.yaml

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

Run `rake --tasks` to see available commands:

    rake build    # Build entire blog.
    rake entry    # Build entry pages.
    rake index    # Build index pages.
    rake style    # Build stylesheet.

    rake clean    # Remove any temporary products.
    rake clobber  # Remove any generated file.

    rake upgrade  # Upgrade blog software.

------------------------------------------------------------------------------
Blogging
------------------------------------------------------------------------------

To create a new blog entry (`*.readably` file) from the template:

    cp EXAMPLE.entry.readably content/your-entry-file-name.readably
    edit content/your-entry-file-name.readably

To create a new blog entry (`*.readably` file) in a nested directory:

    cp EXAMPLE.entry.readably content/your/path/your-entry-file-name.readably
    edit content/your/path/your-entry-file-name.readably

------------------------------------------------------------------------------
Previewing
------------------------------------------------------------------------------

Simply open the `content/index.html` file in your favorite web browser.  After
making changes to a blog entry, run `rake`, and then reload the corresponding
web page in your web browser.

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

    rake publish

------------------------------------------------------------------------------
Upgrading
------------------------------------------------------------------------------

To upgrade your copy of Readably, run the following command:

    rake upgrade

------------------------------------------------------------------------------
Contributing
------------------------------------------------------------------------------

Fork this project on GitHub and send pull requests.

------------------------------------------------------------------------------
Bugs, Features, Issues, Questions
------------------------------------------------------------------------------

File a report on [the issue tracker](
http://github.com/sunaku/readably/issues/ ).

