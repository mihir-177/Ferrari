html_content = File.read('index.html')

puts "=== Remote scripts ==="
html_content.scan(/<script[^>]+src="([^"]+)"/).each do |match|
  src = match[0]
  if src.start_with?('http') || src.start_with?('//')
    puts src
  end
end

puts "=== Remote links (stylesheets, icons, etc.) ==="
html_content.scan(/<link[^>]+href="([^"]+)"/).each do |match|
  href = match[0]
  if href.start_with?('http') || href.start_with?('//')
    puts href
  end
end

puts "=== Remote images ==="
html_content.scan(/<img[^>]+src="([^"]+)"/).each do |match|
  src = match[0]
  if src.start_with?('http') || src.start_with?('//')
    puts src
  end
end

puts "=== Remote source tags ==="
html_content.scan(/<source[^>]+src="([^"]+)"/).each do |match|
  src = match[0]
  if src.start_with?('http') || src.start_with?('//')
    puts src
  end
end
