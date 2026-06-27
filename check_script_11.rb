html_content = File.read('index.html')

scripts = html_content.scan(/<script[^>]*>(.*?)<\/script>/m)
scripts.each_with_index do |script, idx|
  content = script[0]
  if content.include?('load2k')
    puts "=== index.html Script #{idx} ==="
    puts content
  end
end
