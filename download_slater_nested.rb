require 'net/http'
require 'uri'
require 'fileutils'

# Files to download with query params
files = {
  "https://assets.slater.app/slater/16118/43384.css?v=73150" => "css/slater_43384.css",
  "https://assets.slater.app/slater/16118/43416.js?v=881959" => "js/slater_43416.js",
  "https://assets.slater.app/slater/16118/43300.js?v=174009" => "js/slater_43300.js",
  "https://assets.slater.app/slater/16118/43480.js?v=677780" => "js/slater_43480.js"
}

files.each do |url_str, local_path|
  uri = URI.parse(url_str)
  puts "Downloading slater nested: #{url_str}..."
  begin
    response = Net::HTTP.get_response(uri)
    if response.is_a?(Net::HTTPSuccess)
      File.write(local_path, response.body)
      puts "  Success!"
    else
      puts "  Failed! Code: #{response.code}"
    end
  rescue => e
    puts "  Error: #{e.message}"
  end
end

# Update js/slater.js content
slater_js = File.read('js/slater.js')
slater_js.gsub!("https://assets.slater.app/slater/16118/43384.css?v=73150", "css/slater_43384.css")
slater_js.gsub!("https://assets.slater.app/slater/16118/43416.js?v=881959", "./slater_43416.js")
slater_js.gsub!("https://assets.slater.app/slater/16118/43300.js?v=174009", "./slater_43300.js")
slater_js.gsub!("https://assets.slater.app/slater/16118/43480.js?v=677780", "./slater_43480.js")

File.write('js/slater.js', slater_js)
puts "js/slater.js updated with local files!"

# Check if downloaded JS files have further imports
puts "=== Checking for nested imports in downloaded JS files ==="
['js/slater_43416.js', 'js/slater_43300.js', 'js/slater_43480.js'].each do |file_path|
  if File.exist?(file_path)
    content = File.read(file_path)
    imports = content.scan(/import\(["']([^"']+)["']\)/)
    static_imports = content.scan(/import\s+.*?\s+from\s+["']([^"']+)["']/)
    all_imports = (imports + static_imports).flatten.uniq
    if all_imports.any?
      puts "File #{file_path} imports:"
      all_imports.each { |imp| puts "  - #{imp}" }
    else
      puts "File #{file_path} has NO nested imports."
    end
  end
end
