html_content = File.read('index.html')

puts "=== All script tags in order ==="
html_content.scan(/<script[^>]*>(.*?)<\/script>|<script[^>]+src="([^"]+)"/m).each do |match|
  inline = match[0]
  src = match[1]
  if src
    puts "External script: #{src}"
  else
    puts "Inline script (length: #{inline.length}):"
    puts "  " + inline.strip[0..120].gsub("\n", " ") + "..."
  end
end
