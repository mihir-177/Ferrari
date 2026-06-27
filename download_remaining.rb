require 'net/http'
require 'uri'
require 'fileutils'

html_content = File.read('index.html')

assets = {
  "https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=687891a1de8273e3ce3ef3c0" => "js/jquery.js",
  "https://cdn.prod.website-files.com/687891a1de8273e3ce3ef3c0/687edb8e34f91ca9195280d2_me.avif" => "images/me.avif",
  "https://cdn.prod.website-files.com/687891a1de8273e3ce3ef3c0/68830a486ee71e336c2089d1_webicon32.png" => "images/webicon32.png",
  "https://cdn.prod.website-files.com/687891a1de8273e3ce3ef3c0/68830a6c3843d6438353c232_icon256.png" => "images/icon256.png"
}

assets.each do |url_str, local_path|
  uri = URI.parse(url_str)
  puts "Downloading: #{url_str} to #{local_path}..."
  begin
    response = Net::HTTP.get_response(uri)
    if response.is_a?(Net::HTTPSuccess)
      File.write(local_path, response.body)
      puts "  Success!"
      # Replace exactly the url_str in HTML with local_path
      # Also try to replace url_str without query params if needed
      html_content.gsub!(url_str, local_path)
      # Fallback for exact url matching
      html_content.gsub!(url_str.split('?')[0], local_path)
    else
      puts "  Failed! Code: #{response.code}"
    end
  rescue => e
    puts "  Error: #{e.message}"
  end
end

File.write('index.html', html_content)
puts "index.html updated with remaining local assets!"
