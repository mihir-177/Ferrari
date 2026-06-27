require 'net/http'
require 'uri'
require 'fileutils'

# Create directories
FileUtils.mkdir_p('css')
FileUtils.mkdir_p('js')

# Active slater files from the webflow branch
files = {
  "https://slater.app/16118/43384.css?v=274437" => "css/slater_43384.css",
  "https://slater.app/16118/43416.js?v=501286" => "js/slater_43416.js",
  "https://slater.app/16118/43300.js?v=300739" => "js/slater_43300.js",
  "https://slater.app/16118/43480.js?v=552637" => "js/slater_43480.js"
}

# Download them
files.each do |url_str, local_path|
  uri = URI.parse(url_str)
  puts "Downloading active slater asset: #{url_str}..."
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

# Create the local js/slater.js file with correct local paths
local_slater_js_content = <<~JS
  // Locally generated slater file redirecting to downloaded files
  let paths = window.location.pathname.split('/');

  // css
  { 
    const link = document.createElement('link'); 
    link.rel = 'stylesheet'; 
    link.href = 'css/slater_43384.css'; 
    document.head.appendChild(link); 
  } 

  // loader
  import('./slater_43416.js');

  // vtec
  import('./slater_43300.js');

  // parallax
  import('./slater_43480.js');
JS

File.write('js/slater.js', local_slater_js_content)
puts "js/slater.js overwritten with local relative imports!"

# Update index.html Script 11 to load our local slater.js directly
html_content = File.read('index.html')
target_pattern = 'let src=window.location.host.includes("webflow.io")?"https://slater.app/16118.js":"https://assets.slater.app/slater/16118.js?v=1.0";load2k(src);'
replacement = 'load2k("js/slater.js");'

if html_content.include?(target_pattern)
  html_content.gsub!(target_pattern, replacement)
  File.write('index.html', html_content)
  puts "index.html updated to load local js/slater.js!"
else
  # Let's do a more generic replacement if the text is formatted differently
  puts "Target pattern not found exactly. Trying regex replace..."
  updated_content = html_content.gsub(/let src=.*?load2k\(src\);/, 'load2k("js/slater.js");')
  File.write('index.html', updated_content)
  puts "index.html regex replace complete!"
end
