require 'rake/clean'
require 'yaml'
require 'time'
require 'uri'

task :default => :render

#-----------------------------------------------------------------------------
# helper logic
#-----------------------------------------------------------------------------

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

  begin
    require 'slim'
    Slim::Template.new(filename){ template }.render(Object.new, locals)
  rescue => error
    error.message.insert 0,
      "Could not render Slim template #{filename.inspect}\n"
    raise
  end
end

##
# Creates a new file task to render the given
# source file into the given destination file.
#
# If a block is given, it is passed the result of
# rendering Slim for further processing and its
# result is then written to the destination file.
#
def render_template_task src, *deps
  raise ArgumentError unless block_given?

  dst = src.sub('template', @output_dir).
    # keep only the inner-most file extension
    sub(/(\/.*?\..*?)\..*$/, '\1')

  deps.concat(@entry_source_files).push \
    @config[:source_file], @output_dir, src, __FILE__

  file dst => deps do
    notify :render, src
    File.write dst, yield(src)
  end
  CLEAN.include dst

  task :render => dst
end

def render_slim_template_task *args
  render_template_task(*args) do |src|
    render_slim_file(
      src, nil,
      :config => @config,
      :entries => @entries
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
  @config = YAML.load_file(@config_file).to_hash
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
    entry = YAML.load_file(source_file)
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

    entry[:index?] = !entry['hidden']
    entry[:index_path] = entry[:url].scan('/').map { '..' }.join('/')
    entry[:index_path] = nil if entry[:index_path].empty?

    entry[:output_file] = output_file = path_join(@output_dir, entry[:url])
    entry_sources_by_output[output_file] << source_file

    entry[:created_at] =
      if created_at = entry['date']
        Time.parse created_at.to_s
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
      source_file, @config[:source_file], output_dir,
      'template/header.html.slim',
      'template/footer.html.slim',
      'template/entry.html.slim', # XXX: this must be LAST in the list
    ] do |t|
      notify :render, source_file

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
end.sort_by {|e| -e[:updated_at].to_i }

if @entries.empty?
  @config[:created_at] = @config[:updated_at] = Time.now
else
  @config[:created_at] = @entries.last[:updated_at]
  @config[:updated_at] = @entries.first[:updated_at]
end

@entry_source_files = entry_sources_by_output.values.flatten
@entry_output_files = entry_sources_by_output.keys

@config[:categories] = @entries.map {|e| e[:categories] }.
                       flatten.uniq.sort

@config[:category] = comma_join(@config[:categories])

#-----------------------------------------------------------------------------
# render blog output
#-----------------------------------------------------------------------------

directory @output_dir
task :render => @output_dir

desc 'Render your blog.'
task :render => @entry_output_files

render_slim_template_task 'template/index.atom.slim'

render_slim_template_task 'template/index.html.slim',
                     'template/header.html.slim',
                     'template/footer.html.slim'

render_template_task 'template/index.css.sass' do |src|
  require 'sass'
  css = Sass::Engine.new(File.read(src), :filename => src).render
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
