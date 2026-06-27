require 'net/http'
require 'uri'
require 'fileutils'

css_file_path = 'css/s-2k.webflow.shared.6ae152944.css'
css_content = File.read(css_file_path)

FileUtils.mkdir_p('fonts')

# Find all font URLs in the CSS
font_urls = css_content.scan(/url\("(https:[^"]+\.(?:woff|woff2|ttf|otf|eot))"\)/).flatten

font_urls.each do |url_str|
  uri = URI.parse(url_str)
  name = File.basename(uri.path)
  dest_path = "fonts/#{name}"
  
  puts "Downloading font: #{url_str}..."
  begin
    response = Net::HTTP.get_response(uri)
    if response.is_a?(Net::HTTPSuccess)
      File.write(dest_path, response.body)
      puts "  Success!"
      # Replace absolute URL with relative local path in the CSS
      # The CSS is in the css/ folder, so fonts are at ../fonts/name
      css_content.gsub!(url_str, "../fonts/#{name}")
    else
      puts "  Failed: #{response.code}"
    end
  rescue => e
    puts "  Error downloading #{url_str}: #{e.message}"
  end
end

File.write(css_file_path, css_content)
puts "CSS updated with local font references!"
