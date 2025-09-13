const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const https = require('https');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('static'));

// Store scraping status
let scrapingStatus = {
  isRunning: false,
  currentUrl: null,
  progress: 0,
  logs: []
};

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

// API Routes
app.get('/api/status', (req, res) => {
  res.json(scrapingStatus);
});

app.post('/api/scrape/url', async (req, res) => {
  const { url } = req.body;
  
  if (scrapingStatus.isRunning) {
    return res.status(400).json({ error: 'Scraper is already running' });
  }

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Validate URL
  try {
    new URL(url);
  } catch (error) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  // Reset status
  scrapingStatus = {
    isRunning: true,
    currentUrl: url,
    progress: 0,
    logs: [`Starting to scrape: ${url}`]
  };

  res.json({ message: 'Scraper started successfully' });

  // Start scraping process
  try {
    scrapingStatus.progress = 25;
    scrapingStatus.logs.push('Connecting to website...');
    
    const scrapedData = await scrapeWebsite(url);
    
    scrapingStatus.progress = 75;
    scrapingStatus.logs.push('Processing content...');
    
    // Save results
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `scraped_data_${timestamp}.json`;
    
    fs.writeFileSync(filename, JSON.stringify([scrapedData], null, 2));
    
    scrapingStatus.progress = 100;
    scrapingStatus.logs.push(`Successfully scraped content from ${url}`);
    scrapingStatus.logs.push(`Found: ${scrapedData.title}`);
    scrapingStatus.logs.push(`Content length: ${scrapedData.content.length} characters`);
    scrapingStatus.logs.push(`Word count: ${scrapedData.word_count} words`);
    scrapingStatus.logs.push(`Data saved to: ${filename}`);
    scrapingStatus.isRunning = false;
    
  } catch (error) {
    scrapingStatus.progress = 100;
    scrapingStatus.logs.push(`Error: ${error.message}`);
    scrapingStatus.isRunning = false;
  }
});

app.get('/api/results', (req, res) => {
  const results = {};
  
  // Find all scraped data files
  const files = fs.readdirSync('.').filter(file => 
    file.startsWith('scraped_data_') && file.endsWith('.json')
  );
  
  // Get the most recent file
  if (files.length > 0) {
    const latestFile = files.sort().reverse()[0];
    try {
      const data = JSON.parse(fs.readFileSync(latestFile, 'utf8'));
      results[latestFile] = data;
    } catch (error) {
      results[latestFile] = { error: 'Failed to parse file' };
    }
  }

  res.json(results);
});

app.get('/api/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, filename);
  
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

// Export the app for Vercel
module.exports = app;

// Only start server if not in Vercel environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Educational Data Scraper Interface running on http://localhost:${PORT}`);
  });
}