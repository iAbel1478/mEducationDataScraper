const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Store scraping status
let scrapingStatus = {
  isRunning: false,
  currentScraper: null,
  progress: 0,
  logs: []
};

// API Routes
app.get('/api/status', (req, res) => {
  res.json(scrapingStatus);
});

app.post('/api/scrape/:scraper', (req, res) => {
  const scraperType = req.params.scraper;
  
  if (scrapingStatus.isRunning) {
    return res.status(400).json({ error: 'Scraper is already running' });
  }

  // Reset status
  scrapingStatus = {
    isRunning: true,
    currentScraper: scraperType,
    progress: 0,
    logs: [`Starting ${scraperType} scraper...`]
  };

  // Determine which Python script to run
  let scriptName;
  switch (scraperType) {
    case 'simple':
      scriptName = 'simple_community_scraper.py';
      break;
    case 'education':
      scriptName = 'education_scraper.py';
      break;
    case 'meducation':
      scriptName = 'meducation_scraper.py';
      break;
    default:
      return res.status(400).json({ error: 'Invalid scraper type' });
  }

  // Check if Python script exists
  if (!fs.existsSync(scriptName)) {
    scrapingStatus.isRunning = false;
    return res.status(404).json({ error: `Script ${scriptName} not found` });
  }

  // Run Python scraper
  const pythonProcess = spawn('python3', [scriptName]);

  pythonProcess.stdout.on('data', (data) => {
    const output = data.toString();
    scrapingStatus.logs.push(output.trim());
    scrapingStatus.progress = Math.min(scrapingStatus.progress + 10, 90);
  });

  pythonProcess.stderr.on('data', (data) => {
    const error = data.toString();
    scrapingStatus.logs.push(`Error: ${error.trim()}`);
  });

  pythonProcess.on('close', (code) => {
    scrapingStatus.isRunning = false;
    scrapingStatus.progress = 100;
    scrapingStatus.logs.push(`Scraper completed with code ${code}`);
  });

  res.json({ message: `${scraperType} scraper started successfully` });
});

app.get('/api/results', (req, res) => {
  const results = {};
  
  // Check for result files
  const resultFiles = [
    'simple_community_data.json',
    'simple_community_analysis.json',
    'education_data.json',
    'meducation_data.json'
  ];

  resultFiles.forEach(file => {
    if (fs.existsSync(file)) {
      try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        results[file] = data;
      } catch (error) {
        results[file] = { error: 'Failed to parse file' };
      }
    }
  });

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
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Educational Data Scraper Interface running on http://localhost:${PORT}`);
});