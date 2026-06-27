html_content = File.read('index.html')

scripts = html_content.scan(/<script[^>]*>(.*?)<\/script>/m)
scripts.each_with_index do |script, idx|
  content = script[0]
  if content.include?('.loader') || content.include?('loader') || content.include?('load-overlay')
    puts "=== Script #{idx} (length: #{content.length}) ==="
    puts content
    puts "============================================="
  end
end
