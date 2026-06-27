require 'net/http'
require 'uri'
require 'fileutils'

html_content = File.read('s2k.html')

# Create directories
FileUtils.mkdir_p('css')
FileUtils.mkdir_p('js')
FileUtils.mkdir_p('images')
FileUtils.mkdir_p('videos')

def download_file(url_str, dest_path)
  url = URI.parse(url_str)
  
  # Handle protocol-relative URLs (e.g. //assets.website-files.com/...)
  if url_str.start_with?('//')
    url = URI.parse("https:#{url_str}")
  end
  
  # Handle relative URLs
  if url.scheme.nil?
    url = URI.parse("https://s-2k.webflow.io#{url_str}")
  end
  
  puts "Downloading #{url} to #{dest_path}..."
  
  begin
    response = Net::HTTP.get_response(url)
    if response.is_a?(Net::HTTPSuccess)
      File.write(dest_path, response.body)
      puts "  Success!"
      true
    else
      # Try following redirect if any
      if response.is_a?(Net::HTTPRedirection) && response['location']
        redirect_url = URI.parse(response['location'])
        if redirect_url.scheme.nil?
          redirect_url = url + response['location']
        end
        puts "  Following redirect to #{redirect_url}..."
        redirect_resp = Net::HTTP.get_response(redirect_url)
        if redirect_resp.is_a?(Net::HTTPSuccess)
          File.write(dest_path, redirect_resp.body)
          puts "  Success (redirect)!"
          return true
        end
      end
      puts "  Failed! Code: #{response.code}"
      false
    end
  rescue => e
    puts "  Error: #{e.message}"
    false
  end
end

# 1. Extract and download CSS
css_urls = html_content.scan(/href="([^"]+\.css)"/).flatten
css_urls.each_with_index do |css_url, idx|
  name = File.basename(URI.parse(css_url).path) rescue "style_#{idx}.css"
  local_path = "css/#{name}"
  if download_file(css_url, local_path)
    html_content.gsub!(css_url, local_path)
  end
end

# 2. Extract and download JS
js_urls = html_content.scan(/src="([^"]+\.js)"/).flatten
js_urls.each_with_index do |js_url, idx|
  name = File.basename(URI.parse(js_url).path) rescue "script_#{idx}.js"
  local_path = "js/#{name}"
  if download_file(js_url, local_path)
    html_content.gsub!(js_url, local_path)
  end
end

# 3. Extract and download images (png, jpg, jpeg, svg, gif, webp)
image_regex = /src="([^"]+\.(?:png|jpg|jpeg|svg|gif|webp|ico))"/i
img_urls = html_content.scan(image_regex).flatten
# Also check data-src, srcset
srcset_urls = html_content.scan(/srcset="([^"]+)"/).flatten
srcset_urls.each do |srcset|
  urls = srcset.split(',').map { |s| s.strip.split(' ')[0] }
  img_urls.concat(urls)
end

img_urls.uniq.each_with_index do |img_url, idx|
  next if img_url.start_with?('data:')
  
  clean_path = URI.parse(img_url).path rescue nil
  next if clean_path.nil?
  
  name = File.basename(clean_path)
  local_path = "images/#{name}"
  if download_file(img_url, local_path)
    html_content.gsub!(img_url, local_path)
  end
end

# 4. Extract and download videos (mp4, webm)
video_urls = html_content.scan(/href="([^"]+\.(?:mp4|webm))"/i).flatten
video_urls.concat(html_content.scan(/src="([^"]+\.(?:mp4|webm))"/i).flatten)
video_urls.uniq.each_with_index do |video_url, idx|
  name = File.basename(URI.parse(video_url).path) rescue "video_#{idx}.mp4"
  local_path = "videos/#{name}"
  if download_file(video_url, local_path)
    html_content.gsub!(video_url, local_path)
  end
end

# Write the modified HTML back
File.write('index.html', html_content)
puts "HTML updated and saved as index.html!"
