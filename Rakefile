task :default => :build

desc 'Build entire blog.'
task :build => [:entry, :index, :style]

desc 'Build entry pages.'
task :entry

desc 'Build index pages.'
task :index

desc 'Build stylesheet.'
task :style

#-----------------------------------------------------------------------------
# live preview
#-----------------------------------------------------------------------------

livereloadx = 'node_modules/livereloadx/bin/livereloadx.js'

file livereloadx do
  sh 'npm', 'install', 'livereloadx'
end

desc 'Preview your blog.'
task :preview => livereloadx do
  IO.popen([livereloadx, '--static', @output_dir]) do |io|
    notify :preview, 'http://localhost:35729/'
    while line = io.gets
      warn line # pass the output through to user's terminal
      system 'rake', 'build' if line =~ /\sskip:.+readably$/
    end
  end
end

#-----------------------------------------------------------------------------
# helper libraries
#-----------------------------------------------------------------------------

require 'yaml'
require 'time'
require 'uri'
require 'cgi'

require 'rake/clean'
require 'slim'
require 'sass'

# try to use Redcarpet to process Markdown subtemplates inside Slim templates
begin
  require 'redcarpet'

  renderer_class = Class.new(Redcarpet::Render::HTML) do
    include Redcarpet::Render::SmartyPants

    Heading = Struct.new(:level, :id, :text, :children, :parent)

    def preprocess document
      @seen_count_by_id = Hash.new {|h,k| h[k] = 0 }
      @headings = []
      document
    end

    def postprocess document
      doc = super.to_s
      toc = table_of_contents.to_s
      doc.sub!(/<(\/)?readably_table_of_contents>/){ toc unless $1 } or toc+doc
    end

    # add permalink anchors to all headings
    # https://gist.github.com/sunaku/6913731
    def header text, level, _=nil
      # strip all HTML tags, squeeze all non-word characters, and lowercase it
      id = text.gsub(/&#(\d+);/){ $1.to_i.chr }. # expand numeric XML entities
                gsub(/&[A-Z]+;/i, ''). # strip non-numeric XML entities: &amp;
                gsub(/(?<=\S)'(?=\S)/, ''). # drop apostrophes in contractions
                gsub(/<.+?>/, '-').gsub(/\W+/, '-').gsub(/^-|-$/, '').downcase

      # make duplicate anchors unique by appending numerical suffixes to them
      count = @seen_count_by_id[id] += 1
      id += "-#{count - 1}" if count > 1

      # keep track of the heading to generate the table_of_contents() later on
      heading = Heading.new(level, id, text, [], nil)
      if parent = @headings.last
        parent = parent.parent while parent and parent.level >= level
        parent.children << heading if parent
        heading.parent = parent
      end
      @headings << heading

      [?\n,
        %{<div id="#{id}" class="section"></div>},
        %{<h#{level} class="heading">},
          text,
          %{<a href="##{id}" class="permalink" title="Permalink"></a>},
          %{<a href="##{uplink_id id}" class="uplink" title="Contents"></a>},
        "</h#{level}>",
      ?\n].join
    end

    def image url, _, title
      img_html = %{<img src="#{url}">}

      # populate <img> width and height from image file
      url_file = "content/#{url}"
      if File.exist? url_file
        url_file_info = `file #{url_file.inspect}`
        if url_file_info =~ / image data, .*\b(\d+)\s?x\s?(\d+)\b/
          img_html.sub! /(?=>$)/, %{ width="#{$1}" height="#{$2}"}
        end
      end

      # populate <img> title from alt, and alt if given
      if title
        title_html = CGI.escape_html(title)
        img_html.sub! /(?=>$)/, %{ alt="#{title_html}" title="#{title_html}"}
      end

      # offer modern WebP format to speed up page loads
      webp_url = url.ext('webp')
      webp_file = url_file.ext('webp')
      if File.exist? webp_file
        img_html = [?\n,
          %{<picture>},
            %{<source type="image/webp" srcset="#{webp_url}">},
            img_html,
          "</picture>",
        ?\n].join
      end

      img_html
    end

    # don't wrap standalone <img> tags in <p>
    def paragraph text
      image = /<img[^>]*>/
      linked_image = %r{<a[^>]*>#{image}</a>}
      dont_wrap_image = /\A(#{image}|#{linked_image})\Z/

      if text =~ dont_wrap_image
        text
      else
        "<p>#{text.lstrip}</p>\n"
      end
    end

    private

    def table_of_contents
      helper = lambda do |subtrees|
        subtrees.map do |heading|
          id = uplink_id(heading.id)
          %{<li><a id="#{id}" href="##{heading.id}" class="downlink">#{
            heading.text.gsub(/<.*?>/, '')
          }</a><ol>#{
            helper.call heading.children
          }</ol></li>}
        end.join
      end
      toc = helper.call @headings.reject(&:parent) # tree roots only!
      %{<ol class="table-of-contents">#{toc}</ol>} unless toc.empty?
    end

    def uplink_id id
      "__#{id}__"
    end
  end

  # try to use Rouge for syntax highlighting of code blocks inside Markdown
  begin
    require 'rouge'
    require 'rouge/plugins/redcarpet'

    renderer_class.class_eval do
      include Rouge::Plugins::Redcarpet

      # don't highlight plain text (when no language specified or detected)
      def block_code code, language
        super.sub(/\sclass="highlight text"/, '')
      end
    end

  rescue LoadError => error
    warn error
  end

  # https://github.com/vmg/redcarpet#darling-i-packed-you-a-couple-renderers-for-lunch
  renderer_options = {
    :filter_html     => false,
    :no_images       => false,
    :no_links        => false,
    :no_styles       => false,
    :safe_links_only => false,
    :with_toc_data   => false, # we're generating our own URI fragments above
    :hard_wrap       => false,
    :xhtml           => false,
    :prettify        => false,
    :link_attributes => {},
  }

  # https://github.com/vmg/redcarpet#and-its-like-really-simple-to-use
  markdown_extensions = {
    :no_intra_emphasis            => false,
    :tables                       => true,
    :fenced_code_blocks           => true,
    :autolink                     => true,
    :disable_indented_code_blocks => false,
    :strikethrough                => true,
    :lax_spacing                  => true,
    :space_after_headers          => true,
    :superscript                  => true,
    :underline                    => false,
    :highlight                    => true,
    :quote                        => false,
    :footnotes                    => true,
    :renderer                     => renderer_class.new(renderer_options)
  }

  Slim::Embedded.options[:markdown] = markdown_extensions

rescue LoadError => error
  warn error
end

#-----------------------------------------------------------------------------
# helper logic
#-----------------------------------------------------------------------------

##
# Embeds a YouTube video by generating a thumbnailed link that dynamically
# expands into an embedded Youtube video player when the link is clicked.
#
# The last argument passed to this method can be a Hash containing options:
#
#   :thumbnail => nil   # does not emit any thumbnail image for the video
#   :thumbnail => "..." # uses a custom URL "..." for the thumbnail image
#   :caption   => "..." # use a custom <img alt="..."> text for thumbnail
#
def embed_youtube_video(id, *params)
  options = if params.last.kind_of? Hash then params.pop else {} end
  # https://developers.google.com/youtube/player_parameters
  params = ['autoplay=1', 'cc_load_policy=1', 'modestbranding=1', *params]
  video_url = "https://www.youtube.com/embed/#{id}?#{params.join('&')}"
  thumb_url = options.fetch(:thumbnail, "https://i.ytimg.com/vi/#{id}/hqdefault.jpg")
  thumb_alt = options.fetch(:caption, 'Click to watch video').to_s.inspect
  thumbnail = %{<img src="#{thumb_url}" alt=#{thumb_alt} width="480" height="360">}
  %{<a class="embed_youtube_video" href="#{video_url}">#{thumbnail}</a>}
end

unless File.respond_to? :write
  ##
  # Writes the given content to the given file.
  #
  def File.write path, content
    open(path, 'wb') {|f| f.write content }
  end
end

##
# Notify the user about some action being performed.
#
def notify action, message
  printf "%16s  %s\n", action, message
end

##
# Transforms the given string into a vaild
# file name that can be safely used in a URL.
#
# http://en.wikipedia.org/wiki/URI_scheme#Generic_syntax
#
def sanitize_filename string
  dirname, basename = File.split(string.to_s)
  File.join dirname,
    basename.downcase.strip.
    gsub(%r([/;?#\s]+), '-').       # sanitize with dashes
    squeeze('-').gsub(/^-|-$/, '')  # remove excess dashesbasename
end

def comma_join array
  array.join(', ')
end

def path_join *array
  File.join(*array.compact)
end

##
# Renders the given file and/or template inside a fresh
# object populated with the given local variables.
#
def render_slim_file filename, template = nil, locals = {}
  template ||= File.read(filename)
  Slim::Template.new(filename){ template }.render(Object.new, locals)
rescue => error
  error.message.insert 0,
    "Could not render Slim template #{filename.inspect}\n"
  raise
end

##
# Creates a new file task to render the given
# source file into the given destination file.
#
# If a block is given, it is passed the result of
# rendering Slim for further processing and its
# result is then written to the destination file.
#
def render_template_task task_name, src, *deps
  raise ArgumentError unless block_given?

  dst = src.sub('template', @output_dir).
    # keep only the inner-most file extension
    sub(/(\/.*?\..*?)\..*$/, '\1')

  deps.concat(@entry_source_files).push \
    @config[:source_file], @output_dir, src, __FILE__

  file dst => deps do
    notify task_name, src
    File.write dst, yield(src)
  end
  CLEAN.include dst

  task task_name => dst
end

def render_slim_template_task *args
  render_template_task(*args) do |src|
    render_slim_file(
      src, nil,
      :config => @config,
      :entries => @entries,
      :listed_entries => @listed_entries,
      :hidden_entries => @hidden_entries,
    )
  end
end

##
# Shell out to `date` and friends if possible, because
# Ruby 1.9's Time class does not react to setlocale().
#
def format_date date, format, locale = nil
  if locale and (`date` rescue false)
    original_LC_ALL = ENV[:LC_ALL]

    begin
      ENV[:LC_ALL] = locale
      result = `date --date=#{date.rfc822.inspect} +#{format.inspect}`
      return result if $?.exitstatus.zero?
    ensure
      ENV[:LC_ALL] = original_LC_ALL
    end
  end

  # fall back to Ruby
  date.strftime(format)
end

#-----------------------------------------------------------------------------
# load blog configuration
#-----------------------------------------------------------------------------

@config_file = 'config.yaml'
notify :load, @config_file

begin
  @config = YAML.unsafe_load_file(@config_file).to_hash
rescue => error
  error.message.insert 0,
    "Could not load blog configuration file #{@config_file.inspect}\n"
  raise
end

@config[:source_file] = @config_file

@config[:authors] = Array(@config['author'])
@config[:author] = comma_join(@config[:authors])

#-----------------------------------------------------------------------------
# load blog entries
#-----------------------------------------------------------------------------

@input_dir = @output_dir = 'content'
@entry_source_files_glob = "#{@input_dir}/**/*.readably"
notify :load, @entry_source_files_glob

entry_sources_by_output = Hash.new {|h,k| h[k] = [] }
@entries = Dir[@entry_source_files_glob].map do |source_file|
  begin
    entry = YAML.unsafe_load_file(source_file)
    entry[:source_file] = source_file

    sanitized_file = sanitize_filename(source_file)
    unless source_file == sanitized_file
      warn nil
      warn "Bad entry file name: #{source_file.inspect}"
      warn "Please rename it to: #{sanitized_file.inspect}"
      warn nil
    end

    entry[:url] = sanitized_file.sub(/^.*?\//, '').ext('html')
    entry[:published_url] = path_join(@config['published_url'], entry[:url])
    entry[:id] = entry[:url].pathmap('%X')

    entry[:index_path] = entry[:url].scan('/').map { '..' }.join('/')
    entry[:index_path] = nil if entry[:index_path].empty?
    entry[:index_url] = path_join(entry[:index_path], 'index.html#' + entry[:id])

    entry[:output_file] = output_file = path_join(@output_dir, entry[:url])
    entry_sources_by_output[output_file] << source_file

    entry[:created_at] =
      if created_at = entry['date']
        begin
          Time.parse created_at.to_s
        rescue => error
          error.message.prepend "error parsing date #{created_at.inspect}: "
          raise
        end
      else
        File.mtime source_file
      end

    entry[:updates] =
      if updates = entry['update'] and updates.is_a? Hash
        updates.inject([]) do |memo, (date, message)|
          memo << [Time.parse(date.to_s), message]
        end.sort_by {|(date, message)| -date.to_i }
      else
        []
      end

    entry[:updated_at] = entry[:updates][0][0] unless entry[:updates].empty?
    entry[:updated_at] ||= entry[:created_at]

    entry[:categories] = Array(entry['category'])
    entry[:category] = comma_join(entry[:categories])

    entry[:authors] = Array(entry['author'])
    entry[:authors] = @config[:authors] if entry[:authors].empty?
    entry[:author] = comma_join(entry[:authors])

    directory output_dir = File.dirname(output_file)

    file output_file => [
      source_file, @config[:source_file], output_dir, __FILE__,
      'template/header.html.slim',
      'template/footer.html.slim',
      'template/entry.html.slim', # XXX: this must be LAST in the list
    ] do |t|
      notify :entry, source_file

      File.write t.name, render_slim_file(
        t.prerequisites.last, nil,
        :config => @config,
        :entry => entry
      )
    end
    CLEAN.include output_file

    entry
  rescue => error
    error.message.insert 0,
      "Could not load blog entry file #{source_file.inspect}\n"
    raise error
  end
end.sort_by {|e| [-e[:updated_at].to_i, -e[:created_at].to_i] }

@hidden_entries, @listed_entries = @entries.partition {|e| e['hidden'] }

if @entries.empty?
  @config[:created_at] = @config[:updated_at] = Time.now
else
  @config[:created_at] = @listed_entries.last[:updated_at]
  @config[:updated_at] = @listed_entries.first[:updated_at]
end

@entry_source_files = entry_sources_by_output.values.flatten
@entry_output_files = entry_sources_by_output.keys

@config[:categories] = @listed_entries.map {|e| e[:categories] }.
                       flatten.uniq.sort

@config[:category] = comma_join(@config[:categories])

#-----------------------------------------------------------------------------
# render blog output
#-----------------------------------------------------------------------------

directory @output_dir

task :entry => @entry_output_files

render_slim_template_task :index, 'template/index.js.slim'

render_slim_template_task :index, 'template/index.atom.slim'

render_slim_template_task :index, 'template/index.html.slim',
  'template/header.html.slim', 'template/footer.html.slim'

render_template_task :style, 'template/style.css.sass' do |src|
  Sass::Engine.new(File.read(src), :filename => src).render <<
  Rouge::Themes::ThankfulEyes.render(:scope => '.highlight')
end

#-----------------------------------------------------------------------------
# upgrade blog software
#-----------------------------------------------------------------------------

desc 'Upgrade blog software.'
task :upgrade do
  # ensure that there are no uncommitted changes in the working tree
  sh 'git rebase HEAD'

  unless system 'git remote show upstream'
    sh 'git remote add upstream git://github.com/sunaku/readably.git'
  end
  sh 'git fetch upstream'

  sh 'git checkout master'
  sh 'git rebase upstream/master'

  sh 'git checkout personal'
  sh 'git rebase master'
end
