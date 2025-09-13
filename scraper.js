const https = require('https');
const http = require('http');

// Simple web scraper function
async function scrapeWebsite(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };

    const req = client.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          // Simple HTML parsing to extract content
          const title = data.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || 'No title found';
          
          // Extract text content (remove HTML tags)
          const textContent = data
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          
          // Extract meta description
          const metaDesc = data.match(/<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"']+)["\'][^>]*>/i)?.[1] || '';
          
          // Extract headings
          const headings = [];
          const h1Matches = data.match(/<h1[^>]*>([^<]+)<\/h1>/gi);
          if (h1Matches) {
            h1Matches.forEach(match => {
              const text = match.replace(/<[^>]+>/g, '').trim();
              if (text) headings.push(text);
            });
          }
          
          const result = {
            title: title.trim(),
            url: url,
            content: textContent.substring(0, 1000) + (textContent.length > 1000 ? '...' : ''),
            description: metaDesc,
            headings: headings.slice(0, 5), // First 5 headings
            source: urlObj.hostname,
            type: 'webpage',
            category: 'scraped_content',
            scraped_at: new Date().toISOString(),
            word_count: textContent.split(' ').length,
            status: res.statusCode
          };
          
          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to parse content: ${error.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });
    
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

module.exports = { scrapeWebsite };
